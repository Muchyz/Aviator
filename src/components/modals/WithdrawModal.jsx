import { useState } from "react";
import { X, ArrowUpCircle, RefreshCw, Check } from "lucide-react";
import Modal from "./Modal";
import PhoneInput from "../PhoneInput";
import { fKES } from "../../utils/format";
import { API } from "../../constants";

export default function WithdrawModal({ onClose, balance, onWithdraw }) {
  const [phone, setPhone] = useState("254");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 100 && amt <= balance && phone.length >= 12;

  const toConfirm = () => {
    if (!valid) {
      if (isNaN(amt) || amt < 100) setErr("Minimum withdrawal is KES 100");
      else if (amt > balance) setErr("Amount exceeds your balance");
      else setErr("Enter a valid M-Pesa number");
      return;
    }
    setErr(""); setStep(1);
  };

  const confirm = async () => {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/wallet/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("avipesa_token")}`,
        },
        body: JSON.stringify({ amount: amt, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Withdrawal failed"); setLoading(false); setStep(0); return; }
      onWithdraw(data.balance, amt); onClose();
    } catch { setErr("Network error."); setLoading(false); setStep(0); }
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="mhead">
        <div>
          <div className="mtitle">Withdraw Funds</div>
          <div className="msub">Send to M-Pesa · ~2 minutes</div>
        </div>
        {step === 0 && <button className="mclose" onClick={onClose}><X size={15} /></button>}
      </div>
      <div className="mbody">
        {step === 0 ? (
          <>
            {err && <div className="ferr">{err}</div>}
            <div className="fg">
              <label className="flbl">M-Pesa Number</label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <div className="fg">
              <label className="flbl">Amount (KES)</label>
              <input className="finput" type="number" placeholder="Min KES 100"
                value={amount} onChange={e => setAmount(e.target.value)} />
              <div className="presets">
                {[100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} className="preset"
                    onClick={() => setAmount(String(v))} disabled={v > balance}>{v}</button>
                ))}
              </div>
              <div className="fhint">
                Available: <strong style={{ color: "var(--green)" }}>{fKES(balance)}</strong>
              </div>
            </div>
            <button className="btn-form" onClick={toConfirm} disabled={!amount}>
              Review Withdrawal
            </button>
          </>
        ) : loading ? (
          <div className="stk-wait">
            <div className="stk-icon" style={{ background: "var(--blue-dim)", border: "1px solid var(--blue-border)", color: "var(--blue)" }}>
              <RefreshCw size={24} />
            </div>
            <div className="stk-title">Processing</div>
            <div className="stk-blink">Please wait...</div>
          </div>
        ) : (
          <>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-md)", borderRadius: 9, padding: 13, marginBottom: 13 }}>
              {[["M-Pesa Number", `+${phone}`], ["Amount", fKES(amt)]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--text2)" }}>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: "1px solid var(--border)", paddingTop: 8, fontWeight: 700 }}>
                <span style={{ color: "var(--text2)" }}>You receive</span>
                <span style={{ color: "var(--green)" }}>{fKES(amt)}</span>
              </div>
            </div>
            <button className="btn-mpesa-full"
              style={{ background: "var(--amber)", color: "#1a0a00", marginBottom: 8 }}
              onClick={confirm}>
              <Check size={16} /> Confirm Withdrawal
            </button>
            <button className="btn-ghost" style={{ width: "100%", textAlign: "center" }}
              onClick={() => setStep(0)}>Edit Details</button>
          </>
        )}
      </div>
    </Modal>
  );
}