import { useState } from "react";

export default function SearchBar({ issueTypes, value, onSearch, onClear }) {
  const [local, setLocal] = useState(value);

  function update(key, val) {
    setLocal((p) => ({ ...p, [key]: val }));
  }

  function apply() {
    onSearch(local);
  }

  function clearAll() {
    const empty = { q: "", orderId: "", mobile: "", issueType: "" };
    setLocal(empty);
    onClear();
  }

  return (
    <div className="form">
      <label className="label">
        Quick Search
        <input
          className="input"
          placeholder="Order ID / Mobile / School / Issue / Notes"
          value={local.q}
          onChange={(e) => update("q", e.target.value)}
        />
      </label>

      <div className="row2">
        <label className="label">
          Order ID (exact)
          <input className="input" value={local.orderId} onChange={(e) => update("orderId", e.target.value)} />
        </label>

        <label className="label">
          Mobile (exact)
          <input className="input" value={local.mobile} onChange={(e) => update("mobile", e.target.value)} />
        </label>
      </div>

      <label className="label">
        Issue Type
        <select className="input" value={local.issueType} onChange={(e) => update("issueType", e.target.value)}>
          <option value="">Any</option>
          {issueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div className="actions">
        <button className="btn secondary" type="button" onClick={apply}>
          Search
        </button>
        <button className="btn ghost" type="button" onClick={clearAll}>
          Clear
        </button>
      </div>
    </div>
  );
}