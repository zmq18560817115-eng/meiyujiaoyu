import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "../api/client";
import type { LabSummary, LabTerminal } from "../types/lab";

export type ProjectionState = {
  hotspotId: string;
  active: boolean;
  updatedAt: number;
};

type Role = "teacher" | "student" | "none";

type ProjectionSyncOptions = {
  studentName?: string;
  onLabStatus?: (terminals: LabTerminal[], summary: LabSummary) => void;
};

const LAB_SEAT_KEY = "qingqiang_lab_seat";

function readStoredSeat(): number | undefined {
  const raw = sessionStorage.getItem(LAB_SEAT_KEY);
  if (!raw) return undefined;
  const seat = Number(raw);
  return seat >= 1 && seat <= 30 ? seat : undefined;
}

function storeSeat(seat?: number) {
  if (seat && seat >= 1 && seat <= 30) {
    sessionStorage.setItem(LAB_SEAT_KEY, String(seat));
  }
}

export function useProjectionSync(
  role: Role,
  options: ProjectionSyncOptions = {},
) {
  const { studentName, onLabStatus } = options;
  const [projection, setProjection] = useState<ProjectionState>({
    hotspotId: "gate",
    active: false,
    updatedAt: 0,
  });
  const [labTerminals, setLabTerminals] = useState<LabTerminal[]>([]);
  const [labSummary, setLabSummary] = useState<LabSummary | null>(null);
  const [labRefreshing, setLabRefreshing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onLabStatusRef = useRef(onLabStatus);
  const studentNameRef = useRef(studentName);
  const studentSeatRef = useRef<number | undefined>(readStoredSeat());
  onLabStatusRef.current = onLabStatus;
  studentNameRef.current = studentName;

  const sendStudentHello = useCallback((ws: WebSocket) => {
    ws.send(
      JSON.stringify({
        type: "hello",
        role: "student",
        name: studentNameRef.current || "学生端",
        seat: studentSeatRef.current,
      }),
    );
  }, []);

  const sendTeacherHello = useCallback((ws: WebSocket) => {
    ws.send(JSON.stringify({ type: "hello", role: "teacher" }));
  }, []);

  const connect = useCallback(() => {
    if (role === "none") return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws/projection`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      if (role === "student") sendStudentHello(ws);
      else if (role === "teacher") sendTeacherHello(ws);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ProjectionState & {
          type?: string;
          terminals?: LabTerminal[];
          summary?: LabSummary;
          seat?: number;
        };

        if (msg.type === "reconnect_request" && role === "student") {
          sendStudentHello(ws);
          return;
        }

        if (msg.type === "hello_ack" && role === "student" && msg.seat) {
          studentSeatRef.current = msg.seat;
          storeSeat(msg.seat);
          return;
        }

        if (msg.type === "lab_status" && msg.terminals && msg.summary) {
          setLabTerminals(msg.terminals);
          setLabSummary(msg.summary);
          onLabStatusRef.current?.(msg.terminals, msg.summary);
          return;
        }

        if (msg.hotspotId) {
          setProjection({
            hotspotId: msg.hotspotId,
            active: msg.active ?? false,
            updatedAt: msg.updatedAt ?? Date.now(),
          });
        }
      } catch {
        /* ignore */
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setTimeout(connect, 2500);
    };
  }, [role, sendStudentHello, sendTeacherHello]);

  const applyLabPayload = useCallback(
    (data: { terminals: LabTerminal[]; summary: LabSummary }) => {
      setLabTerminals(data.terminals);
      setLabSummary(data.summary);
      onLabStatusRef.current?.(data.terminals, data.summary);
      return data;
    },
    [],
  );

  const refreshLabStatus = useCallback(async () => {
    if (role !== "teacher") return null;
    setLabRefreshing(true);
    try {
      const data = await api.panorama.labRefresh();
      return applyLabPayload(data);
    } catch {
      try {
        const data = await api.panorama.labStatus();
        return applyLabPayload(data);
      } catch {
        return null;
      }
    } finally {
      setLabRefreshing(false);
    }
  }, [role, applyLabPayload]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  useEffect(() => {
    if (role === "teacher") {
      api.panorama
        .labStatus()
        .then(applyLabPayload)
        .catch(() => {});
    }
  }, [role, applyLabPayload]);

  const broadcastProjection = useCallback(
    (hotspotId: string, active: boolean) => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ type: "projection_update", hotspotId, active }),
        );
      }
      setProjection({ hotspotId, active, updatedAt: Date.now() });
    },
    [],
  );

  return {
    projection,
    broadcastProjection,
    setProjection,
    labTerminals,
    labSummary,
    labRefreshing,
    refreshLabStatus,
  };
}
