import { X } from "lucide-react";

export default function Modal({ onClose, children }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-drag" />
        {children}
      </div>
    </div>
  );
}