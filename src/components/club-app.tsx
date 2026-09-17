"use client";

import {
  BarChart3,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Cookie,
  CupSoda,
  Droplets,
  Gamepad2,
  LayoutGrid,
  Menu,
  Plus,
  ReceiptText,
  Sandwich,
  Settings2,
  ShoppingBag,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ActionModal } from "@/components/action-modal";
import { BrandMark } from "@/components/brand-mark";
import { IntroOverlay } from "@/components/intro-overlay";
import {
  initialBills,
  initialSessions,
  initialTables,
  menuItems,
  navItems,
  type Bill,
  type ClubTable,
  type Session,
  type SessionKind,
  type ViewId,
} from "@/lib/demo-data";
import { formatDuration } from "@/lib/club-domain";

const iconByView: Record<ViewId, typeof LayoutGrid> = {
  dashboard: LayoutGrid,
  tables: Clock3,
  egames: Gamepad2,
  canteen: ShoppingBag,
  billing: ReceiptText,
  reports: BarChart3,
  admin: Settings2,
};

type ModalId = "start" | "continue" | "pay-later" | "checkout" | "order" | null;
type Toast = { id: number; title: string; detail: string };
type GamePrice = { id: string; name: string; price: number };

const money = (value: number) => `Rs ${value.toLocaleString("en-PK")}`;
const defaultGamePrices: GamePrice[] = [
  { id: "single", name: "Single", price: 500 },
  { id: "double", name: "Double", price: 800 },
  { id: "8-ball", name: "8-ball", price: 600 },
  { id: "snooker", name: "Snooker", price: 700 },
];

const pageCopy: Record<ViewId, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: "Home", title: "Dashboard", description: "Choose a table or game to get started." },
  tables: { eyebrow: "Pool tables", title: "Tables", description: "Allot a free table or finish a running game." },
  egames: { eyebrow: "Games", title: "E-games", description: "Start a game on a console or computer." },
  canteen: { eyebrow: "Food and drinks", title: "Canteen", description: "Add a snack or drink to an open bill." },
  billing: { eyebrow: "Payments", title: "Pay Later", description: "See customers who still need to pay." },
  reports: { eyebrow: "Reports", title: "Today at a glance", description: "Check revenue and club activity for today." },
  admin: { eyebrow: "Settings", title: "Club settings", description: "Manage tables, prices, menu items and staff." },
};

