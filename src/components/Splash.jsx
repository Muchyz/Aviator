import { useEffect, useState } from "react";

export default function Splash() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress > 30) setPhase(1);
    if (progress > 65) setPhase(2);
    if (progress > 90) setPhase(3);
  }, [progress]);

  const phases = ["Initializing...", "Loading assets...", "Almost ready...", "Let's fly! ✈️"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#06080e",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Space Grotesk', sans-serif",
      overflow: "hidden",
    }}>

      {/* Background glow */}
      <div style={{
        position: "absolute", width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%, -60%)",
        pointerEvents: "none",
      }} />

      {/* Animated grid lines */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#4f8ef7 1px, transparent 1px), linear-gradient(90deg, #4f8ef7 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Plane flying across */}
      <div style={{
        position: "absolute", top: "30%",
        left: `${-10 + progress * 1.2}%`,
        transition: "left 0.1s linear",
        fontSize: 28, filter: "drop-shadow(0 0 12px rgba(255,183,3,0.8))",
        zIndex: 2,
      }}>✈️</div>

      {/* Trail */}
      <div style={{
        position: "absolute", top: "calc(30% + 14px)",
        left: 0, width: `${progress * 1.2}%`,
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(255,183,3,0.3), rgba(255,183,3,0.6))",
        transition: "width 0.1s linear",
      }} />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 32px" }}>

        {/* Logo */}
        <div style={{
          marginBottom: 8,
          animation: "fadeSlideUp 0.6s ease forwards",
        }}>
          <img src="/logo.png" alt="AviPesa"
            style={{ height: 48, width: "auto", filter: "drop-shadow(0 0 20px rgba(255,183,3,0.4))" }}
          />
        </div>

        <div style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "3px",
          color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
          marginBottom: 48, animation: "fadeSlideUp 0.6s 0.2s ease both",
        }}>
          Crash & Win
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 24, justifyContent: "center",
          marginBottom: 40, animation: "fadeSlideUp 0.6s 0.35s ease both",
        }}>
          {[
            { val: "3,000+", lbl: "Online" },
            { val: "×100", lbl: "Max Win" },
            { val: "Instant", lbl: "Payouts" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#4f8ef7" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          width: 220, height: 3, background: "rgba(255,255,255,0.07)",
          borderRadius: 3, overflow: "hidden", margin: "0 auto 12px",
          animation: "fadeSlideUp 0.6s 0.45s ease both",
        }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg, #4f8ef7, #a855f7, #ffb703)",
            borderRadius: 3, transition: "width 0.08s linear",
            boxShadow: "0 0 8px rgba(79,142,247,0.6)",
          }} />
        </div>

        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.3)",
          fontWeight: 600, letterSpacing: "1px",
          height: 16, transition: "opacity 0.3s",
          animation: "fadeSlideUp 0.6s 0.45s ease both",
        }}>
          {phases[phase]}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
