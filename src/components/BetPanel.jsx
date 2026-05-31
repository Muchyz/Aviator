import { useState } from "react";
import SingleBetPanel from "./SingleBetPanel";

export default function BetPanel({
  gs, user, hasBet, cashedOut, betAmt, setBetAmt, autoCO, setAutoCO,
  onBet, onCashout, onLogin, md, lastBetRef,
  hasBet2, cashedOut2, betAmt2, setBetAmt2, autoCO2, setAutoCO2,
  onBet2, onCashout2, lastBet2Ref,
  socket,
}) {
  const [dualMode, setDualMode] = useState(false);

  return (
    <>
      <div className="bpanel-header">
        <span className="bpanel-title">BET CONTROLS</span>
        <div className="dual-toggle-row">
          <span className="dual-lbl">2 Bets</span>
          <label className="toggle">
            <input type="checkbox" checked={dualMode} onChange={e => setDualMode(e.target.checked)} />
            <div className="toggle-track" /><div className="toggle-thumb" />
          </label>
        </div>
      </div>
      {!dualMode ? (
        <SingleBetPanel
          gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
          betAmt={betAmt} setBetAmt={setBetAmt} autoCO={autoCO} setAutoCO={setAutoCO}
          onBet={onBet} onCashout={onCashout} onLogin={onLogin} md={md}
          lastBetRef={lastBetRef} socket={socket} panelId={1}
        />
      ) : (
        <div className="dual-panels">
          <div className="dual-panel-wrap">
            <div className="dual-panel-label"><div className="dot" /> Bet 1</div>
            <SingleBetPanel compact
              gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
              betAmt={betAmt} setBetAmt={setBetAmt} autoCO={autoCO} setAutoCO={setAutoCO}
              onBet={onBet} onCashout={onCashout} onLogin={onLogin} md={md}
              lastBetRef={lastBetRef} socket={socket} panelId={1}
            />
          </div>
          <div className="dual-panel-wrap">
            <div className="dual-panel-label"><div className="dot p2" /> Bet 2</div>
            <SingleBetPanel compact
              gs={gs} user={user} hasBet={hasBet2} cashedOut={cashedOut2}
              betAmt={betAmt2} setBetAmt={setBetAmt2} autoCO={autoCO2} setAutoCO={setAutoCO2}
              onBet={onBet2} onCashout={onCashout2} onLogin={onLogin} md={md}
              lastBetRef={lastBet2Ref} socket={socket} panelId={2}
            />
          </div>
        </div>
      )}
    </>
  );
}
