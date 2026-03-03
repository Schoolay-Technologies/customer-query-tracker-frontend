import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { SCHOOLS } from "../data/constants";

const API = import.meta.env.VITE_API_URL;
const PASSWORD = "kiran@ceo123";

const CAMP_EVENTS = [
  "Ordering Camp",
  "Measurement Camp",
  "Ordering + Measurement Camp",
  "Delivery Camp",
  "General Meeting",
  "Others",
];

export default function Schedules() {
  const [type, setType] = useState(""); // PRODUCTION | SCHOOL_CAMP
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const showToast = (m, t = "success") => setToast({ open: true, message: m, type: t });

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const [form, setForm] = useState({
    company: "",
    product: "",
    schoolName: "",
    eventPlanned: "Others",
    date: "",
    description: "",
    file: null,
  });

  const schools = useMemo(() => SCHOOLS, []);

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/schedules`);
      setItems(res.data.items || []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load schedules ❌", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({
      company: "",
      product: "",
      schoolName: "",
      eventPlanned: "Others",
      date: "",
      description: "",
      file: null,
    });
  }

  async function create(e) {
    e.preventDefault();
    if (!type) {
      showToast("Select schedule type first ❗", "error");
      return;
    }
    if (!form.date) {
      showToast("Date is required ❗", "error");
      return;
    }
    if (type === "SCHOOL_CAMP" && !form.schoolName) {
      showToast("School is required ❗", "error");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("date", form.date);
      fd.append("description", form.description || "");
      if (form.file) fd.append("file", form.file);

      if (type === "PRODUCTION") {
        fd.append("company", form.company || "");
        fd.append("product", form.product || "");
      } else {
        fd.append("schoolName", form.schoolName);
        fd.append("eventPlanned", form.eventPlanned || "Others");
      }

      await axios.post(`${API}/api/schedules`, fd);
      showToast("Schedule created ✅", "success");
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      showToast("Failed to create schedule ❌", "error");
    }
  }

  function askPassword(action) {
    setPendingAction(action);
    setPw("");
    setPwError("");
    setPwOpen(true);
  }

  async function confirmPassword() {
    if (!pendingAction) return;
    if (!pw.trim()) return setPwError("Password required");
    if (pw.trim() !== PASSWORD) return setPwError("Invalid password");

    try {
      const headers = { "x-schedule-password": pw.trim() };

      if (pendingAction.type === "delete") {
        await axios.delete(`${API}/api/schedules/${pendingAction.id}`, { headers });
        showToast("Deleted ✅");
      }

      if (pendingAction.type === "edit") {
        const fd = new FormData();
        Object.entries(pendingAction.payload || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        if (pendingAction.payload?.file) fd.append("file", pendingAction.payload.file);
        await axios.patch(`${API}/api/schedules/${pendingAction.id}`, fd, { headers });
        showToast("Updated ✅");
      }

      setPwOpen(false);
      setPendingAction(null);
      await load();
    } catch (e) {
      console.error(e);
      showToast("Action failed ❌", "error");
    }
  }

  return (
    <div className="card">
      <h2 className="cardTitle">Select Schedule Type</h2>

      <div className="actions" style={{ marginBottom: 10 }}>
        <button className={`btn secondary ${type === "PRODUCTION" ? "" : "ghost"}`} type="button" onClick={() => setType("PRODUCTION")}>
          🏭 Production
        </button>
        <button className={`btn secondary ${type === "SCHOOL_CAMP" ? "" : "ghost"}`} type="button" onClick={() => setType("SCHOOL_CAMP")}>
          🏫 School Meet Camps
        </button>
      </div>

      {type ? (
        <form className="form" onSubmit={create}>
          {type === "PRODUCTION" ? (
            <>
              <div className="row2">
                <label className="label">
                  Company
                  <input className="input" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
                </label>
                <label className="label">
                  Product
                  <input className="input" value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))} />
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="row2">
                <label className="label">
                  School *
                  <select className="input" value={form.schoolName} onChange={(e) => setForm((p) => ({ ...p, schoolName: e.target.value }))}>
                    <option value="">Select School</option>
                    {schools.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="label">
                  Event Planned
                  <select className="input" value={form.eventPlanned} onChange={(e) => setForm((p) => ({ ...p, eventPlanned: e.target.value }))}>
                    {CAMP_EVENTS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          )}

          <label className="label">
            Date *
            <input className="input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </label>

          <label className="label">
            Description
            <textarea className="input textarea" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </label>

          <label className="label">
            File Upload (pdf / image / xlsx / csv)
            <input className="input" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
          </label>

          <div className="actions">
            <button className="btn" type="submit">
              Create Schedule
            </button>
          </div>
        </form>
      ) : null}

      <div className="listHeader" style={{ marginTop: 16 }}>
        <h2 className="cardTitle">Calendar View List</h2>
        <div className="meta">{loading ? "Loading..." : `${items.length} showing`}</div>
      </div>

      <div className="tableWrap" style={{ marginTop: 12 }}>
        <table className="ticketTable">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Date</th>
              <th style={{ width: 140 }}>Type</th>
              <th style={{ width: 200 }}>School / Company</th>
              <th style={{ width: 190 }}>Event / Product</th>
              <th>Description</th>
              <th style={{ width: 140 }}>File</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <ScheduleRow key={it._id} it={it} onAskPassword={askPassword} />
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={pwOpen}
        title="Enter Production Password"
        onClose={() => {
          setPwOpen(false);
          setPw("");
          setPwError("");
          setPendingAction(null);
        }}
      >
        <div className="pwWrap">
          <div className="pwText">Password required for Edit / Delete.</div>
          <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter password" />
          {pwError ? <div className="pwError">{pwError}</div> : null}

          <div className="pwActions">
            <button className="btn secondary" type="button" onClick={() => setPwOpen(false)}>
              Cancel
            </button>
            <button className="btn" type="button" onClick={confirmPassword}>
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((p) => ({ ...p, open: false }))} />
    </div>
  );
}

function ScheduleRow({ it, onAskPassword }) {
  const date = it.date ? new Date(it.date).toLocaleDateString() : "—";
  const left = it.type === "PRODUCTION" ? it.company : it.schoolName;
  const right = it.type === "PRODUCTION" ? it.product : it.eventPlanned;

  return (
    <tr>
      <td className="strongCell">{date}</td>
      <td>{it.type === "PRODUCTION" ? "Production" : "School Camp"}</td>
      <td>{left || "—"}</td>
      <td>{right || "—"}</td>
      <td>
        {it.description ? (
          <div className="descWrap">
            <span className="descEllipsis">{it.description}</span>
            <span className="descTip">{it.description}</span>
          </div>
        ) : (
          <span className="mutedCell">—</span>
        )}
      </td>
      <td>
        {it.attachment ? (
          <a className="contactPhone" href={`${API}/api/schedules/${it._id}/file`} target="_blank" rel="noreferrer">
            Download
          </a>
        ) : (
          <span className="mutedCell">—</span>
        )}
      </td>
      <td>
        <div className="tableActions">
          <button className="btn secondary btnSm" type="button" onClick={() => onAskPassword({ type: "delete", id: it._id })}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}