import { useMemo, useState } from "react";
import { SCHOOLS } from "../data/constants";

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

function formatText(text) {
  const v = (text || "").trim();
  return v.length ? v : "";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  // dd/mm/yyyy (India-friendly)
  return d.toLocaleDateString("en-IN");
}

export default function TicketList({ tickets, onResolve, onEditRequest }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    orderId: "",
    mobile: "",
    schoolName: "",
    issueType: "",
    description: "",
  });

  const rows = useMemo(() => tickets || [], [tickets]);

  function startEdit(t) {
    setEditingId(t._id);
    setEditForm({
      orderId: t.orderId || "",
      mobile: t.mobile || "",
      schoolName: t.schoolName || "",
      issueType: t.issueType || ISSUE_TYPES[0],
      description: t.description || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(id) {
    // pass callback so App closes edit mode after password success
    onEditRequest?.(id, editForm, () => setEditingId(null));
  }

  if (!rows.length) return <div className="empty">No tickets found.</div>;

  return (
    <div className="tableWrap">
      <table className="ticketTable">
        <thead>
          <tr>
            {/* ✅ NEW: Date column */}
            <th style={{ width: 120 }}>Date</th>

            <th style={{ width: 130 }}>Order ID</th>
            <th style={{ width: 140 }}>Mobile</th>
            <th style={{ width: 240 }}>School</th>
            <th style={{ width: 170 }}>Issue Type</th>
            <th>Description</th>
            <th style={{ width: 110 }}>Status</th>
            <th style={{ width: 220 }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((t) => {
            const isEditing = editingId === t._id;
            const desc = formatText(t.description);

            if (isEditing) {
              return (
                <tr key={t._id} className="editRow">
                  {/* Date is not editable (just shown) */}
                  <td>{formatDate(t.createdAt)}</td>

                  <td>
                    <input
                      className="input tableInput"
                      value={editForm.orderId}
                      onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
                    />
                  </td>

                  <td>
                    <input
                      className="input tableInput"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                      placeholder="Optional"
                    />
                  </td>

                  <td>
                    <select
                      className="input tableInput"
                      value={editForm.schoolName}
                      onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })}
                    >
                      <option value="">Select School</option>
                      {SCHOOLS.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      className="input tableInput"
                      value={editForm.issueType}
                      onChange={(e) => setEditForm({ ...editForm, issueType: e.target.value })}
                    >
                      {ISSUE_TYPES.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      className="input tableInput"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Add notes"
                    />
                  </td>

                  <td>
                    <span className={`statusPill ${t.status === "OPEN" ? "open" : "resolved"}`}>
                      {t.status}
                    </span>
                  </td>

                  <td>
                    <div className="tableActions">
                      <button className="btn btnSm" type="button" onClick={() => saveEdit(t._id)}>
                        Save
                      </button>
                      <button className="btn ghost btnSm" type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={t._id}>
                {/* ✅ NEW: Date column */}
                <td>{formatDate(t.createdAt)}</td>

                <td className="strongCell">{t.orderId}</td>
                <td>{t.mobile?.trim() ? t.mobile : <span className="mutedCell">—</span>}</td>
                <td>{t.schoolName}</td>

                <td>
                  <span className="issuePill">{t.issueType}</span>
                </td>

                {/* Description: ellipsis + hover black tooltip */}
                <td>
                  {desc ? (
                    <div className="descWrap">
                      <span className="descEllipsis">{desc}</span>
                      <span className="descTip">{desc}</span>
                    </div>
                  ) : (
                    <span className="mutedCell">—</span>
                  )}
                </td>

                <td>
                  <span className={`statusPill ${t.status === "OPEN" ? "open" : "resolved"}`}>
                    {t.status}
                  </span>
                </td>

                <td>
                  <div className="tableActions">
                    <button className="btn secondary btnSm" type="button" onClick={() => startEdit(t)}>
                      Edit
                    </button>

                    {t.status === "OPEN" ? (
                      <button className="btn btnSm" type="button" onClick={() => onResolve(t._id)}>
                        Resolve
                      </button>
                    ) : (
                      <span className="doneSmall">Resolved ✅</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}