export function ClubApp({ skipIntro = false }: { skipIntro?: boolean }) {
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<ViewId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [introVisible, setIntroVisible] = useState(!skipIntro);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [tables, setTables] = useState<ClubTable[]>(initialTables);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [modal, setModal] = useState<ModalId>(null);
  const [sessionMode, setSessionMode] = useState<SessionKind>("snooker");
  const [bookingName, setBookingName] = useState("Guest");
  const [selectedTable, setSelectedTable] = useState("01");
  const [selectedResource, setSelectedResource] = useState("Console 01");
  const [selectedTableForOrder, setSelectedTableForOrder] = useState("01");
  const [selectedGame, setSelectedGame] = useState("FIFA");
  const [orderBill, setOrderBill] = useState(initialBills[0].id);
  const [orderItem, setOrderItem] = useState(menuItems[0].id);
  const [orderQty, setOrderQty] = useState(1);
  const [checkoutBill, setCheckoutBill] = useState(initialBills[0].id);
  const [clock, setClock] = useState<Date | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [poolGame, setPoolGame] = useState("Snooker");
  const [gamePrices, setGamePrices] = useState<GamePrice[]>(defaultGamePrices);
  const [payLaterName, setPayLaterName] = useState("");
  const [payLaterPhone, setPayLaterPhone] = useState("");
  const [payLaterAddress, setPayLaterAddress] = useState("");
  const [tableCount, setTableCount] = useState(initialTables.length);

  useEffect(() => {
    if (skipIntro || reducedMotion) return;
    const timer = window.setTimeout(() => setIntroVisible(false), 2050);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, skipIntro]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
      setSessions((current) => current.map((session) => ({ ...session, elapsedSeconds: session.elapsedSeconds + 1 })));
    }, 1000);
    const raf = window.requestAnimationFrame(() => setClock(new Date()));
    return () => {
      window.clearInterval(timer);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const openBills = bills.filter((bill) => bill.status === "unpaid");
  const selectedMenuItem = menuItems.find((item) => item.id === orderItem) ?? menuItems[0];
  const selectedBill = bills.find((bill) => bill.id === checkoutBill) ?? bills[0];

  function notify(title: string, detail: string) {
    const id = Date.now();
    setToasts((current) => [...current, { id, title, detail }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
  }

  function navigate(nextView: ViewId) {
    setView(nextView);
    setSidebarOpen(false);
  }

  function openSession(kind: SessionKind, tableId?: string) {
    setSessionMode(kind);
    if (kind === "snooker" && tableId) setSelectedTable(tableId);
    if (kind === "egame" && tableId) setSelectedResource(tableId);
    setModal("start");
  }

  function startSession() {
    const now = new Date();
    const id = `s-${Date.now()}`;

    if (sessionMode === "snooker") {
      const table = tables.find((item) => item.id === selectedTable && item.status === "available");
      if (!table) {
        notify("No table available", "Choose another open table before starting.");
        return;
      }
      const selectedPrice = gamePrices.find((game) => game.name === poolGame)?.price ?? 500;
      const nextSession: Session = {
        id,
        player: bookingName.trim() || "Guest",
        kind: "snooker",
        activity: poolGame,
        resource: `Table ${selectedTable}`,
        startedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        elapsedSeconds: 0,
        amount: selectedPrice,
      };
      setSessions((current) => [...current, nextSession]);
      setTables((current) => current.map((item) => item.id === selectedTable ? { ...item, status: "occupied", player: bookingName.trim() || "Guest", elapsed: "00:00" } : item));
      notify("Table booked", `${bookingName.trim() || "Guest"} · Table ${selectedTable}`);
    } else {
      const nextSession: Session = {
        id,
        player: bookingName.trim() || "Guest",
        kind: "egame",
        activity: selectedGame,
        resource: selectedResource,
        startedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        elapsedSeconds: 0,
        amount: 500,
      };
      setSessions((current) => [...current, nextSession]);
      notify("Game started", `${bookingName.trim() || "Guest"} · ${selectedGame}`);
    }
    setModal(modal === "continue" ? "continue" : null);
  }

  function openContinue(tableId: string) {
    setSelectedTableForOrder(tableId);
    setOrderBill(bills.find((bill) => bill.tableId === tableId && bill.status === "unpaid")?.id ?? "");
    setModal("continue");
  }

  function openContinueSession(resource: string) {
    setSelectedTableForOrder(resource);
    setOrderBill(bills.find((bill) => bill.tableId === resource && bill.status === "unpaid")?.id ?? "");
    setModal("continue");
  }

  function tableSession(resource: string) {
    return sessions.find((session) => session.resource === (resource.startsWith("Table ") || resource.startsWith("Console ") ? resource : `Table ${resource}`));
  }

  function tableBill(tableId: string) {
    return bills.find((bill) => bill.tableId === tableId && bill.status === "unpaid");
  }

  function settleTable(payment: "now" | "later") {
    const session = tableSession(selectedTableForOrder);
    const bill = tableBill(selectedTableForOrder);
    const total = (bill?.total ?? 0) + (session?.amount ?? 0);
    if (payment === "later") {
      setModal("pay-later");
      return;
    }
    if (session) finishSession(session.id, bill?.id, total);
    if (bill) setBills((current) => current.map((item) => item.id === bill.id ? { ...item, status: "paid", total, updated: "Paid now" } : item));
    setModal(null);
    notify("Paid now", `Table ${selectedTableForOrder} is ready for another game.`);
  }

  function savePayLater() {
    const session = tableSession(selectedTableForOrder);
    const bill = tableBill(selectedTableForOrder);
    const name = payLaterName.trim();
    if (!name || !payLaterPhone.trim()) {
      notify("Name and phone required", "Add customer details before saving Pay Later.");
      return;
    }
    const total = (bill?.total ?? 0) + (session?.amount ?? 0);
    setBills((current) => [...current.filter((item) => item.id !== bill?.id), { id: bill?.id ?? `SC-${Date.now()}`, player: name, phone: payLaterPhone.trim(), address: payLaterAddress.trim() || undefined, tableId: selectedTableForOrder, itemCount: (bill?.itemCount ?? 0) + 1, updated: "Pay Later", total, status: "unpaid" }]);
    if (session) finishSession(session.id, undefined, total, false);
    setModal(null);
    setPayLaterName("");
    setPayLaterPhone("");
    setPayLaterAddress("");
    notify("Saved for Pay Later", `${name} · ${money(total)} added to the Bills panel.`);
  }

  function finishSession(id: string, existingBillId?: string, totalOverride?: number, addToBill = true) {
    const session = sessions.find((item) => item.id === id);
    if (!session) return;

    setSessions((current) => current.filter((item) => item.id !== id));
    if (session.kind === "snooker") {
      const tableId = session.resource.replace("Table ", "");
      setTables((current) => current.map((item) => item.id === tableId ? { id: item.id, status: "available" } : item));
    }
    if (addToBill) {
      setBills((current) => current.map((bill) => bill.id === existingBillId || (!existingBillId && bill.player === session.player && bill.status === "unpaid") ? { ...bill, itemCount: bill.itemCount + 1, total: totalOverride ?? bill.total + session.amount, updated: "Just now" } : bill));
    }
    if (!existingBillId && !addToBill) return;
    if (!existingBillId) notify("Game finished", `${session.player} · ${money(session.amount)} added to bill`);
  }

  function addOrder() {
    const total = selectedMenuItem.price * orderQty;
    setBills((current) => {
      if (orderBill) return current.map((bill) => bill.id === orderBill && bill.status === "unpaid" ? { ...bill, itemCount: bill.itemCount + orderQty, total: bill.total + total, updated: "Just now" } : bill);
      const id = `SC-${Date.now()}`;
      setOrderBill(id);
      return [...current, { id, player: bookingName.trim() || "Guest", tableId: selectedTableForOrder, itemCount: orderQty, updated: "Just now", total, status: "unpaid" }];
    });
    setModal(modal === "continue" ? "continue" : null);
    notify("Added to bill", `${orderQty} × ${selectedMenuItem.name} · ${money(total)}`);
  }

  function collectPayment() {
    if (!selectedBill) return;
    const session = selectedBill.tableId ? tableSession(selectedBill.tableId) : undefined;
    if (session) finishSession(session.id, selectedBill.id, selectedBill.total, false);
    setBills((current) => current.map((bill) => bill.id === selectedBill.id ? { ...bill, status: "paid", updated: "Paid now" } : bill));
    setModal(null);
    notify("Payment received", `Bill #${selectedBill.id} · ${money(selectedBill.total)}`);
  }

  function exportReport() {
    const payload = JSON.stringify({ generatedAt: new Date().toISOString(), revenue: 45800, expenses: 12500, profit: 33300 }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "snooker-club-daily-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Report exported", "Daily report saved as JSON.");
  }

  return (
    <div className="club-app">
      <IntroOverlay visible={introVisible} />
      <AmbientMotion />

      <motion.aside aria-hidden={modal !== null} className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`} initial={false}>
        <BrandMark className="sidebar-brand" />
        <p className="nav-kicker">Workspace</p>
        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = iconByView[item.id];
            const active = view === item.id;
            return (
              <button key={item.id} className={`nav-button ${active ? "nav-button--active" : ""}`} onClick={() => navigate(item.id)}>
                {active && <motion.i layoutId="active-nav" className="nav-active-bg" transition={{ type: "spring", stiffness: 420, damping: 35 }} />}
                <Icon size={17}/><span>{item.label}</span>
                {item.id === "tables" && <small>{sessions.length}</small>}
                {item.id === "billing" && <small>{openBills.length}</small>}
              </button>
            );
          })}
        </nav>
        <p className="nav-kicker nav-kicker--control">Control</p>
        <button className={`nav-button ${view === "admin" ? "nav-button--active" : ""}`} onClick={() => navigate("admin")}>
          {view === "admin" && <motion.i layoutId="active-nav" className="nav-active-bg"/>}
          <Settings2 size={17}/><span>Admin</span>
        </button>
        <div className="sidebar-spacer"/>
        <div className="shift-revenue"><span>Shift revenue</span><strong>Rs 8,450</strong></div>
        <div className="staff-card"><span className="avatar">MA</span><div><strong>Mir Ahmed</strong><small>Administrator</small></div></div>
      </motion.aside>

      <div className="app-main" aria-hidden={modal !== null}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen((open) => !open)}><Menu size={18}/></button>
            <span>Snooker Club</span><i>/</i><strong>{pageCopy[view].title}</strong>
          </div>
          <div className="topbar-actions">
            <time suppressHydrationWarning>{clock ? `${clock.toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short" })} · ${clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "\u2014"}</time>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={16}/><i/></button>
            <button className="secondary-button order-top" onClick={() => setModal("order")}><ShoppingBag size={15}/>Canteen</button>
            <button className="primary-button" onClick={() => openSession("snooker")}><Plus size={15}/>Book now</button>
          </div>
        </header>

        <main className="workspace">
          <AnimatePresence initial={false}>
            <motion.div
              key={view}
              className="page-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.22, 0.75, 0.24, 1] }}
            >
              <PageHeader view={view} sessionCount={sessions.length} onSession={() => openSession("snooker")} onCheckout={() => setModal("checkout")} onExport={exportReport}/>
              {view === "dashboard" && <DashboardView sessions={sessions} bills={bills} tableCount={tableCount}/>} 
              {view === "tables" && <TablesView tables={tables.slice(0, tableCount)} sessions={sessions} bills={bills} onStart={openSession} onContinue={openContinue}/>} 
              {view === "egames" && <EgamesView sessions={sessions} bills={bills} onStart={openSession} onContinue={openContinueSession}/>} 
              {view === "canteen" && <CanteenView onOrder={(itemId) => { setOrderItem(itemId); setModal("order"); }}/>} 
              {view === "billing" && <BillingView bills={bills} onCheckout={(id) => { setCheckoutBill(id); setModal("checkout"); }}/>} 
              {view === "reports" && <ReportsView/>}
              {view === "admin" && <AdminView notify={notify} tableCount={tableCount} gamePrices={gamePrices} onTableCountChange={(count) => { setTableCount(count); setTables((current) => Array.from({ length: count }, (_, index) => current[index] ?? { id: String(index + 1).padStart(2, "0"), status: "available" })); }} onPricesChange={setGamePrices}/>} 
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ActionModal open={modal === "start"} title="Start Game" onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={startSession}>Start Game</button></>}>
        <div className="field field--wide"><label>What would you like to book?</label><div className="segmented"><button className={sessionMode === "snooker" ? "active" : ""} onClick={() => setSessionMode("snooker")}>Pool table</button><button className={sessionMode === "egame" ? "active" : ""} onClick={() => setSessionMode("egame")}>E-game</button></div></div>
        <div className="field field--wide"><label htmlFor="booking-name">Name (optional)</label><input id="booking-name" value={bookingName} onChange={(event) => setBookingName(event.target.value)} placeholder="Guest" /></div>
        {sessionMode === "snooker" ? <><div className="field"><label htmlFor="pool-game">Choose a game</label><select id="pool-game" value={poolGame} onChange={(event) => setPoolGame(event.target.value)}>{gamePrices.map((game) => <option key={game.id}>{game.name}</option>)}</select></div><div className="field"><label htmlFor="table-select">Choose a table</label><select id="table-select" value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)}>{tables.filter((table) => table.status === "available").map((table) => <option key={table.id} value={table.id}>Table {table.id}</option>)}</select></div></> : <><div className="field"><label htmlFor="game-select">Choose a game</label><select id="game-select" value={selectedGame} onChange={(event) => setSelectedGame(event.target.value)}><option>FIFA</option><option>Tekken</option><option>Call of Duty</option><option>GTA V</option></select></div><div className="field"><label htmlFor="resource-select">Choose a PC or console</label><select id="resource-select" value={selectedResource} onChange={(event) => setSelectedResource(event.target.value)}><option>PC 01</option><option>PC 02</option><option>Console 01</option><option>Console 02</option></select></div></>}
        <div className="modal-note field--wide"><span>Billing rule</span><strong>{sessionMode === "snooker" ? "Fixed game rate" : "30-minute units · rounded up"}</strong></div>
      </ActionModal>

      <ActionModal open={modal === "continue"} title={`Continue ${selectedTableForOrder.startsWith("Table") || selectedTableForOrder.startsWith("Console") ? selectedTableForOrder : `Table ${selectedTableForOrder}`}`} onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => settleTable("later")}>Pay Later</button><button className="primary-button" onClick={() => settleTable("now")}>Pay Now</button></>}>
        <div className="continue-summary field--wide"><span>Current prize</span><strong>{money((tableBill(selectedTableForOrder)?.total ?? 0) + (tableSession(selectedTableForOrder)?.amount ?? 0))}</strong></div>
        <div className="field field--wide"><label>Add canteen products</label><CanteenProducts selected={orderItem} onSelect={(itemId) => { setOrderItem(itemId); setOrderBill(tableBill(selectedTableForOrder)?.id ?? ""); }}/></div>
        <div className="field"><label htmlFor="continue-qty">Quantity</label><input id="continue-qty" type="number" min="1" max="20" value={orderQty} onChange={(event) => setOrderQty(Math.max(1, Number(event.target.value)))} /></div>
        <button className="secondary-button continue-add" onClick={addOrder}><ShoppingBag size={16}/>Add selected item</button>
      </ActionModal>

      <ActionModal open={modal === "pay-later"} title="Pay Later details" onClose={() => setModal("continue")} footer={<><button className="secondary-button" onClick={() => setModal("continue")}>Back</button><button className="primary-button" onClick={savePayLater}>Save Pay Later</button></>}>
        <p className="modal-instruction field--wide">Save the customer details so the bill can be collected later.</p>
        <div className="field field--wide"><label htmlFor="later-name">Customer name</label><input id="later-name" value={payLaterName} onChange={(event) => setPayLaterName(event.target.value)} placeholder="Enter name" /></div>
        <div className="field field--wide"><label htmlFor="later-phone">Phone number</label><input id="later-phone" value={payLaterPhone} onChange={(event) => setPayLaterPhone(event.target.value)} placeholder="Enter phone number" /></div>
        <div className="field field--wide"><label htmlFor="later-address">Address (optional)</label><input id="later-address" value={payLaterAddress} onChange={(event) => setPayLaterAddress(event.target.value)} placeholder="Enter address" /></div>
      </ActionModal>

      <ActionModal open={modal === "order"} title="Add a canteen order" onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={addOrder}>Add to bill</button></>}>
        <div className="field field--wide"><label htmlFor="order-bill">Add to which bill?</label><select id="order-bill" value={orderBill} onChange={(event) => setOrderBill(event.target.value)}>{openBills.map((bill) => <option key={bill.id} value={bill.id}>{bill.player} — Table / game bill #{bill.id}</option>)}</select></div>
        <div className="field field--wide"><label>Choose a product</label><CanteenProducts selected={orderItem} onSelect={setOrderItem}/></div>
        <div className="field"><label htmlFor="order-qty">Quantity</label><input id="order-qty" type="number" min="1" max="20" value={orderQty} onChange={(event) => setOrderQty(Math.max(1, Number(event.target.value)))} /></div>
        <div className="modal-note field--wide"><span>Order total</span><strong>{money(selectedMenuItem.price * orderQty)}</strong></div>
      </ActionModal>

      <ActionModal open={modal === "checkout"} title="Settle bill" onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={collectPayment}>Confirm {selectedBill ? money(selectedBill.total) : "payment"}</button></>}>
        <div className="field field--wide"><label htmlFor="bill-select">Open bill</label><select id="bill-select" value={checkoutBill} onChange={(event) => setCheckoutBill(event.target.value)}>{openBills.map((bill) => <option key={bill.id} value={bill.id}>{bill.player} — #{bill.id}</option>)}</select></div>
        <div className="receipt-preview field--wide"><div><span>Snooker · Singles</span><strong>Rs 500</strong></div><div><span>E-game · FIFA</span><strong>Rs 1,000</strong></div><div><span>Canteen</span><strong>Rs 650</strong></div></div>
        <div className="modal-note field--wide"><span>Grand total</span><strong>{selectedBill ? money(selectedBill.total) : "—"}</strong></div>
        <div className="field field--wide"><label>Payment method</label><div className="segmented"><button className="active">Cash</button><button>Card / wallet</button></div></div>
      </ActionModal>

      <div className="toast-stack" aria-live="polite">
        <AnimatePresence>{toasts.map((toast) => <motion.div key={toast.id} className="toast" initial={{ opacity: 0, x: 25, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 18 }}><i/><div><strong>{toast.title}</strong><span>{toast.detail}</span></div></motion.div>)}</AnimatePresence>
      </div>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}/>} 
    </div>
  );
}

