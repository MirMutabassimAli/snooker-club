"use client";

import {
  BarChart3,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Gamepad2,
  LayoutGrid,
  Menu,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShoppingBag,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ActionModal } from "@/components/action-modal";
import { BrandMark } from "@/components/brand-mark";
import { IntroOverlay } from "@/components/intro-overlay";
import { MotionTable } from "@/components/motion-table";
import {
  initialBills,
  initialSessions,
  initialTables,
  menuItems,
  navItems,
  players as seedPlayers,
  type Bill,
  type ClubTable,
  type Player,
  type Session,
  type SessionKind,
  type ViewId,
} from "@/lib/demo-data";
import { formatDuration, getTableSummary } from "@/lib/club-domain";

const iconByView: Record<ViewId, typeof LayoutGrid> = {
  operations: LayoutGrid,
  sessions: Clock3,
  players: Users,
  billing: ReceiptText,
  reports: BarChart3,
  admin: Settings2,
};

type ModalId = "session" | "order" | "checkout" | "player" | null;
type Toast = { id: number; title: string; detail: string };

const money = (value: number) => `Rs ${value.toLocaleString("en-PK")}`;

const pageCopy: Record<ViewId, { eyebrow: string; title: string; description: string }> = {
  operations: { eyebrow: "Desk console", title: "Good evening, Mir.", description: "The floor is moving. Three sessions are live." },
  sessions: { eyebrow: "Live floor", title: "Active sessions", description: "Every running timer, in one place." },
  players: { eyebrow: "Customer records", title: "Players", description: "One profile, every visit and activity." },
  billing: { eyebrow: "Accounts", title: "Billing", description: "Open tabs, payments and checkout." },
  reports: { eyebrow: "Business pulse", title: "Today at a glance", description: "Revenue, sessions and floor performance." },
  admin: { eyebrow: "Administrator", title: "Club controls", description: "Pricing, inventory, people and system rules." },
};

