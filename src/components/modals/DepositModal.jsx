import { useState } from "react";
import { X, ArrowDownCircle } from "lucide-react";
import Modal from "./Modal";
import PhoneInput from "../PhoneInput";
import { fKES } from "../../utils/format";
import { API } from "../../constants";

export default function DepositModal({ onClose, onDeposit }) {
  const [phone, setPhone] = useState("254");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [pollMsg, setPollMsg] = useState("Waiting for confirmation...");
  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 10 && phone.length >= 12;

  const submit = async () => {
    if (!valid) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/wallet/paystack/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("avipesa_token")}`,
        },
        body: JSON.stringify({ amount: amt, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Deposit failed"); setLoading(false); return; }
      setStep(1);
      pollStatus(data.reference, amt);
    } catch { setErr("Network error."); setLoading(false); }
  };

  const pollStatus = (reference, depositAmt) => {
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes max (24 × 5s)
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API}/wallet/paystack/verify/${reference}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("avipesa_token")}`,
          },
        });
        const data = await res.json();
        if (data.status === "success") {
          clearInterval(interval);
          onDeposit(data.balance, data.amount || depositAmt);
          onClose();
        } else if (data.status === "failed") {
          clearInterval(interval);
          setErr("Payment failed. Please try again.");
          setStep(0);
          setLoading(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollMsg("Taking longer than expected. Check your balance later.");
        } else {
          setPollMsg(`Waiting for M-Pesa confirmation... (${attempts * 5}s)`);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 5000);
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="mhead">
        <div>
          <div className="mtitle">Deposit via M-Pesa</div>
          <div className="msub">Instant STK push · Safaricom</div>
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
              <input
                className="finput"
                type="number"
                placeholder="Minimum KES 10"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <div className="presets">
                {[50, 100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} className="preset" onClick={() => setAmount(String(v))}>{v}</button>
                ))}
              </div>
            </div>
            <button className="btn-mpesa-full" onClick={submit} disabled={!valid || loading}>
              <ArrowDownCircle size={16} />
              {loading ? "Sending STK..." : `Deposit ${amount && !isNaN(amt) ? fKES(amt) : ""}`}
            </button>
          </>
        ) : (
          <div className="stk-wait">
            <div className="stk-icon"><ArrowDownCircle size={24} /></div>
            <div className="stk-title">STK Push Sent</div>
            <div className="stk-sub">
              Check your phone and enter your M-Pesa PIN to complete.
            </div>
            {err ? (
              <div className="ferr" style={{ marginTop: 14 }}>{err}</div>
            ) : (
              <div className="stk-blink">{pollMsg}</div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}