function AmbientMotion() {
  const reducedMotion = useReducedMotion();
  return <div className="ambient-layer" aria-hidden="true"><motion.i className="ambient-orb ambient-orb--one" animate={reducedMotion ? undefined : { x: [0, 80, 0], y: [0, 35, 0], opacity: [.12, .2, .12] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}/><motion.i className="ambient-orb ambient-orb--two" animate={reducedMotion ? undefined : { x: [0, -60, 0], y: [0, -30, 0], opacity: [.06, .13, .06] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}/></div>;
}

function PageHeader({ view, sessionCount, onSession, onCheckout, onExport }: { view: ViewId; sessionCount: number; onSession: () => void; onCheckout: () => void; onExport: () => void }) {
  const copy = pageCopy[view];
  return <div className="page-header"><div><p>{copy.eyebrow}</p><h1>{copy.title}</h1><span>{view === "dashboard" ? `${sessionCount} games are running now. ${copy.description}` : copy.description}</span></div><div className="page-header-actions">{(view === "dashboard" || view === "tables" || view === "egames") && <button className="primary-button" onClick={onSession}><Plus size={15}/>Book now</button>}{view === "billing" && <button className="primary-button" onClick={onCheckout}><CircleDollarSign size={15}/>Collect payment</button>}{view === "reports" && <button className="secondary-button" onClick={onExport}>Export report</button>}{view === "admin" && <span className="status-pill status-pill--green">Admin access</span>}</div></div>;
}

function DashboardView({ sessions, bills, tableCount }: { sessions: Session[]; bills: Bill[]; tableCount: number }) {
  const runningTables = sessions.filter((session) => session.kind === "snooker").length;
  const runningGames = sessions.filter((session) => session.kind === "egame").length;
  const unpaid = bills.filter((bill) => bill.status === "unpaid");
  return <div className="dashboard-summary"><section className="welcome-panel"><p>Today</p><h2>Welcome to the club desk</h2><span>Use Tables or E-games to start and manage play.</span></section><div className="summary-grid"><SummaryCard icon={LayoutGrid} label="Tables" value={String(tableCount)} detail={`${runningTables} games running`}/><SummaryCard icon={Gamepad2} label="E-games" value={String(runningGames)} detail="games running now"/><SummaryCard icon={ReceiptText} label="Pay Later" value={String(unpaid.length)} detail="customers to collect"/><SummaryCard icon={ShoppingBag} label="Canteen" value="+" detail="add food or drinks"/></div><section className="dashboard-help"><h2>What do you want to do?</h2><div><span>1</span><strong>Open Tables</strong><small>Choose a table and start a pool game.</small></div><div><span>2</span><strong>Open E-games</strong><small>Choose a PC or console and start playing.</small></div><div><span>3</span><strong>Open Pay Later</strong><small>Collect money from previous games.</small></div></section></div>;
}

function TablesView({ tables, sessions, bills, onStart, onContinue }: { tables: ClubTable[]; sessions: Session[]; bills: Bill[]; onStart: (kind: SessionKind, resource?: string) => void; onContinue: (resource: string) => void }) {
  return <ResourceBoard title="All tables" description="Start a pool game or continue a running table." resources={tables.map((table) => ({ resource: `Table ${table.id}`, state: table.status, activeSession: sessions.find((session) => session.resource === `Table ${table.id}`), bill: bills.find((bill) => bill.tableId === table.id && bill.status === "unpaid") }))} onStart={(resource) => onStart("snooker", resource.replace("Table ", ""))} onContinue={onContinue}/>;
}

function EgamesView({ sessions, bills, onStart, onContinue }: { sessions: Session[]; bills: Bill[]; onStart: (kind: SessionKind, resource?: string) => void; onContinue: (resource: string) => void }) {
  const resources = ["PC 01", "PC 02", "Console 01", "Console 02"].map((resource) => ({ resource, state: "available" as const, activeSession: sessions.find((session) => session.resource === resource), bill: bills.find((bill) => bill.tableId === resource && bill.status === "unpaid") }));
  return <ResourceBoard title="PCs and consoles" description="Start an e-game or continue a running PC or console." resources={resources} onStart={(resource) => onStart("egame", resource)} onContinue={onContinue}/>;
}

function ResourceBoard({ title, description, resources, onStart, onContinue }: { title: string; description: string; resources: Array<{ resource: string; state: ClubTable["status"]; activeSession?: Session; bill?: Bill }>; onStart: (resource: string) => void; onContinue: (resource: string) => void }) {
  return <section className="table-board"><header className="table-board-header"><div><p>Choose a resource</p><h2>{title}</h2><span>{description}</span></div><span className="table-count">{resources.length} available</span></header><div className="table-card-grid">{resources.map((item, index) => <ResourceCard key={item.resource} item={item} index={index} onStart={onStart} onContinue={onContinue}/>)}</div></section>;
}

function ResourceCard({ item, index, onStart, onContinue }: { item: { resource: string; state: ClubTable["status"]; activeSession?: Session; bill?: Bill }; index: number; onStart: (resource: string) => void; onContinue: (resource: string) => void }) {
  const active = Boolean(item.activeSession);
  const total = (item.bill?.total ?? 0) + (item.activeSession?.amount ?? 0);
  return <motion.article className={`table-card ${active ? "table-card--active" : ""}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }}><div className="table-card-top"><div><span className="table-number">{item.resource}</span><span className={`table-state table-state--${active ? "active" : item.state}`}>{active ? "Game running" : item.state === "maintenance" ? "Unavailable" : "Free"}</span></div><span className="table-light"/></div>{active && item.activeSession ? <><div className="table-game"><strong>{item.activeSession.activity}</strong><span>{item.activeSession.player}</span></div><div className="table-timer">{formatDuration(item.activeSession.elapsedSeconds)}</div><div className="table-price"><span>Prize</span><strong>{money(total)}</strong></div><div className="table-card-actions"><button className="secondary-button" onClick={() => onContinue(item.resource)}>Continue</button><button className="text-button" onClick={() => onContinue(item.resource)}>Add canteen</button></div></> : <><div className="empty-table"><span>{item.state === "maintenance" ? "Not available" : "Ready for the next game"}</span></div><div className="table-price"><span>Prize</span><strong>{money(0)}</strong></div><button className="primary-button table-start-button" disabled={item.state === "maintenance"} onClick={() => onStart(item.resource)}>Start Game</button></>}</motion.article>;
}

function SummaryCard({ icon: Icon, label, value, detail }: { icon: typeof LayoutGrid; label: string; value: string; detail: string }) {
  return <article className="summary-card"><Icon size={24}/><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

const canteenIcons: Record<string, typeof CupSoda> = { drink: CupSoda, water: Droplets, chips: Cookie, burger: Sandwich };

function CanteenProducts({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return <div className="canteen-products">{menuItems.map((item) => { const Icon = canteenIcons[item.id] ?? Cookie; return <button type="button" className={`product-button ${selected === item.id ? "product-button--selected" : ""}`} key={item.id} onClick={() => onSelect(item.id)}><Icon size={25}/><strong>{item.name}</strong><span>{money(item.price)}</span></button>; })}</div>;
}

function CanteenView({ onOrder }: { onOrder: (itemId: string) => void }) {
  return <div className="canteen-page"><div className="canteen-intro"><ShoppingBag size={34}/><div><h2>Choose something to add</h2><p>Pick a product, then choose the table or game bill.</p></div></div><CanteenProducts selected="" onSelect={onOrder}/></div>;
}

function BillingView({ bills, onCheckout }: { bills: Bill[]; onCheckout: (id: string) => void }) {
  const visible = bills.filter((bill) => bill.status === "unpaid");
  return <div className="billing-grid"><DataPanel title="Pay Later bills" action={<span className="status-pill status-pill--red">{visible.length} unpaid</span>}><div className="pay-later-list">{visible.map((bill) => <article key={bill.id}><div><strong>{bill.player}</strong><span>{bill.phone || "No phone saved"} · {bill.tableId || "Front desk"}</span>{bill.address && <small>{bill.address}</small>}</div><strong>{money(bill.total)}</strong><button className="primary-button" onClick={() => onCheckout(bill.id)}>Pay now</button></article>)}</div></DataPanel><ReceiptCard bill={visible[0]} onCheckout={onCheckout}/></div>;
}

function ReceiptCard({ bill, onCheckout }: { bill?: Bill; onCheckout: (id: string) => void }) {
  if (!bill) return <section className="receipt-card"><p>All bills are settled.</p></section>;
  return <section className="receipt-card"><header><div><h3>{bill.player}</h3><span>Bill #{bill.id} · Open</span></div><span className="status-pill status-pill--red">Unpaid</span></header><div className="receipt-line"><span>Snooker — Singles<small>Table 03 · Game 02</small></span><b>Rs 500</b></div><div className="receipt-line"><span>FIFA<small>60 min · Console 02</small></span><b>Rs 1,000</b></div><div className="receipt-line"><span>Canteen<small>2 × drink, 1 × burger</small></span><b>Rs 650</b></div><div className="receipt-total"><span>Grand total</span><strong>{money(bill.total)}</strong></div><button className="primary-button receipt-pay" onClick={() => onCheckout(bill.id)}>Collect payment</button></section>;
}

function ReportsView() {
  const bars = [22, 35, 29, 51, 66, 58, 82, 76, 94, 68];
  return <><div className="stat-grid"><Stat label="Revenue" value="Rs 45.8k" note="+12.4%"/><Stat label="Expenses" value="Rs 12.5k" note="today" muted/><Stat label="Profit" value="Rs 33.3k" note="+8.1%"/><Stat label="Games played" value="74" note="+9 today"/></div><div className="report-grid"><section className="chart-panel"><header><strong>Revenue by hour</strong><span className="status-pill">Today</span></header><div className="chart-bars">{bars.map((height, index) => <motion.i key={index} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: index * .055, duration: .65, ease: [0.22, .75, .24, 1] }} style={{ height: `${height}%` }}/>)}</div><div className="chart-labels"><span>2 PM</span><span>4 PM</span><span>6 PM</span><span>8 PM</span><span>10 PM</span></div></section><section className="revenue-card"><header><h3>Revenue mix</h3><span>Today</span></header><div><span>Snooker</span><strong>Rs 24,300</strong></div><div><span>E-games</span><strong>Rs 13,900</strong></div><div><span>Canteen</span><strong>Rs 7,600</strong></div><footer><span>Total</span><strong>Rs 45,800</strong></footer></section></div></>;
}

function AdminView({ notify, tableCount, gamePrices, onTableCountChange, onPricesChange }: { notify: (title: string, detail: string) => void; tableCount: number; gamePrices: GamePrice[]; onTableCountChange: (count: number) => void; onPricesChange: (prices: GamePrice[]) => void }) {
  const cards = [{ icon: Gamepad2, title: "E-games", copy: "Manage games and stations", action: "Manage games" },{ icon: ShoppingBag, title: "Canteen menu", copy: "Manage food and drinks", action: "Edit menu" },{ icon: ReceiptText, title: "Expenses", copy: "Record money spent by the club", action: "Add expense" },{ icon: Users, title: "Staff", copy: "Manage who can use the desk", action: "Manage staff" }];
  return <><section className="admin-settings"><div><LayoutGrid size={25}/><h2>Number of tables</h2><p>The dashboard will show this many tables.</p></div><select aria-label="Number of tables" value={tableCount} onChange={(event) => onTableCountChange(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} tables</option>)}</select></section><section className="admin-settings"><div><CircleDollarSign size={25}/><h2>Pool game prices</h2><p>These prices appear when staff starts a game.</p></div><div className="admin-price-list">{gamePrices.map((game) => <label key={game.id}>{game.name}<input type="number" aria-label={`${game.name} price`} value={game.price} onChange={(event) => onPricesChange(gamePrices.map((item) => item.id === game.id ? { ...item, price: Number(event.target.value) } : item))}/></label>)}</div></section><div className="admin-grid">{cards.map((card, index) => <motion.article key={card.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .055 }}><card.icon size={18}/><h3>{card.title}</h3><p>{card.copy}</p><button className="secondary-button" onClick={() => notify(card.title, "Settings opened with local demo data.")}>{card.action}<ChevronRight size={14}/></button></motion.article>)}</div></>;
}

function Stat({ label, value, note, muted = false }: { label: string; value: string; note: string; muted?: boolean }) {
  return <motion.article className="stat-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}><span>{label}</span><strong>{value}</strong><small className={muted ? "muted" : ""}>{note}</small></motion.article>;
}

function DataPanel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="data-panel"><header><strong>{title}</strong>{action}</header><div className="table-scroll">{children}</div></section>;
}
