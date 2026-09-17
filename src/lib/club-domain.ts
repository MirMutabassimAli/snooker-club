export type SessionChargeInput =
  | { kind: "snooker"; rate: number; durationSeconds: number }
  | { kind: "egame"; rate: number; unitMinutes: number; durationSeconds: number };

export type TableStatus = "available" | "occupied" | "maintenance";

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function calculateSessionCharge(input: SessionChargeInput): number {
  if (input.kind === "snooker") {
    return input.rate;
  }

  const unitSeconds = input.unitMinutes * 60;
  const billableUnits = Math.max(1, Math.ceil(input.durationSeconds / unitSeconds));
  return billableUnits * input.rate;
}

export function getTableSummary(tables: Array<{ status: TableStatus }>) {
  return tables.reduce(
    (summary, table) => ({ ...summary, [table.status]: summary[table.status] + 1 }),
    { available: 0, occupied: 0, maintenance: 0 } satisfies Record<TableStatus, number>,
  );
}
