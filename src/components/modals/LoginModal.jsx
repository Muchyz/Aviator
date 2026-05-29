import { useState } from "react";
import { X } from "lucide-react";
import Modal from "./Modal";
import PhoneInput from "../PhoneInput";
import PwInput from "../PwInput";
import { API } from "../../constants";

export default function LoginModal({ onClose, onLogin, goRegister }) {
  const [phone, setPhone] = useState("254");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (phone.length < 12 || !pass) { setErr("Enter your phone number and password."); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Login failed"); setLoading(false); return; }
      localStorage.setItem("avipesa_token", data.token);
      onLogin(data.user); onClose();
    } catch { setErr("Network error. Please try again."); setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mhead">
        <div>
          <div className="mtitle">Welcome back</div>
          <div className="msub">Sign in with your registered number</div>
        </div>
        <button className="mclose" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="mbody">
        {err && <div className="ferr">{err}</div>}
        <div className="fg">
          <label className="flbl">M-Pesa Number</label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
        <div className="fg">
          <label className="flbl">Password</label>
          <PwInput placeholder="••••••••" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="btn-form" onClick={submit} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="ffoot">
          No account?{" "}
          <button className="flink" onClick={() => { onClose(); goRegister(); }}>Create one free</button>
        </div>
      </div>
    </Modal>
  );
}