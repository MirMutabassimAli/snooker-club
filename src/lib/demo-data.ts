export type ViewId = "dashboard" | "tables" | "egames" | "canteen" | "billing" | "reports" | "admin";
export type SessionKind = "snooker" | "egame";
export type TableState = "available" | "occupied" | "maintenance";

export type Session = {
  id: string;
  player: string;
  kind: SessionKind;
  activity: string;
  resource: string;
  startedAt: string;
  elapsedSeconds: number;
  amount: number;
};

export type ClubTable = {
  id: string;
  status: TableState;
  player?: string;
  elapsed?: string;
};

export type Player = {
  id: string;
  name: string;
  phone: string;
  visits: number;
  lastActivity: string;
  openBill: number;
  active: boolean;
};

export type Bill = {
  id: string;
  player: string;
  tableId?: string;
  phone?: string;
  address?: string;
  itemCount: number;
  updated: string;
  total: number;
  status: "unpaid" | "paid";
};

export const initialSessions: Session[] = [
  { id: "s-01", player: "Ahmed Khan", kind: "snooker", activity: "Singles", resource: "Table 03", startedAt: "06:21 PM", elapsedSeconds: 2538, amount: 500 },
  { id: "s-02", player: "Bilal Raza", kind: "egame", activity: "FIFA", resource: "Console 02", startedAt: "06:35 PM", elapsedSeconds: 1662, amount: 1000 },
  { id: "s-03", player: "Hamza Ali", kind: "snooker", activity: "Doubles", resource: "Table 02", startedAt: "06:44 PM", elapsedSeconds: 1089, amount: 800 },
];

export const initialTables: ClubTable[] = [
  { id: "01", status: "available" },
  { id: "02", status: "occupied", player: "Hamza Ali", elapsed: "00:18" },
  { id: "03", status: "occupied", player: "Ahmed Khan", elapsed: "00:42" },
  { id: "04", status: "available" },
  { id: "05", status: "maintenance" },
  { id: "06", status: "available" },
];

export const players: Player[] = [
  { id: "p-01", name: "Ahmed Khan", phone: "0300 442 1188", visits: 18, lastActivity: "Playing now", openBill: 2150, active: true },
  { id: "p-02", name: "Bilal Raza", phone: "0312 887 2460", visits: 9, lastActivity: "Playing now", openBill: 1700, active: true },
  { id: "p-03", name: "Hamza Ali", phone: "0334 201 9775", visits: 12, lastActivity: "Playing now", openBill: 800, active: true },
  { id: "p-04", name: "Usman Tariq", phone: "0301 981 6304", visits: 31, lastActivity: "Yesterday", openBill: 3350, active: false },
  { id: "p-05", name: "Saad Iqbal", phone: "0321 740 2231", visits: 6, lastActivity: "15 Sep", openBill: 0, active: false },
  { id: "p-06", name: "Rayan Malik", phone: "0308 553 9012", visits: 14, lastActivity: "14 Sep", openBill: 0, active: false },
];

export const initialBills: Bill[] = [
  { id: "SC-1048", player: "Ahmed Khan", tableId: "03", itemCount: 3, updated: "Just now", total: 2150, status: "unpaid" },
  { id: "SC-1049", player: "Bilal Raza", tableId: "02", itemCount: 2, updated: "4 min ago", total: 1700, status: "unpaid" },
  { id: "SC-1050", player: "Hamza Ali", itemCount: 1, updated: "18 min ago", total: 800, status: "unpaid" },
  { id: "SC-1051", player: "Usman Tariq", itemCount: 4, updated: "22 min ago", total: 3350, status: "unpaid" },
];

export const menuItems = [
  { id: "drink", name: "Cold drink", price: 150 },
  { id: "water", name: "Water", price: 100 },
  { id: "chips", name: "Chips", price: 120 },
  { id: "burger", name: "Burger", price: 350 },
];

export const navItems: Array<{ id: ViewId; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "tables", label: "Tables" },
  { id: "egames", label: "E-games" },
  { id: "canteen", label: "Canteen" },
  { id: "billing", label: "Pay Later" },
  { id: "reports", label: "Reports" },
];
