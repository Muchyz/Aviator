import { X } from "lucide-react";
import { cbCls } from "../../utils/format";

export default function RoundHistoryModal({ onClose, crashes = [] }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-drag" />
        <div className="mhead">
          <div>
            <div className="mtitle">Round History</div>
            <div className="msub">Last {crashes.length} rounds</div>
          </div>
          <button className="mclose" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="mbody">
          {crashes.length === 0 ? (
            <div className="nodata">No rounds played yet.</div>
          ) : (
            <div className="history-grid">
              {crashes.map((v, i) => (
                <span key={i} className={`cbadge ${cbCls(v)}`}>
                  {Number(v).toFixed(2)}×
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
