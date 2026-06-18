export type LabTerminal = {
  seat: number;
  label: string;
  connected: boolean;
};

export type LabSummary = {
  total: number;
  connected: number;
  offline: LabTerminal[];
};

export const LAB_SEAT_COUNT = 30;

export function machineCode(seat: number) {
  return `M-${seat}`;
}
