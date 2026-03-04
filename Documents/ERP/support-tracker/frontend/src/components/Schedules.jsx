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
  const [type, setType] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

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
    time: "09:00",
    description: "",
    file: null,
    reminders: []
  });

  const [reminderForm, setReminderForm] = useState({ date: "", time: "09:00" });
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

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({
      company: "", product: "", schoolName: "", eventPlanned: "Others",
      date: "", time: "09:00", description: "", file: null, reminders: []
    });
  }

  function addReminder() {
    if (!reminderForm.date) {
      showToast("Please select reminder date ❗", "error");
      return;
    }
    const reminderDateTime = new Date(`${reminderForm.date}T${reminderForm.time}`);
    const eventDateTime = new Date(`${form.date}T${form.time}`);
    if (reminderDateTime >= eventDateTime) {
      showToast("Reminder must be before the event ❗", "error");
      return;
    }
    setForm(prev => ({
      ...prev,
      reminders: [...prev.reminders, { id: Date.now().toString(), date: reminderDateTime, sent: false }]
    }));
    setReminderForm({ date: "", time: "09:00" });
    showToast("Reminder added ✅");
  }

  function removeReminder(reminderId) {
    setForm(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== reminderId) }));
  }

  async function create(e) {
    e.preventDefault();
    if (!type) { showToast("Select schedule type first ❗", "error"); return; }
    if (!form.date) { showToast("Date is required ❗", "error"); return; }
    if (type === "SCHOOL_CAMP" && !form.schoolName) { showToast("School is required ❗", "error"); return; }

    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("date", form.date);
      fd.append("time", form.time || "09:00");
      fd.append("description", form.description || "");
      fd.append("reminders", JSON.stringify(form.reminders.map(r => ({ date: r.date, sent: false }))));
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

  function viewReminders(schedule) {
    setCurrentSchedule(schedule);
    setShowReminderModal(true);
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
        <button className={`btn secondary ${type === "PRODUCTION" ? "" : "ghost"}`} type="button" onClick={() => setType("PRODUCTION")}>🏭 Production</button>
        <button className={`btn secondary ${type === "SCHOOL_CAMP" ? "" : "ghost"}`} type="button" onClick={() => setType("SCHOOL_CAMP")}>🏫 School Meet Camps</button>
      </div>

      {type && (
        <form className="form" onSubmit={create}>
          {type === "PRODUCTION" ? (
            <div className="row2">
              <label className="label">Company <input className="input" value={form.company} onChange={(e) => setForm(p => ({ ...p, company: e.target.value }))} /></label>
              <label className="label">Product <input className="input" value={form.product} onChange={(e) => setForm(p => ({ ...p, product: e.target.value }))} /></label>
            </div>
          ) : (
            <div className="row2">
              <label className="label">School * <select className="input" value={form.schoolName} onChange={(e) => setForm(p => ({ ...p, schoolName: e.target.value }))}>
                <option value="">Select School</option>
                {schools.map(s => <option key={s} value={s}>{s}</option>)}
              </select></label>
              <label className="label">Event <select className="input" value={form.eventPlanned} onChange={(e) => setForm(p => ({ ...p, eventPlanned: e.target.value }))}>
                {CAMP_EVENTS.map(x => <option key={x} value={x}>{x}</option>)}
              </select></label>
            </div>
          )}

          <div className="row2">
            <label className="label">Date * <input className="input" type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} /></label>
            <label className="label">Time <input className="input" type="time" value={form.time} onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))} /></label>
          </div>

          {/* Reminders Section */}
          <div style={{ marginTop: 20, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 10px 0' }}>⏰ Set Reminders</h3>
            <div className="row2">
              <label className="label">Date <input className="input" type="date" value={reminderForm.date} onChange={(e) => setReminderForm(p => ({ ...p, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} max={form.date} /></label>
              <label className="label">Time <input className="input" type="time" value={reminderForm.time} onChange={(e) => setReminderForm(p => ({ ...p, time: e.target.value }))} /></label>
            </div>
            <button className="btn secondary" type="button" onClick={addReminder} style={{ marginBottom: 10 }}>➕ Add Reminder</button>
            {form.reminders.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <h4 style={{ margin: '10px 0' }}>Added Reminders:</h4>
                {form.reminders.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: 4, marginBottom: 5 }}>
                    <span>📅 {new Date(r.date).toLocaleString()}</span>
                    <button type="button" onClick={() => removeReminder(r.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="label">Description <textarea className="input textarea" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} /></label>
          <label className="label">File <input className="input" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" onChange={(e) => setForm(p => ({ ...p, file: e.target.files?.[0] || null }))} /></label>
          <div className="actions"><button className="btn" type="submit">Create Schedule</button></div>
        </form>
      )}

      <div className="listHeader" style={{ marginTop: 16 }}>
        <h2 className="cardTitle">Calendar View List</h2>
        <div className="meta">{loading ? "Loading..." : `${items.length} showing`}</div>
      </div>

      {/* Desktop Table View */}
      <div className="tableWrap">
        <table className="ticketTable">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Date & Time</th>
              <th style={{ width: 140 }}>Type</th>
              <th style={{ width: 200 }}>School / Company</th>
              <th style={{ width: 190 }}>Event / Product</th>
              <th>Description</th>
              <th style={{ width: 100 }}>Reminders</th>
              <th style={{ width: 140 }}>File</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const date = it.date ? new Date(it.date).toLocaleDateString() : "—";
              const time = it.time || "09:00";
              const left = it.type === "PRODUCTION" ? it.company : it.schoolName;
              const right = it.type === "PRODUCTION" ? it.product : it.eventPlanned;
              const pendingReminders = it.reminders?.filter(r => !r.sent).length || 0;
              const totalReminders = it.reminders?.length || 0;
              return (
                <tr key={it._id}>
                  <td className="strongCell">{date} {time}</td>
                  <td>{it.type === "PRODUCTION" ? "Production" : "School Camp"}</td>
                  <td>{left || "—"}</td>
                  <td>{right || "—"}</td>
                  <td>{it.description || <span className="mutedCell">—</span>}</td>
                  <td><button className="btn ghost btnSm" onClick={() => viewReminders(it)} style={{ color: pendingReminders > 0 ? '#4CAF50' : '#666' }}>{totalReminders > 0 ? `🔔 ${pendingReminders}/${totalReminders}` : '⏰ Set'}</button></td>
                  <td>{it.attachment ? <a href={`${API}/api/schedules/${it._id}/file`} target="_blank">Download</a> : <span className="mutedCell">—</span>}</td>
                  <td><button className="btn secondary btnSm" onClick={() => askPassword({ type: "delete", id: it._id })}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobileCardView">
        {items.map((it) => {
          const date = it.date ? new Date(it.date).toLocaleDateString() : "—";
          const time = it.time || "09:00";
          const left = it.type === "PRODUCTION" ? it.company : it.schoolName;
          const right = it.type === "PRODUCTION" ? it.product : it.eventPlanned;
          const pendingReminders = it.reminders?.filter(r => !r.sent).length || 0;
          const totalReminders = it.reminders?.length || 0;
          return (
            <div key={it._id} className="mobileScheduleCard">
              <div className="mobileCardHeader">
                <div>
                  <div className="mobileCardTitle">{left || "—"}</div>
                  <div className="mobileCardSub">{it.type === "PRODUCTION" ? "🏭 Production" : "🏫 School Camp"}</div>
                </div>
                <div className="mobileDate">{date} {time}</div>
              </div>
              <div className="mobileCardBody">
                <div className="mobileCardRow">
                  <span className="mobileCardLabel">Details:</span>
                  <span className="mobileCardValue">{right || "—"}</span>
                </div>
                {it.description && (
                  <div className="mobileCardRow">
                    <span className="mobileCardLabel">Description:</span>
                    <span className="mobileCardValue">{it.description}</span>
                  </div>
                )}
                <div className="mobileCardRow">
                  <span className="mobileCardLabel">Reminders:</span>
                  <span className="mobileCardValue">
                    <button className="btn ghost btnSm" onClick={() => viewReminders(it)} style={{ color: pendingReminders > 0 ? '#4CAF50' : '#666', padding: 0 }}>
                      {totalReminders > 0 ? `🔔 ${pendingReminders}/${totalReminders}` : '⏰ Set'}
                    </button>
                  </span>
                </div>
                {it.attachment && (
                  <div className="mobileCardRow">
                    <span className="mobileCardLabel">File:</span>
                    <span className="mobileCardValue"><a href={`${API}/api/schedules/${it._id}/file`} target="_blank">📎 Download</a></span>
                  </div>
                )}
              </div>
              <div className="mobileCardActions">
                <button className="btn secondary btnSm" onClick={() => askPassword({ type: "delete", id: it._id })}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reminder Modal */}
      <Modal open={showReminderModal} title={`Reminders for ${currentSchedule?.type === 'PRODUCTION' ? currentSchedule?.company : currentSchedule?.schoolName}`} onClose={() => { setShowReminderModal(false); setCurrentSchedule(null); }}>
        <div style={{ padding: 10 }}>
          {currentSchedule?.reminders?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f0f0f0' }}><th style={{ padding: 8, border: '1px solid #ddd' }}>Reminder Date & Time</th><th style={{ padding: 8, border: '1px solid #ddd' }}>Status</th><th style={{ padding: 8, border: '1px solid #ddd' }}>Sent At</th></tr></thead>
              <tbody>
                {currentSchedule.reminders.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{new Date(r.date).toLocaleString()}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{r.sent ? <span style={{ color: '#4CAF50' }}>✅ Sent</span> : <span style={{ color: '#FF9800' }}>⏳ Pending</span>}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{r.sentAt ? new Date(r.sentAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No reminders set for this schedule.</p>}
          <div style={{ marginTop: 20, textAlign: 'right' }}><button className="btn" onClick={() => setShowReminderModal(false)}>Close</button></div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal open={pwOpen} title="Enter Production Password" onClose={() => setPwOpen(false)}>
        <div className="pwWrap">
          <div className="pwText">Password required for Delete.</div>
          <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter password" />
          {pwError ? <div className="pwError">{pwError}</div> : null}
          <div className="pwActions">
            <button className="btn secondary" type="button" onClick={() => setPwOpen(false)}>Cancel</button>
            <button className="btn" type="button" onClick={confirmPassword}>Confirm</button>
          </div>
        </div>
      </Modal>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(p => ({ ...p, open: false }))} />
    </div>
  );
}