import { useEffect, useState } from "react";
import axios from "axios";
import TicketForm from "./components/TicketForm";
import SearchBar from "./components/SearchBar";
import TicketList from "./components/TicketList";
import ReportDownload from "./components/ReportDownload";
import Modal from "./components/Modal";
import Toast from "./components/Toast";

const API = import.meta.env.VITE_API_URL;

const ISSUE_TYPES = [
  "Delivery Delay",
  "Wrong Items",
  "Store Queries",
  "Missing Items",
  "Payment Issue",
  "Return/Exchange",
  "Refund",
  "Cancellation",
  "General queries",
  "Incorrect Order",
  "Order not found",
  "New admissions",
  "Other",
];

const CONTACTS = [
  {
    name: "Niju",
    phone: "+91 81974 76734",
    store: "Tippasandra Store",
  },
  {
    name: "Sabina",
    phone: "+91 72599 26705",
    store: "Mandur Store",
  },
  {
    name: "Neeraj",
    phone: "+91 90366 51611",
    store: "Sarajapur Store",
  },
];

export default function App() {
  // sidebar page selection
  const [activePage, setActivePage] = useState("new"); // "new" | "search"

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    orderId: "",
    mobile: "",
    issueType: "",
  });

  // Counts (must be INSIDE component)
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;
  const totalCount = tickets.length;

  // Password modal state
  const [pwOpen, setPwOpen] = useState(false);
  const [pwValue, setPwValue] = useState("");
  const [pwError, setPwError] = useState("");
  const [pendingEdit, setPendingEdit] = useState(null); // { id, payload, onDone }

  // Toast state
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  function showToast(message, type = "success") {
    setToast({ open: true, message, type });
  }

  async function fetchTickets(nextFilters = filters) {
    setLoading(true);
    try {
      const params = {};
      if (nextFilters.q?.trim()) params.q = nextFilters.q.trim();
      if (nextFilters.orderId?.trim()) params.orderId = nextFilters.orderId.trim();
      if (nextFilters.mobile?.trim()) params.mobile = nextFilters.mobile.trim();
      if (nextFilters.issueType?.trim()) params.issueType = nextFilters.issueType.trim();

      const res = await axios.get(`${API}/api/tickets`, { params });
      setTickets(res.data.items || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load tickets ❌", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load initial data so Search page is ready instantly
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTicket(payload) {
    try {
      await axios.post(`${API}/api/tickets`, payload);
      await fetchTickets();
      showToast("Issue saved successfully ✅", "success");
      setActivePage("search");
      return true;
    } catch (err) {
      console.error(err);
      showToast("Failed to save issue ❌", "error");
      return false;
    }
  }

  async function markResolved(id) {
    try {
      await axios.patch(`${API}/api/tickets/${id}`, { status: "RESOLVED" });
      await fetchTickets();
      showToast("Ticket marked as resolved ✅", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status ❌", "error");
    }
  }

  async function editTicket(id, payload, password) {
    try {
      await axios.patch(`${API}/api/tickets/${id}`, payload, {
        headers: { "x-edit-password": password },
      });
      await fetchTickets();
      return true;
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) setPwError("Wrong password. Please try again.");
      else setPwError("Failed to edit ticket. Try again.");
      return false;
    }
  }

  function handleEditRequest(id, payload, onDone) {
    setPendingEdit({ id, payload, onDone });
    setPwValue("");
    setPwError("");
    setPwOpen(true);
  }

  async function submitPassword() {
    const current = pendingEdit;
    if (!current) return;

    if (!pwValue.trim()) {
      setPwError("Password is required.");
      return;
    }

    const ok = await editTicket(current.id, current.payload, pwValue.trim());
    if (ok) {
      current.onDone?.(); // close edit mode in TicketList
      setPwOpen(false);
      setPendingEdit(null);
      setPwValue("");
      setPwError("");
      showToast("Ticket updated successfully ✅", "success");
    }
  }

  function onSearch(nextFilters) {
    setFilters(nextFilters);
    fetchTickets(nextFilters);
  }

  function onClear() {
    const empty = { q: "", orderId: "", mobile: "", issueType: "" };
    setFilters(empty);
    fetchTickets(empty);
  }

  return (
    <div className="appShell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sideBrand">
          <img src="/assets/Schoolay.png" alt="Schoolay" className="sideLogo" />
          <div className="sideBrandText">
            <div className="sideTitle">Schoolay</div>
            <div className="sideSub">Customer Query Tracker</div>
            
          </div>
        </div>

        <nav className="sideNav">
          <button
            className={`navItem ${activePage === "new" ? "active" : ""}`}
            onClick={() => setActivePage("new")}
            type="button"
          >
            ➕ New Ticket
          </button>

          <button
            className={`navItem ${activePage === "search" ? "active" : ""}`}
            onClick={() => setActivePage("search")}
            type="button"
          >
            🔍 Search Tickets
          </button>

          <button
  className={`navItem ${activePage === "contacts" ? "active" : ""}`}
  onClick={() => setActivePage("contacts")}
  type="button"
>
  📞 Contact Details
</button>
        </nav>

        <div className="sideFooter">
          <div className="sideHint">
            SCHOOLAY TECHNOLOGIES
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
        <header className="contentTop">
          <div>
            <h1 className="pageTitle">
  {activePage === "new"
    ? "Raise New Ticket"
    : activePage === "search"
    ? "Search Tickets"
    : "Store Contact Details"}
</h1>
            <p className="pageSub">
  {activePage === "new"
    ? "Log a customer issue so any agent can continue the case later."
    : activePage === "search"
    ? "Search by Order ID / Mobile / Issue Type and manage tickets."
    : "Quick access to store contact numbers for support coordination."}
</p>
          </div>

          <div className="miniBadge">
            <span className="miniDot" />
            {loading ? "Loading..." : `${tickets.length} Tickets`}
          </div>
        </header>

       {activePage === "new" ? (
  <section className="card">
    <TicketForm issueTypes={ISSUE_TYPES} onCreate={createTicket} />
  </section>
) : activePage === "search" ? (
  <>
    {/* COUNTS */}
    <section className="statsRow">
      <div className="statCard">
        <div className="statLabel">Open</div>
        <div className="statValue open">{openCount}</div>
      </div>

      <div className="statCard">
        <div className="statLabel">Resolved</div>
        <div className="statValue resolved">{resolvedCount}</div>
      </div>

      <div className="statCard">
        <div className="statLabel">Total</div>
        <div className="statValue">{totalCount}</div>
      </div>
    </section>

    {/* SEARCH */}
    <section className="card">
      <h2 className="cardTitle">Search</h2>

      <SearchBar
        issueTypes={ISSUE_TYPES}
        value={filters}
        onSearch={onSearch}
        onClear={onClear}
      />

      <div style={{ marginTop: 12 }}>
        <ReportDownload
          issueTypes={ISSUE_TYPES}
          issueType={filters.issueType}
        />
      </div>
    </section>

    {/* LIST */}
    <section className="card listCard" style={{ marginTop: 16 }}>
      <div className="listHeader">
        <h2 className="cardTitle">Tickets</h2>
        <div className="meta">
          {loading ? "Loading..." : `${tickets.length} showing`}
        </div>
      </div>

      <TicketList
        tickets={tickets}
        onResolve={markResolved}
        onEditRequest={handleEditRequest}
      />
    </section>
  </>
) : (
  /* CONTACT PAGE */
  <section className="contactGrid">
    {CONTACTS.map((c) => (
      <div className="contactCard" key={c.phone}>
        <div className="contactName">{c.name}</div>

        <div className="contactStore">{c.store}</div>

        <a className="contactPhone" href={`tel:${c.phone}`}>
          {c.phone}
        </a>
      </div>
    ))}
  </section>
)}

        {/* Password Modal */}
        <Modal
          open={pwOpen}
          title="Enter Edit Password"
          onClose={() => {
            setPwOpen(false);
            setPwError("");
            setPendingEdit(null);
            setPwValue("");
          }}
        >
          <div className="pwWrap">
            <div className="pwText">Password is required to edit a ticket.</div>

            <input
              className="input"
              type="password"
              placeholder="Enter password"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitPassword();
              }}
              autoFocus
            />

            {pwError ? <div className="pwError">{pwError}</div> : null}

            <div className="pwActions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setPwOpen(false);
                  setPwError("");
                  setPendingEdit(null);
                  setPwValue("");
                }}
              >
                Cancel
              </button>
              <button className="btn" type="button" onClick={submitPassword}>
                Confirm
              </button>
            </div>
          </div>
        </Modal>

        {/* Toast */}
        <Toast
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((p) => ({ ...p, open: false }))}
        />
      </main>
    </div>
  );
}