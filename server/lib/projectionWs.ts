import type { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { mutateStore, loadStore } from './store.js';
import {
  buildLabStatus,
  clearLiveSeats,
  disconnectAllLabSeats,
  findFreeSeat,
  labSummary,
  reconnectAllLabSeats,
  registerLabSeat,
  releaseLabSeat,
} from './labTerminals.js';

export type ProjectionMessage =
  | { type: 'projection_update'; hotspotId: string; active: boolean; updatedAt: number }
  | { type: 'sync'; hotspotId: string; active: boolean; updatedAt: number }
  | {
      type: 'lab_status';
      terminals: ReturnType<typeof buildLabStatus>;
      summary: ReturnType<typeof labSummary>;
    }
  | { type: 'reconnect_request'; at: number }
  | { type: 'hello_ack'; seat?: number; name?: string; role: 'teacher' | 'student' };

type ClientMeta = {
  role?: 'teacher' | 'student';
  seat?: number;
  name?: string;
};

const clientMeta = new WeakMap<WebSocket, ClientMeta>();

let wss: WebSocketServer | null = null;

function broadcast(message: ProjectionMessage, except?: WebSocket) {
  if (!wss) return;
  const payload = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function broadcastLabStatus() {
  const terminals = buildLabStatus();
  const message: ProjectionMessage = {
    type: 'lab_status',
    terminals,
    summary: labSummary(terminals),
  };
  broadcast(message);
}

function syncLiveSeatsFromClients() {
  clearLiveSeats();
  if (!wss) return;
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    const meta = clientMeta.get(client);
    if (meta?.role === 'student' && meta.seat) {
      registerLabSeat(meta.seat);
    }
  }
}

function sendReconnectRequest() {
  if (!wss) return;
  const payload = JSON.stringify({
    type: 'reconnect_request',
    at: Date.now(),
  } satisfies ProjectionMessage);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function attachProjectionWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws/projection' });

  wss.on('connection', (ws) => {
    const store = loadStore();
    clientMeta.set(ws, {});

    ws.send(
      JSON.stringify({
        type: 'sync',
        hotspotId: store.projection.hotspotId,
        active: store.projection.active ?? false,
        updatedAt: store.projection.updatedAt,
      } satisfies ProjectionMessage),
    );
    broadcastLabStatus();

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          type?: string;
          hotspotId?: string;
          active?: boolean;
          role?: 'teacher' | 'student';
          seat?: number;
          name?: string;
        };

        if (msg.type === 'hello') {
          const meta: ClientMeta = {
            role: msg.role,
            name: msg.name,
          };
          if (msg.role === 'student') {
            let seat = msg.seat;
            if (!seat || seat < 1 || seat > 30) {
              seat = findFreeSeat() ?? undefined;
            }
            if (seat) {
              meta.seat = seat;
              registerLabSeat(seat);
            }
          }
          clientMeta.set(ws, meta);
          ws.send(
            JSON.stringify({
              type: 'hello_ack',
              seat: meta.seat,
              name: meta.name,
              role: msg.role ?? 'student',
            } satisfies ProjectionMessage),
          );
          broadcastLabStatus();
          return;
        }

        if (msg.type !== 'projection_update' || !msg.hotspotId) return;

        const updatedAt = Date.now();
        mutateStore((s) => {
          s.projection = {
            hotspotId: msg.hotspotId!,
            active: msg.active ?? false,
            updatedAt,
          };
        });

        const out: ProjectionMessage = {
          type: 'projection_update',
          hotspotId: msg.hotspotId,
          active: msg.active ?? false,
          updatedAt,
        };
        broadcast(out, ws);
        ws.send(JSON.stringify(out));
      } catch {
        /* ignore malformed */
      }
    });

    ws.on('close', () => {
      const meta = clientMeta.get(ws);
      if (meta?.role === 'student' && meta.seat) {
        releaseLabSeat(meta.seat);
        broadcastLabStatus();
      }
      clientMeta.delete(ws);
    });
  });

  console.log('WebSocket projection sync: ws://host/ws/projection');
}

export function broadcastProjection(hotspotId: string, active: boolean) {
  const updatedAt = Date.now();
  mutateStore((s) => {
    s.projection = { hotspotId, active, updatedAt };
  });
  if (!active) {
    disconnectAllLabSeats();
    broadcastLabStatus();
  }
  broadcast({
    type: 'projection_update',
    hotspotId,
    active,
    updatedAt,
  });
}

export function getLabStatusPayload() {
  const terminals = buildLabStatus();
  return { terminals, summary: labSummary(terminals) };
}

export function refreshLabConnections() {
  return new Promise<ReturnType<typeof getLabStatusPayload>>((resolve) => {
    syncLiveSeatsFromClients();
    sendReconnectRequest();

    setTimeout(() => {
      syncLiveSeatsFromClients();
      reconnectAllLabSeats();
      const payload = getLabStatusPayload();
      broadcast({
        type: 'lab_status',
        terminals: payload.terminals,
        summary: payload.summary,
      });
      resolve(payload);
    }, 900);
  });
}
