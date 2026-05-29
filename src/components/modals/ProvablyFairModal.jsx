import { X, ShieldCheck } from "lucide-react";

export default function ProvablyFairModal({ onClose, hash, roundId }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-drag" />
        <div className="mhead">
          <div>
            <div className="mtitle">Provably Fair</div>
            <div className="msub">Verify round #{String(roundId).padStart(5, "0")}</div>
          </div>
          <button className="mclose" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="pf-modal-body">
          {[
            ["Server Seed Hash", "Before each round, our server commits to a seed by publishing its SHA-256 hash.", hash || "Awaiting next round hash..."],
            ["After the round", "The server reveals the full seed. Verify by hashing it with SHA-256.", null],
            ["Crash point", "Derived deterministically from the seed using HMAC-SHA256.", null],
            ["Verify", 'Run: echo -n "YOUR_SEED" | sha256sum', null],
          ].map(([title, text, code], i) => (
            <div key={i} className="pf-step">
              <div className="pf-step-num">{i + 1}</div>
              <div className="pf-step-text">
                <strong>{title}</strong> — {text}
                {code && <div className="pf-code">{code}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}