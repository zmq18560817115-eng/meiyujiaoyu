export const LAB_SEAT_COUNT = 30;

/** 无真实在线时，默认离线座位（便于演示排查） */
export const DEMO_OFFLINE_SEATS = new Set([7, 15, 26]);

export type LabTerminalRecord = {
  seat: number;
  label: string;
  connected: boolean;
};

type LiveSeat = { lastSeen: number };

const liveSeats = new Map<number, LiveSeat>();

export function machineCode(seat: number) {
  return `M-${seat}`;
}

export function registerLabSeat(seat: number) {
  if (seat < 1 || seat > LAB_SEAT_COUNT) return;
  liveSeats.set(seat, { lastSeen: Date.now() });
}

export function releaseLabSeat(seat: number) {
  liveSeats.delete(seat);
}

export function clearLiveSeats() {
  liveSeats.clear();
}

export function hasLiveSeats() {
  return liveSeats.size > 0;
}

export function findFreeSeat(): number | null {
  for (let i = 1; i <= LAB_SEAT_COUNT; i++) {
    if (!liveSeats.has(i)) return i;
  }
  return null;
}

export function buildLabStatus(): LabTerminalRecord[] {
  const hasLive = liveSeats.size > 0;

  return Array.from({ length: LAB_SEAT_COUNT }, (_, i) => {
    const seat = i + 1;
    const label = machineCode(seat);
    const live = liveSeats.has(seat);

    if (live) {
      return { seat, label, connected: true };
    }

    if (hasLive) {
      return { seat, label, connected: false };
    }

    return {
      seat,
      label,
      connected: !DEMO_OFFLINE_SEATS.has(seat),
    };
  });
}

export function labSummary(terminals: LabTerminalRecord[]) {
  const connected = terminals.filter((t) => t.connected).length;
  const offline = terminals.filter((t) => !t.connected);
  return { total: LAB_SEAT_COUNT, connected, offline };
}

/** 教师刷新时：30 座全部上线 */
export function reconnectAllLabSeats() {
  for (let seat = 1; seat <= LAB_SEAT_COUNT; seat++) {
    registerLabSeat(seat);
  }
}

/** 关闭投屏时：清空全部连接 */
export function disconnectAllLabSeats() {
  clearLiveSeats();
}