export function ClubApp({ skipIntro = false }: { skipIntro?: boolean }) {
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<ViewId>("operations");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [introVisible, setIntroVisible] = useState(!skipIntro);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [tables, setTables] = useState<ClubTable[]>(initialTables);
  const [players, setPlayers] = useState<Player[]>(seedPlayers);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [modal, setModal] = useState<ModalId>(null);
  const [sessionMode, setSessionMode] = useState<SessionKind>("snooker");
  const [sessionPlayer, setSessionPlayer] = useState(seedPlayers[0].name);
  const [selectedTable, setSelectedTable] = useState("01");
  const [selectedGame, setSelectedGame] = useState("FIFA");
  const [orderPlayer, setOrderPlayer] = useState(seedPlayers[0].name);
  const [orderItem, setOrderItem] = useState(menuItems[0].id);
  const [orderQty, setOrderQty] = useState(1);
  const [checkoutBill, setCheckoutBill] = useState(initialBills[0].id);
  const [search, setSearch] = useState("");
  const [clock, setClock] = useState<Date | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPhone, setNewPlayerPhone] = useState("");

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

  const tableSummary = useMemo(() => getTableSummary(tables), [tables]);
  const openBills = bills.filter((bill) => bill.status === "unpaid");
  const selectedMenuItem = menuItems.find((item) => item.id === orderItem) ?? menuItems[0];
  const selectedBill = bills.find((bill) => bill.id === checkoutBill) ?? bills[0];
  const featuredSession = sessions.find((session) => session.resource === "Table 03") ?? sessions[0];

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
    if (tableId) setSelectedTable(tableId);
    setModal("session");
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
      const nextSession: Session = {
        id,
        player: sessionPlayer,
        kind: "snooker",
        activity: "Singles",
        resource: `Table ${selectedTable}`,
        startedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        elapsedSeconds: 0,
        amount: 500,
      };
      setSessions((current) => [...current, nextSession]);
      setTables((current) => current.map((item) => item.id === selectedTable ? { ...item, status: "occupied", player: sessionPlayer, elapsed: "00:00" } : item));
      notify("Session started", `${sessionPlayer} · Table ${selectedTable}`);
    } else {
      const nextSession: Session = {
        id,
        player: sessionPlayer,
        kind: "egame",
        activity: selectedGame,
        resource: "Console 01",
        startedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        elapsedSeconds: 0,
        amount: 500,
      };
      setSessions((current) => [...current, nextSession]);
      notify("Session started", `${sessionPlayer} · ${selectedGame}`);
    }
    setModal(null);
  }

  function finishSession(id: string) {
    const session = sessions.find((item) => item.id === id);
    if (!session) return;

    setSessions((current) => current.filter((item) => item.id !== id));
    if (session.kind === "snooker") {
      const tableId = session.resource.replace("Table ", "");
      setTables((current) => current.map((item) => item.id === tableId ? { id: item.id, status: "available" } : item));
    }
    setBills((current) => current.map((bill) => bill.player === session.player && bill.status === "unpaid" ? { ...bill, itemCount: bill.itemCount + 1, total: bill.total + session.amount, updated: "Just now" } : bill));
    notify("Session finished", `${session.player} · ${money(session.amount)} added to bill`);
  }

  function addOrder() {
    const total = selectedMenuItem.price * orderQty;
    setBills((current) => current.map((bill) => bill.player === orderPlayer && bill.status === "unpaid" ? { ...bill, itemCount: bill.itemCount + orderQty, total: bill.total + total, updated: "Just now" } : bill));
    setModal(null);
    notify("Order added", `${orderQty} × ${selectedMenuItem.name} · ${money(total)}`);
  }

  function collectPayment() {
    if (!selectedBill) return;
    setBills((current) => current.map((bill) => bill.id === selectedBill.id ? { ...bill, status: "paid", updated: "Paid now" } : bill));
    setModal(null);
    notify("Payment received", `Bill #${selectedBill.id} · ${money(selectedBill.total)}`);
  }

  function addPlayer() {
    const name = newPlayerName.trim();
    if (!name) {
      notify("Name required", "Enter a player name to continue.");
      return;
    }
    const player: Player = {
      id: `p-${Date.now()}`,
      name,
      phone: newPlayerPhone.trim() || "No phone supplied",
      visits: 1,
      lastActivity: "Added now",
      openBill: 0,
      active: false,
    };
    setPlayers((current) => [player, ...current]);
    setNewPlayerName("");
    setNewPlayerPhone("");
    setModal(null);
    notify("Player created", `${name} is ready for a session.`);
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
                {item.id === "sessions" && <small>{sessions.length}</small>}
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
            <span>Snooker Club</span><i>/</i><strong>{pageCopy[view].title.replace("Good evening, Mir.", "Operations")}</strong>
          </div>
          <div className="topbar-actions">
            <time suppressHydrationWarning>{clock ? `${clock.toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short" })} · ${clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "\u2014"}</time>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={16}/><i/></button>
            <button className="secondary-button order-top" onClick={() => setModal("order")}><ShoppingBag size={15}/>Add order</button>
            <button className="primary-button" onClick={() => openSession("snooker")}><Plus size={15}/>New session</button>
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
              <PageHeader view={view} sessionCount={sessions.length} onSession={() => openSession("snooker")} onPlayer={() => setModal("player")} onCheckout={() => setModal("checkout")} onExport={exportReport}/>
              {view === "operations" && <OperationsView sessions={sessions} tables={tables} summary={tableSummary} featuredSession={featuredSession} onStart={openSession} onFinish={finishSession} onOrder={() => setModal("order")} onCheckout={() => setModal("checkout")}/>} 
              {view === "sessions" && <SessionsView sessions={sessions} onFinish={finishSession}/>} 
              {view === "players" && <PlayersView players={players} search={search} onSearch={setSearch}/>} 
              {view === "billing" && <BillingView bills={bills} onCheckout={(id) => { setCheckoutBill(id); setModal("checkout"); }}/>} 
              {view === "reports" && <ReportsView/>}
              {view === "admin" && <AdminView notify={notify}/>} 
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ActionModal open={modal === "session"} title="Start a new session" onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={startSession}>Start session</button></>}>
        <div className="field field--wide"><label>Session type</label><div className="segmented"><button className={sessionMode === "snooker" ? "active" : ""} onClick={() => setSessionMode("snooker")}>Snooker</button><button className={sessionMode === "egame" ? "active" : ""} onClick={() => setSessionMode("egame")}>E-game</button></div></div>
        <div className="field field--wide"><label htmlFor="session-player">Player</label><select id="session-player" value={sessionPlayer} onChange={(event) => setSessionPlayer(event.target.value)}>{players.map((player) => <option key={player.id}>{player.name}</option>)}</select></div>
        {sessionMode === "snooker" ? <><div className="field"><label>Game type</label><select><option>Singles — Rs 500</option><option>Doubles — Rs 800</option></select></div><div className="field"><label htmlFor="table-select">Available table</label><select id="table-select" value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)}>{tables.filter((table) => table.status === "available").map((table) => <option key={table.id} value={table.id}>Table {table.id}</option>)}</select></div></> : <><div className="field"><label htmlFor="game-select">Game</label><select id="game-select" value={selectedGame} onChange={(event) => setSelectedGame(event.target.value)}><option>FIFA</option><option>Tekken</option><option>Call of Duty</option><option>GTA V</option></select></div><div className="field"><label>Station</label><select><option>Console 01</option><option>Console 03</option><option>PC 02</option></select></div></>}
        <div className="modal-note field--wide"><span>Billing rule</span><strong>{sessionMode === "snooker" ? "Fixed game rate" : "30-minute units · rounded up"}</strong></div>
      </ActionModal>

      <ActionModal open={modal === "order"} title="Add a canteen order" onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={addOrder}>Add to bill</button></>}>
        <div className="field field--wide"><label htmlFor="order-player">Player / open bill</label><select id="order-player" value={orderPlayer} onChange={(event) => setOrderPlayer(event.target.value)}>{openBills.map((bill) => <option key={bill.id} value={bill.player}>{bill.player} — #{bill.id}</option>)}</select></div>
        <div className="field"><label htmlFor="order-item">Menu item</label><select id="order-item" value={orderItem} onChange={(event) => setOrderItem(event.target.value)}>{menuItems.map((item) => <option key={item.id} value={item.id}>{item.name} — {money(item.price)}</option>)}</select></div>
        <div className="field"><label htmlFor="order-qty">Quantity</label><input id="order-qty" type="number" min="1" max="20" value={orderQty} onChange={(event) => setOrderQty(Math.max(1, Number(event.target.value)))} /></div>
        <div className="modal-note field--wide"><span>Order total</span><strong>{money(selectedMenuItem.price * orderQty)}</strong></div>
      </ActionModal>

      <ActionModal open={modal === "checkout"} title="Settle bill" onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={collectPayment}>Confirm {selectedBill ? money(selectedBill.total) : "payment"}</button></>}>
        <div className="field field--wide"><label htmlFor="bill-select">Open bill</label><select id="bill-select" value={checkoutBill} onChange={(event) => setCheckoutBill(event.target.value)}>{openBills.map((bill) => <option key={bill.id} value={bill.id}>{bill.player} — #{bill.id}</option>)}</select></div>
        <div className="receipt-preview field--wide"><div><span>Snooker · Singles</span><strong>Rs 500</strong></div><div><span>E-game · FIFA</span><strong>Rs 1,000</strong></div><div><span>Canteen</span><strong>Rs 650</strong></div></div>
        <div className="modal-note field--wide"><span>Grand total</span><strong>{selectedBill ? money(selectedBill.total) : "—"}</strong></div>
        <div className="field field--wide"><label>Payment method</label><div className="segmented"><button className="active">Cash</button><button>Card / wallet</button></div></div>
      </ActionModal>

      <ActionModal open={modal === "player"} title="Create a player" onClose={() => setModal(null)} footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" onClick={addPlayer}>Create player</button></>}>
        <div className="field field--wide"><label htmlFor="player-name">Player name</label><input id="player-name" value={newPlayerName} onChange={(event) => setNewPlayerName(event.target.value)} placeholder="Enter full name" /></div>
        <div className="field field--wide"><label htmlFor="player-phone">Phone number</label><input id="player-phone" value={newPlayerPhone} onChange={(event) => setNewPlayerPhone(event.target.value)} placeholder="Optional" /></div>
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

function PageHeader({ view, sessionCount, onSession, onPlayer, onCheckout, onExport }: { view: ViewId; sessionCount: number; onSession: () => void; onPlayer: () => void; onCheckout: () => void; onExport: () => void }) {
  const copy = pageCopy[view];
  return <div className="page-header"><div><p>{copy.eyebrow}</p><h1>{copy.title}</h1><span>{view === "operations" ? `The floor is moving. ${sessionCount} sessions are live.` : copy.description}</span></div><div className="page-header-actions">{view === "operations" && <div className="shift-meta"><span>Current shift</span><strong>04:00 PM — 12:00 AM</strong></div>}{view === "sessions" && <button className="primary-button" onClick={onSession}><Plus size={15}/>Create session</button>}{view === "players" && <button className="primary-button" onClick={onPlayer}><Plus size={15}/>New player</button>}{view === "billing" && <button className="primary-button" onClick={onCheckout}><CircleDollarSign size={15}/>Settle a bill</button>}{view === "reports" && <button className="secondary-button" onClick={onExport}>Export report</button>}{view === "admin" && <span className="status-pill status-pill--green">Admin access</span>}</div></div>;
}

function OperationsView({ sessions, tables, summary, featuredSession, onStart, onFinish, onOrder, onCheckout }: { sessions: Session[]; tables: ClubTable[]; summary: ReturnType<typeof getTableSummary>; featuredSession?: Session; onStart: (kind: SessionKind, tableId?: string) => void; onFinish: (id: string) => void; onOrder: () => void; onCheckout: () => void }) {
  return <>
    <div className="operations-grid">
      <section className="floor-card">
        <div className="floor-card-head"><div><strong>{featuredSession?.resource ?? "Table 03"}</strong><span>{featuredSession ? `${featuredSession.activity} · ${featuredSession.player}` : "Ready for play"}</span></div><span className="live-pill"><i/>LIVE TABLE</span></div>
        <div className="pendant pendant--left"/><div className="pendant pendant--right"/>
        <MotionTable/>
        <div className="floor-card-foot"><div className="featured-id"><b>{featuredSession?.resource.replace("Table ", "") ?? "03"}</b><span>{featuredSession?.player ?? "Available"}<small>{featuredSession?.activity ?? "Ready"}</small></span></div><div className="featured-timer"><span>Session time</span><strong>{featuredSession ? formatDuration(featuredSession.elapsedSeconds) : "00:00:00"}</strong></div></div>
      </section>
      <section className="live-panel">
        <header><div><strong>Active sessions</strong><span>{sessions.length} running now</span></div><span className="live-pill"><i/>LIVE</span></header>
        <div className="session-list"><AnimatePresence initial={false}>{sessions.map((session, index) => <motion.article layout key={session.id} className="session-row" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}><span className="session-index">{String(index + 1).padStart(2, "0")}</span><div><strong>{session.player}</strong><span>{session.kind === "snooker" ? "Snooker" : "E-game"} · {session.activity} · {session.resource}</span></div><aside><strong>{formatDuration(session.elapsedSeconds)}</strong><button onClick={() => onFinish(session.id)}>Finish</button></aside></motion.article>)}</AnimatePresence></div>
        <footer><button className="secondary-button" onClick={onOrder}>Add order</button><button className="primary-button" onClick={() => onStart("snooker")}>Start session</button></footer>
      </section>
    </div>
    <div className="quick-grid">
      <QuickAction index="01 / S" title="Start snooker" description="Assign an open table" onClick={() => onStart("snooker")}/>
      <QuickAction index="02 / E" title="Start e-game" description="Track time and rate" onClick={() => onStart("egame")}/>
      <QuickAction index="03 / C" title="Canteen order" description="Add items to a bill" onClick={onOrder}/>
      <QuickAction index="04 / B" title="Settle bill" description="Review and collect" onClick={onCheckout}/>
    </div>
    <section className="tables-section"><header><h2>Table availability</h2><span>{summary.available} available · {summary.occupied} occupied · {summary.maintenance} maintenance</span></header><div className="table-grid">{tables.map((table, index) => <motion.button key={table.id} className={`table-tile table-tile--${table.status}`} onClick={() => table.status === "available" && onStart("snooker", table.id)} whileHover={{ y: -4 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }}><div><b>{table.id}</b><span><i/>{table.status}</span></div><p>{table.status === "occupied" ? `${table.player} · ${table.elapsed}` : table.status === "available" ? "Ready to assign" : "Temporarily offline"}</p></motion.button>)}</div></section>
  </>;
}

function QuickAction({ index, title, description, onClick }: { index: string; title: string; description: string; onClick: () => void }) {
  return <motion.button className="quick-action" onClick={onClick} whileHover="hover"><div><span>{index}</span><motion.i variants={{ hover: { x: 3, y: -3 } }}>↗</motion.i></div><strong>{title}</strong><small>{description}</small></motion.button>;
}

function SessionsView({ sessions, onFinish }: { sessions: Session[]; onFinish: (id: string) => void }) {
  return <><div className="stat-grid"><Stat label="Running now" value={String(sessions.length).padStart(2, "0")} note="live"/><Stat label="Snooker" value={String(sessions.filter((s) => s.kind === "snooker").length).padStart(2, "0")} note="tables"/><Stat label="E-games" value={String(sessions.filter((s) => s.kind === "egame").length).padStart(2, "0")} note="stations"/><Stat label="Est. active value" value={money(sessions.reduce((sum, s) => sum + s.amount, 0))} note="current"/></div><DataPanel title="Session register"><table><thead><tr><th>Player</th><th>Activity</th><th>Resource</th><th>Started</th><th>Duration</th><th>Status</th><th/></tr></thead><tbody>{sessions.map((session) => <tr key={session.id}><td><strong>{session.player}</strong></td><td>{session.kind === "snooker" ? "Snooker" : "E-game"} · {session.activity}</td><td>{session.resource}</td><td>{session.startedAt}</td><td className="mono">{formatDuration(session.elapsedSeconds)}</td><td><span className="status-pill status-pill--green">Active</span></td><td><button className="text-button" onClick={() => onFinish(session.id)}>Finish</button></td></tr>)}</tbody></table></DataPanel></>;
}

function PlayersView({ players, search, onSearch }: { players: Player[]; search: string; onSearch: (value: string) => void }) {
  const visible = players.filter((player) => `${player.name} ${player.phone}`.toLowerCase().includes(search.toLowerCase()));
  return <DataPanel title="Player directory" action={<label className="search-field"><Search size={14}/><input aria-label="Search players" placeholder="Search by name or phone" value={search} onChange={(event) => onSearch(event.target.value)}/></label>}><table><thead><tr><th>Player</th><th>Phone</th><th>Visits</th><th>Last activity</th><th>Open bill</th><th>Status</th></tr></thead><tbody>{visible.map((player) => <tr key={player.id}><td><strong>{player.name}</strong></td><td>{player.phone}</td><td>{player.visits}</td><td>{player.lastActivity}</td><td>{player.openBill ? money(player.openBill) : "—"}</td><td><span className={`status-pill ${player.active ? "status-pill--green" : ""}`}>{player.active ? "In club" : "Customer"}</span></td></tr>)}</tbody></table></DataPanel>;
}

function BillingView({ bills, onCheckout }: { bills: Bill[]; onCheckout: (id: string) => void }) {
  const visible = bills.filter((bill) => bill.status === "unpaid");
  return <div className="billing-grid"><DataPanel title="Open bills" action={<span className="status-pill status-pill--red">{visible.length} unpaid</span>}><table><thead><tr><th>Bill</th><th>Player</th><th>Items</th><th>Updated</th><th>Total</th><th/></tr></thead><tbody>{visible.map((bill) => <tr key={bill.id}><td>#{bill.id}</td><td><strong>{bill.player}</strong></td><td>{bill.itemCount} activities</td><td>{bill.updated}</td><td>{money(bill.total)}</td><td><button className="text-button" onClick={() => onCheckout(bill.id)}>Collect</button></td></tr>)}</tbody></table></DataPanel><ReceiptCard bill={visible[0]} onCheckout={onCheckout}/></div>;
}

function ReceiptCard({ bill, onCheckout }: { bill?: Bill; onCheckout: (id: string) => void }) {
  if (!bill) return <section className="receipt-card"><p>All bills are settled.</p></section>;
  return <section className="receipt-card"><header><div><h3>{bill.player}</h3><span>Bill #{bill.id} · Open</span></div><span className="status-pill status-pill--red">Unpaid</span></header><div className="receipt-line"><span>Snooker — Singles<small>Table 03 · Game 02</small></span><b>Rs 500</b></div><div className="receipt-line"><span>FIFA<small>60 min · Console 02</small></span><b>Rs 1,000</b></div><div className="receipt-line"><span>Canteen<small>2 × drink, 1 × burger</small></span><b>Rs 650</b></div><div className="receipt-total"><span>Grand total</span><strong>{money(bill.total)}</strong></div><button className="primary-button receipt-pay" onClick={() => onCheckout(bill.id)}>Collect payment</button></section>;
}

function ReportsView() {
  const bars = [22, 35, 29, 51, 66, 58, 82, 76, 94, 68];
  return <><div className="stat-grid"><Stat label="Revenue" value="Rs 45.8k" note="+12.4%"/><Stat label="Expenses" value="Rs 12.5k" note="today" muted/><Stat label="Profit" value="Rs 33.3k" note="+8.1%"/><Stat label="Games played" value="74" note="+9 today"/></div><div className="report-grid"><section className="chart-panel"><header><strong>Revenue by hour</strong><span className="status-pill">Today</span></header><div className="chart-bars">{bars.map((height, index) => <motion.i key={index} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: index * .055, duration: .65, ease: [0.22, .75, .24, 1] }} style={{ height: `${height}%` }}/>)}</div><div className="chart-labels"><span>2 PM</span><span>4 PM</span><span>6 PM</span><span>8 PM</span><span>10 PM</span></div></section><section className="revenue-card"><header><h3>Revenue mix</h3><span>Today</span></header><div><span>Snooker</span><strong>Rs 24,300</strong></div><div><span>E-games</span><strong>Rs 13,900</strong></div><div><span>Canteen</span><strong>Rs 7,600</strong></div><footer><span>Total</span><strong>Rs 45,800</strong></footer></section></div></>;
}

function AdminView({ notify }: { notify: (title: string, detail: string) => void }) {
  const cards = [{ icon: LayoutGrid, title: "Tables", copy: "Add, rename or set a table to maintenance.", action: "Manage 6 tables" },{ icon: CircleDollarSign, title: "Snooker pricing", copy: "Singles Rs 500 · Doubles Rs 800", action: "Edit rates" },{ icon: Gamepad2, title: "E-games", copy: "5 games · time-based billing enabled", action: "Manage games" },{ icon: ShoppingBag, title: "Canteen menu", copy: "18 items · 16 currently available", action: "Edit menu" },{ icon: ReceiptText, title: "Expenses", copy: "Rs 12,500 recorded today", action: "Add expense" },{ icon: Users, title: "Staff & access", copy: "4 active accounts · 2 desk users", action: "Manage staff" }];
  return <div className="admin-grid">{cards.map((card, index) => <motion.article key={card.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .055 }}><card.icon size={18}/><h3>{card.title}</h3><p>{card.copy}</p><button className="secondary-button" onClick={() => notify(card.title, "Demo control opened with local dummy data.")}>{card.action}<ChevronRight size={14}/></button></motion.article>)}</div>;
}

function Stat({ label, value, note, muted = false }: { label: string; value: string; note: string; muted?: boolean }) {
  return <motion.article className="stat-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}><span>{label}</span><strong>{value}</strong><small className={muted ? "muted" : ""}>{note}</small></motion.article>;
}

function DataPanel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="data-panel"><header><strong>{title}</strong>{action}</header><div className="table-scroll">{children}</div></section>;
}
