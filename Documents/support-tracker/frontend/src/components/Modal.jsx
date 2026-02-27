export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="modalClose" onClick={onClose} type="button" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}