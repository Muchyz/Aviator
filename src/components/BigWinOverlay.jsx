export default function BigWinOverlay({ player, mult }) {
  return (
    <div className="bigwin-overlay">
      <div className="bigwin-box">
        <div style={{ fontSize: 36, marginBottom: 5 }}>🚀</div>
        <div className="bigwin-mult">{Number(mult).toFixed(2)}×</div>
        <div className="bigwin-name">{player}</div>
        <div className="bigwin-label">Mega Win!</div>
      </div>
    </div>
  );
}