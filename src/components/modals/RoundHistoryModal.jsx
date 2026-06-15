import { X } from "lucide-react";
import { cbCls } from "../../utils/format";

export default function RoundHistoryModal({ onClose, crashes = [] }) {
  return (
    <>
      <div className="history-backdrop" onClick={onClose} />
      <div className="history-dropdown" onClick={e => e.stopPropagation()}>
        <div className="history-head">
          <div>
            <div className="history-title">Round History</div>
            <div className="history-sub">Last {crashes.length} rounds</div>
          </div>
          <button className="mclose" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="history-body">
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
    </>
  );
}
