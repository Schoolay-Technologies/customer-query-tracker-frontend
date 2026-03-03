import { useEffect } from "react";

export default function Toast({ open, message, type = "success", onClose, duration = 2200 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className={`toast ${type}`}>
      <div className="toastDot" />
      <div className="toastMsg">{message}</div>
      <button className="toastClose" onClick={onClose} type="button">✕</button>
    </div>
  );
}