import { useState } from "react";
import { SCHOOLS } from "../data/constants";

export default function TicketForm({ issueTypes, onCreate }) {
  const [form, setForm] = useState({
    orderId: "",
    mobile: "",
    schoolName: "",
    issueType: issueTypes?.[0] || "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.orderId || !form.schoolName || !form.issueType) {
      alert("Please fill required fields");
      return;
    }

    setSaving(true);

    const ok = await onCreate({
      orderId: form.orderId.trim(),
      mobile: form.mobile.trim(), // optional
      schoolName: form.schoolName,
      issueType: form.issueType,
      description: form.description.trim(),
    });

    if (ok) {
      setForm({
        orderId: "",
        mobile: "",
        schoolName: "",
        issueType: issueTypes?.[0] || "",
        description: "",
      });
    }

    setSaving(false);
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="label">
        Order ID *
        <input
          className="input"
          value={form.orderId}
          onChange={(e) => update("orderId", e.target.value)}
          placeholder="Enter Order ID"
        />
      </label>

      <label className="label">
        Mobile Number (optional)
        <input
          className="input"
          value={form.mobile}
          onChange={(e) => update("mobile", e.target.value)}
          placeholder="Enter Mobile Number"
        />
      </label>

      <label className="label">
        School Name *
        <select
          className="input"
          value={form.schoolName}
          onChange={(e) => update("schoolName", e.target.value)}
        >
          <option value="">Select School</option>
          {SCHOOLS.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
      </label>

      <label className="label">
        Issue Type *
        <select className="input" value={form.issueType} onChange={(e) => update("issueType", e.target.value)}>
          {issueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="label">
        Description
        <textarea
          className="input textarea"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe the issue"
        />
      </label>

      <div className="actions">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Ticket"}
        </button>
      </div>
    </form>
  );
}