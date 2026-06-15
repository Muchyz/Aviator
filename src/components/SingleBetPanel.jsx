import { useState, useEffect, useRef } from "react";
import { Minus, Plus, Lock } from "lucide-react";

export default function SingleBetPanel({
  gs, user, hasBet, cashedOut, betAmt, setBetAmt,
  autoCO, setAutoCO, onBet, onCashout, onLogin,
  md, lastBetRef, compact = false,
  socket, panelId = 1,
}) {
  const [mode, setMode] = useState("bet");
  const [autoCOOn, setAutoCOOn] = useState(false);
  const [autoBetOn, setAutoBetOn] = useState(false);
  const [queued, setQueued] = useState(false);

  const amt = parseFloat(betAmt) || 0;
  const prevAutoCOOn = useRef(false);
  const prevAutoCO = useRef(autoCO);
  const prevSocket = useRef(null);
  const queuedAmtRef = useRef(null);
  const autoBetOnRef = useRef(false);
  const hasBetRef = useRef(hasBet);
  const betAmtRef = useRef(betAmt);
  const prevGs = useRef(gs);

  // Keep refs in sync
  useEffect(() => { autoBetOnRef.current = autoBetOn; }, [autoBetOn]);
  useEffect(() => { hasBetRef.current = hasBet; }, [hasBet]);
  useEffect(() => { betAmtRef.current = betAmt; }, [betAmt]);

  // Auto cashout socket sync
  useEffect(() => {
    if (!socket || !socket.connected) return;
    const pid = parseInt(panelId) === 2 ? 2 : 1;
    const val = parseFloat(autoCO);
    const socketChanged = socket !== prevSocket.current;
    const toggleChanged = autoCOOn !== prevAutoCOOn.current;
    const valChanged = autoCO !== prevAutoCO.current;
    if (!socketChanged && !toggleChanged && !valChanged) return;
    prevSocket.current = socket;
    prevAutoCOOn.current = autoCOOn;
    prevAutoCO.current = autoCO;
    if (autoCOOn && !isNaN(val) && val >= 1.01) {
      socket.emit("autocashout:set", { target: val, panelId: pid });
    } else if (!autoCOOn && (toggleChanged || socketChanged)) {
      socket.emit("autocashout:set", { target: null, panelId: pid });
    }
  }, [autoCOOn, autoCO, socket, socket?.connected, panelId]);

  // Core logic: react to game state changes
  useEffect(() => {
    const wasWaiting = prevGs.current === "waiting";
    const isNowWaiting = gs === "waiting";
    prevGs.current = gs;

    if (isNowWaiting) {
      // Auto bet: place bet automatically when round starts
      if (autoBetOnRef.current && !hasBetRef.current && user) {
        setTimeout(() => {
          if (!hasBetRef.current) {
            onBet();
          }
        }, 200);
        return;
      }

      // Queued bet: place queued bet when round starts
      if (queued && !hasBetRef.current && queuedAmtRef.current && user) {
        setBetAmt(String(queuedAmtRef.current));
        setTimeout(() => {
          if (!hasBetRef.current) {
            onBet();
          }
        }, 200);
        setQueued(false);
        queuedAmtRef.current = null;
      }
    }
  }, [gs]);

  const adjust = delta => {
    const cur = parseFloat(betAmt) || 0;
    setBetAmt(String(Math.max(10, Math.round((cur + delta) * 100) / 100)));
  };

  const isWaiting  = gs === "waiting";
  const isFlying   = gs === "flying";
  const isCrashed  = gs === "crashed";
  const isCashout  = isFlying && hasBet && !cashedOut;
  const isBetPlaced = hasBet && !isCashout;
  const canBetNow  = isWaiting && !hasBet && user;
  const isLocked   = !user;
  const isInactive = (isFlying || isCrashed) && !isCashout && !isBetPlaced;

  const handleMainAction = () => {
    if (isLocked) { onLogin(); return; }
    if (isCashout) { onCashout(); return; }
    if (canBetNow) { onBet(); return; }
    if (isInactive && !queued && !autoBetOn) {
      queuedAmtRef.current = amt;
      setQueued(true);
      return;
    }
    if (queued) {
      setQueued(false);
      queuedAmtRef.current = null;
    }
  };

  const getBtnBg = () => {
    if (isLocked)    return "#1a1a1a";
    if (isCashout)   return "linear-gradient(160deg,#ff7c00,#ff9900)";
    if (isBetPlaced) return "#1a3a1a";
    if (queued || autoBetOn) return "linear-gradient(160deg,#1a3a5c,#1e4d8c)";
    return "linear-gradient(160deg,#22c55e,#16a34a)";
  };

  const getBtnColor = () => {
    if (isCashout)   return "#fff";
    if (queued || autoBetOn) return "#7ab8f5";
    if (isBetPlaced) return "#4a8a4a";
    return "#000";
  };

  const controlsDisabled = isBetPlaced || queued || autoBetOn;

  return (
    <div style={{
      padding: "12px 12px 12px",
      background: "#0d0d0d",
      boxSizing: "border-box",
      width: "100%",
    }}>

      {/* TAB SWITCHER */}
      <div style={{
        display: "flex", background: "#1a1a1a",
        borderRadius: 50, padding: "3px",
        marginBottom: 12, width: "100%", boxSizing: "border-box",
      }}>
        {["bet","auto"].map(t => (
          <button key={t} onClick={() => setMode(t)} style={{
            flex: 1, padding: "9px 0", borderRadius: 50, border: "none",
            background: mode === t ? "#2e2e2e" : "transparent",
            color: mode === t ? "#fff" : "#555",
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>{t === "bet" ? "Bet" : "Auto"}</button>
        ))}
      </div>

      {/* MAIN ROW */}
      <div style={{
        display: "flex", gap: 8, alignItems: "stretch",
        width: "100%", boxSizing: "border-box",
      }}>

        {/* LEFT */}
        <div style={{
          flex: "1 1 0", minWidth: 0,
          display: "flex", flexDirection: "column", gap: 7,
        }}>
          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => adjust(-10)} disabled={controlsDisabled} style={{
              width: 38, height: 38, minWidth: 38, borderRadius: "50%",
              border: "1px solid #2a2a2a", background: "#1c1c1c",
              color: controlsDisabled ? "#333" : "#ccc",
              cursor: controlsDisabled ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}><Minus size={15}/></button>

            <input
              type="number" value={betAmt}
              onChange={e => setBetAmt(e.target.value)}
              disabled={controlsDisabled}
              style={{
                flex: "1 1 0", minWidth: 0,
                background: "#1c1c1c", border: "1px solid #252525",
                borderRadius: 10, padding: "10px 4px",
                color: controlsDisabled ? "#444" : "#fff",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 20, fontWeight: 800,
                textAlign: "center", outline: "none",
                WebkitAppearance: "none", boxSizing: "border-box",
              }}
            />

            <button onClick={() => adjust(10)} disabled={controlsDisabled} style={{
              width: 38, height: 38, minWidth: 38, borderRadius: "50%",
              border: "1px solid #2a2a2a", background: "#1c1c1c",
              color: controlsDisabled ? "#333" : "#ccc",
              cursor: controlsDisabled ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}><Plus size={15}/></button>
          </div>

          {/* Quick amounts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {[100, 250, 1000, 25000].map(v => (
              <button key={v} onClick={() => setBetAmt(String(v))}
                disabled={controlsDisabled} style={{
                padding: "8px 4px", background: "#1c1c1c",
                border: "1px solid #252525", borderRadius: 8,
                color: controlsDisabled ? "#2a2a2a" : "#666",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 12, fontWeight: 600,
                cursor: controlsDisabled ? "not-allowed" : "pointer",
                textAlign: "center", boxSizing: "border-box",
              }}>
                {v === 1000 ? "1,000" : v === 25000 ? "25,000" : v}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: big button */}
        <button onClick={handleMainAction} style={{
          flex: "0 0 44%", maxWidth: "44%",
          borderRadius: 14, border: "none",
          background: getBtnBg(),
          color: getBtnColor(),
          cursor: isLocked ? "default" : "pointer",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 3, minHeight: 108,
          boxSizing: "border-box", padding: "8px 4px",
          transition: "background 0.3s",
        }}>
          {isLocked ? (
            <><Lock size={15}/><span style={{fontSize:12,fontFamily:"'Space Grotesk',sans-serif",marginTop:4}}>Sign In</span></>
          ) : isCashout ? (
            <>
              <span style={{fontSize:16,fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",textAlign:"center"}}>Cash Out</span>
              <span style={{fontSize:15,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{md}x</span>
            </>
          ) : isBetPlaced ? (
            <span style={{fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",textAlign:"center",color:"#4a8a4a"}}>Placed ✓</span>
          ) : autoBetOn ? (
            <>
              <span style={{fontSize:13,fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",textAlign:"center"}}>Auto Bet</span>
              <span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",opacity:0.8}}>{amt.toFixed(2)} KES</span>
              <span style={{fontSize:10,fontFamily:"'Space Grotesk',sans-serif",textAlign:"center",opacity:0.6,marginTop:2}}>every round</span>
            </>
          ) : queued ? (
            <>
              <span style={{fontSize:13,fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",textAlign:"center"}}>Next Round</span>
              <span style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",opacity:0.8}}>{amt.toFixed(2)} KES</span>
              <span style={{fontSize:10,fontFamily:"'Space Grotesk',sans-serif",textAlign:"center",opacity:0.5,marginTop:2}}>tap to cancel</span>
            </>
          ) : (
            <>
              <span style={{fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:-0.5}}>Bet</span>
              <span style={{fontSize:15,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",textAlign:"center"}}>
                {amt.toFixed(2)}{" "}<span style={{fontSize:12,fontWeight:600}}>KES</span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* AUTO ROW - always visible in auto mode */}
      {mode === "auto" && (
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12, flexWrap: "wrap", gap: 8,
          width: "100%", boxSizing: "border-box",
        }}>
          {/* Auto bet */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{fontSize:13,color:"#777",fontFamily:"'Space Grotesk',sans-serif"}}>Auto bet</span>
            <Toggle value={autoBetOn} onChange={v => {
              setAutoBetOn(v);
              autoBetOnRef.current = v;
              // If turning on during waiting with no bet, place immediately
              if (v && gs === "waiting" && !hasBetRef.current && user) {
                setTimeout(() => onBet(), 100);
              }
            }}/>
          </div>

          {/* Auto cash out */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{fontSize:13,color:"#777",fontFamily:"'Space Grotesk',sans-serif"}}>Auto Cash Out</span>
            <Toggle value={autoCOOn} onChange={setAutoCOOn}/>
            <input
              type="number" value={autoCO}
              onChange={e => setAutoCO(e.target.value)}
              min="1.1" step="0.1"
              style={{
                width: 52, background: "#1c1c1c",
                border: "1px solid #2a2a2a", borderRadius: 7,
                padding: "5px 4px", color: "#fff",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 13, fontWeight: 700,
                textAlign: "center", outline: "none",
              }}
            />
            <button onClick={() => { setAutoCOOn(false); setAutoCO("1.10"); }} style={{
              background: "none", border: "none", color: "#444",
              cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px",
            }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: value ? "#22c55e" : "#2a2a2a",
      position: "relative", cursor: "pointer",
      transition: "background 0.2s", flexShrink: 0,
      border: "1px solid " + (value ? "#16a34a" : "#333"),
    }}>
      <div style={{
        position: "absolute", top: 3,
        left: value ? 22 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
      }}/>
    </div>
  );
}
