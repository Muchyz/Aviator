import { useState, useEffect, useRef } from "react";
import { Minus, Plus, Check, Lock, RotateCcw } from "lucide-react";
import { fKES } from "../utils/format";

export default function SingleBetPanel({
  gs, user, hasBet, cashedOut, betAmt, setBetAmt,
  autoCO, setAutoCO, onBet, onCashout, onLogin,
  md, lastBetRef, compact = false,
  socket,
  panelId = 1,
}) {
  const [autoCOOn, setAutoCOOn] = useState(false);
  const amt = parseFloat(betAmt) || 0;

  // Track previous values to avoid redundant emits
  const prevAutoCOOn = useRef(false);
  const prevAutoCO = useRef(autoCO);
  const prevSocket = useRef(null);

  // Emit autocashout:set whenever the relevant values actually change
  useEffect(() => {
    if (!socket || !socket.connected) return;

    const pid = parseInt(panelId) === 2 ? 2 : 1;
    const val = parseFloat(autoCO);
    const socketChanged = socket !== prevSocket.current;
    const toggleChanged = autoCOOn !== prevAutoCOOn.current;
    const valChanged = autoCO !== prevAutoCO.current;

    // Only emit if something meaningful changed
    if (!socketChanged && !toggleChanged && !valChanged) return;

    prevSocket.current = socket;
    prevAutoCOOn.current = autoCOOn;
    prevAutoCO.current = autoCO;

    if (autoCOOn && !isNaN(val) && val >= 1.01) {
      console.log(`[CLIENT] autocashout:set panelId=${pid} target=${val}`);
      socket.emit("autocashout:set", { target: val, panelId: pid });
    } else if (!autoCOOn) {
      // Only clear if we were previously on, or socket just connected
      if (toggleChanged || socketChanged) {
        console.log(`[CLIENT] autocashout:set panelId=${pid} target=null`);
        socket.emit("autocashout:set", { target: null, panelId: pid });
      }
    }
  }, [autoCOOn, autoCO, socket, socket?.connected, panelId]);

  const adjust = delta => {
    const cur = parseFloat(betAmt) || 0;
    setBetAmt(String(Math.max(10, Math.round((cur + delta) * 100) / 100)));
  };

  const handleManualCashout = () => {
    // Only call the parent handler — do NOT emit socket here.
    // The parent (App.jsx doCashout) emits the socket event.
    onCashout();
  };

  const BigBtn = () => {
    if (!user) return (
      <button className="bet-cta login-btn" onClick={onLogin}>
        <Lock size={14} /> Sign In to Play
      </button>
    );
    if (gs === "flying" && hasBet && !cashedOut) return (
      <button className="bet-cta cashout" onClick={handleManualCashout}>
        💰 Cash Out ×{md}
      </button>
    );
    if (gs === "waiting") return (
      <button className="bet-cta place" onClick={onBet} disabled={hasBet}>
        {hasBet ? <><Check size={14} /> Bet Placed</> : `Place Bet · ${fKES(amt)}`}
      </button>
    );
    return <button className="bet-cta waiting-btn" disabled>Waiting for next round...</button>;
  };

  return (
    <div className="bpanel" style={compact ? { padding: "7px 9px 11px" } : {}}>
      <div className="stepper-row">
        <button className="step-btn" onClick={() => adjust(-10)} disabled={hasBet}>
          <Minus size={15} />
        </button>
        <input
          className="step-val"
          type="number"
          value={betAmt}
          onChange={e => setBetAmt(e.target.value)}
          disabled={hasBet}
          style={compact ? { fontSize: 13 } : {}}
        />
        <button className="step-btn" onClick={() => adjust(10)} disabled={hasBet}>
          <Plus size={15} />
        </button>
      </div>
      <div className="qgrid">
        {[100, 200, 500, 1000].map(v => (
          <button key={v} className="qgbtn" onClick={() => setBetAmt(String(v))} disabled={hasBet}>
            {v >= 1000 ? `${v / 1000}k` : v}
          </button>
        ))}
      </div>
      <button
        className="repeat-btn"
        disabled={!lastBetRef.current || hasBet}
        onClick={() => { if (lastBetRef.current) setBetAmt(String(lastBetRef.current)); }}
      >
        <RotateCcw size={9} /> Repeat {lastBetRef.current ? fKES(lastBetRef.current) : "last bet"}
      </button>
      <BigBtn />
      {!compact && gs === "waiting" && !hasBet && (
        <div className="space-hint">
          <span className="space-key">SPACE</span> to place bet
        </div>
      )}
      {!compact && gs === "flying" && hasBet && !cashedOut && (
        <div className="space-hint">
          <span className="space-key">SPACE</span> to cash out
        </div>
      )}
      <div className="auto-row">
        <span className="auto-lbl">Auto Cash Out</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoCOOn}
              onChange={e => setAutoCOOn(e.target.checked)}
            />
            <div className="toggle-track" /><div className="toggle-thumb" />
          </label>
          {autoCOOn && (
            <input
              className="aco-input"
              type="number"
              value={autoCO}
              onChange={e => setAutoCO(e.target.value)}
              min="1.1"
              step="0.1"
            />
          )}
        </div>
      </div>
    </div>
  );
}