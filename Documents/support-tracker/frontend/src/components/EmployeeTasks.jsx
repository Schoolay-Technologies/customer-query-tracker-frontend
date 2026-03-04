import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
const ADMIN_PASSWORD = "kiran@ceo123";

const EMPLOYEES = [
  { name: "Madhavan", email: "madhavan@schoolay.com" },
  { name: "Anu", email: "customersupport@schoolay.com" },
  { name: "Sindhu", email: "customersupport@schoolay.com" },
  { name: "Lakshmi Narayanan", email: "vmlaxman20@gmail.com" },
  { name: "Vimal", email: "vikramoffl05@gmail.com" },
  { name: "Hari Krishnan", email: "harikrishnan@schoolay.com" },
  { name: "Kiran Hiriyanna", email: "kiran@schoolay.com" },
  { name: "Pallavi", email: "pallavi@schoolay.com" },
  { name: "Sneka", email: "snekamanimuthu@gmail.com" },
  { name: "Resha", email: "risharisha169@gmail.com" },
  { name: "Mahima", email: "Sreemanmahi9@gmail.com" },
  { name: "Hari", email: "hariharan@schoolay.com" },
  { name: "Pavithra", email: "gowripavithra29@gmail.com" },
];

export default function EmployeeTasks() {
  const employeeOptions = useMemo(() => EMPLOYEES, []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    employeeName: "",
    email: "",
    description: "",
    allocatedDate: "",
    completionDate: "",
    completionTime: "",
    file: null,
  });

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  function showToast(message, type = "success") {
    setToast({ open: true, message, type });
  }

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "NOT_COMPLETED", remarks: "", file: null });

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/tasks`);
      setItems(res.data.items || []);
    } catch (e) {
      console.error(e);
      showToast("Failed to load tasks ❌", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onEmployeeChange(name) {
    const emp = employeeOptions.find((x) => x.name === name);
    setForm((p) => ({ ...p, employeeName: name, email: emp?.email || "" }));
  }

  async function createTask(e) {
    e.preventDefault();
    if (!form.employeeName || !form.email || !form.description || !form.allocatedDate) {
      showToast("Fill required fields ❗", "error");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("employeeName", form.employeeName);
      fd.append("email", form.email);
      fd.append("description", form.description);
      fd.append("allocatedDate", form.allocatedDate);
      if (form.completionDate) fd.append("completionDate", form.completionDate);
      if (form.completionTime) fd.append("completionTime", form.completionTime);
      if (form.file) fd.append("file", form.file);

      await axios.post(`${API}/api/tasks`, fd);
      showToast("Task created & email triggered ✅", "success");

      setForm({
        employeeName: "",
        email: "",
        description: "",
        allocatedDate: "",
        completionDate: "",
        completionTime: "",
        file: null,
      });

      await load();
    } catch (e2) {
      console.error(e2);
      showToast("Failed to create task ❌", "error");
    }
  }

  function openStatusModal(task) {
    setStatusTarget(task);
    setStatusForm({
      status: task.status || "NOT_COMPLETED",
      remarks: task.remarks || "",
      file: null,
    });
    setStatusOpen(true);
  }

  async function saveStatus() {
    if (!statusTarget) return;

    try {
      const fd = new FormData();
      fd.append("status", statusForm.status);
      fd.append("remarks", statusForm.remarks || "");
      if (statusForm.file) fd.append("file", statusForm.file);

      await axios.patch(`${API}/api/tasks/${statusTarget._id}/status`, fd);
      showToast("Status updated ✅", "success");
      setStatusOpen(false);
      setStatusTarget(null);
      await load();
    } catch (e) {
      console.error(e);
      showToast("Status update failed ❌", "error");
    }
  }

  function askDelete(id) {
    setPendingDeleteId(id);
    setPw("");
    setPwError("");
    setPwOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    if (!pw.trim()) return setPwError("Password required");
    if (pw.trim() !== ADMIN_PASSWORD) return setPwError("Invalid password");

    try {
      await axios.delete(`${API}/api/tasks/${pendingDeleteId}`, {
        headers: { "x-task-password": pw.trim() },
      });
      showToast("Task deleted ✅", "success");
      setPwOpen(false);
      setPendingDeleteId(null);
      await load();
    } catch (e) {
      console.error(e);
      showToast("Delete failed ❌", "error");
    }
  }

  return (
    <div className="card">
      <h2 className="cardTitle">Employee Task</h2>

      <form className="form" onSubmit={createTask}>
        <label className="label">
          Employee Name *
          <select className="input" value={form.employeeName} onChange={(e) => onEmployeeChange(e.target.value)}>
            <option value="">Select employee</option>
            {employeeOptions.map((e) => (
              <option key={e.name} value={e.name}>{e.name}</option>
            ))}
          </select>
        </label>

        <label className="label">
          Email ID *
          <input className="input" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </label>

        <label className="label">
          Task Description *
          <textarea className="input textarea" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </label>

        <div className="row2">
          <label className="label">
            Task Allocated Date *
            <input className="input" type="date" value={form.allocatedDate} onChange={(e) => setForm((p) => ({ ...p, allocatedDate: e.target.value }))} />
          </label>
          <label className="label">
            Task Completion Date
            <input className="input" type="date" value={form.completionDate} onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))} />
          </label>
        </div>

        <div className="row2">
          <label className="label">
            Task Completion Time
            <input className="input" type="time" value={form.completionTime} onChange={(e) => setForm((p) => ({ ...p, completionTime: e.target.value }))} />
          </label>
          <label className="label">
            Upload File
            <input className="input" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
          </label>
        </div>

        <div className="actions">
          <button className="btn" type="submit">Create Task + Email</button>
        </div>
      </form>

      <div className="listHeader" style={{ marginTop: 16 }}>
        <h2 className="cardTitle">Tasks</h2>
        <div className="meta">{loading ? "Loading..." : `${items.length} showing`}</div>
      </div>

      {/* Desktop Table View */}
      <div className="tableWrap">
        <table className="ticketTable">
          <thead>
            <tr>
              <th style={{ width: 160 }}>Employee</th>
              <th style={{ width: 230 }}>Email</th>
              <th>Description</th>
              <th style={{ width: 220 }}>Remarks</th>
              <th style={{ width: 120 }}>Status</th>
              <th style={{ width: 170 }}>Allocated</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td className="strongCell">{t.employeeName}</td>
                <td>{t.email}</td>
                <td>
                  <div className="descWrap">
                    <span className="descEllipsis">{t.description}</span>
                    <span className="descTip">{t.description}</span>
                  </div>
                </td>
                <td>
                  {t.remarks ? (
                    <div className="descWrap">
                      <span className="descEllipsis">{t.remarks}</span>
                      <span className="descTip">{t.remarks}</span>
                    </div>
                  ) : (
                    <span className="mutedCell">—</span>
                  )}
                </td>
                <td>
                  <span className={`statusPill ${t.status === "COMPLETED" ? "resolved" : "open"}`}>
                    {t.status === "COMPLETED" ? "COMPLETED" : "NOT COMPLETED"}
                  </span>
                </td>
                <td>{t.allocatedDate ? new Date(t.allocatedDate).toLocaleDateString() : "—"}</td>
                <td>
                  <div className="tableActions">
                    <button className="btn secondary btnSm" type="button" onClick={() => openStatusModal(t)}>Status</button>
                    <button className="btn btnSm" type="button" onClick={() => askDelete(t._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="emptyCell">No tasks found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobileCardView">
        {items.map((t) => (
          <div key={t._id} className="mobileTaskCard">
            <div className="mobileCardHeader">
              <div>
                <div className="mobileCardTitle">{t.employeeName}</div>
                <div className="mobileCardSub">{t.email}</div>
              </div>
              <span className={`statusPill ${t.status === "COMPLETED" ? "resolved" : "open"}`}>
                {t.status === "COMPLETED" ? "COMPLETED" : "NOT COMPLETED"}
              </span>
            </div>
            <div className="mobileCardBody">
              <div className="mobileCardRow">
                <span className="mobileCardLabel">Description:</span>
                <span className="mobileCardValue">{t.description}</span>
              </div>
              {t.remarks && (
                <div className="mobileCardRow">
                  <span className="mobileCardLabel">Remarks:</span>
                  <span className="mobileCardValue">{t.remarks}</span>
                </div>
              )}
              <div className="mobileCardRow">
                <span className="mobileCardLabel">Allocated:</span>
                <span className="mobileCardValue">
                  {t.allocatedDate ? new Date(t.allocatedDate).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
            <div className="mobileCardActions">
              <button className="btn secondary btnSm" type="button" onClick={() => openStatusModal(t)}>Status</button>
              <button className="btn btnSm" type="button" onClick={() => askDelete(t._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Status Modal */}
      <Modal open={statusOpen} title="Update Task Status" onClose={() => setStatusOpen(false)}>
        <div className="pwWrap">
          <label className="label">
            Status
            <select className="input" value={statusForm.status} onChange={(e) => setStatusForm(p => ({ ...p, status: e.target.value }))}>
              <option value="NOT_COMPLETED">Not Completed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>
          <label className="label">
            Remarks
            <textarea className="input textarea" value={statusForm.remarks} onChange={(e) => setStatusForm(p => ({ ...p, remarks: e.target.value }))} />
          </label>
          <label className="label">
            Upload File
            <input className="input" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv" onChange={(e) => setStatusForm(p => ({ ...p, file: e.target.files?.[0] || null }))} />
          </label>
          <div className="pwActions">
            <button className="btn secondary" type="button" onClick={() => setStatusOpen(false)}>Cancel</button>
            <button className="btn" type="button" onClick={saveStatus}>Save</button>
          </div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal open={pwOpen} title="Enter Task Admin Password" onClose={() => setPwOpen(false)}>
        <div className="pwWrap">
          <div className="pwText">Password required for Delete.</div>
          <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter password" />
          {pwError ? <div className="pwError">{pwError}</div> : null}
          <div className="pwActions">
            <button className="btn secondary" type="button" onClick={() => setPwOpen(false)}>Cancel</button>
            <button className="btn" type="button" onClick={confirmDelete}>Confirm</button>
          </div>
        </div>
      </Modal>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(p => ({ ...p, open: false }))} />
    </div>
  );
}