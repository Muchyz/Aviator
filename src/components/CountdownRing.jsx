export default function CountdownRing({ cd, total = 5 }) {
  const r = 27;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - cd / total);
  return (
    <div className="cd-outer">
      <div className="cd-ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle className="cd-track" cx="32" cy="32" r={r} />
          <circle className="cd-fill" cx="32" cy="32" r={r}
            strokeDasharray={circ} strokeDashoffset={offset} />
        </svg>
        <div className="cd-val">{cd}</div>
      </div>
      <div className="cd-label">Next Round</div>
    </div>
  );
}