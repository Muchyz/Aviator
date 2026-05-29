export default function GameGraph({ gs, mult, pathPts, crashed }) {
  const W = 600, H = 300;
  const PAD_L = 46, PAD_B = 28, PAD_R = 20, PAD_T = 20;
  const gW = W - PAD_L - PAD_R;
  const gH = H - PAD_T - PAD_B;
  const maxMult = Math.max(1.5, mult * 1.2 + 0.3);
  const toSvgY = (m) => PAD_T + gH - ((m - 1) / (maxMult - 1)) * gH;
  const toSvgX = (pct) => PAD_L + pct * gW;

  let linePath = "", fillPath = "";
  if (pathPts.length >= 2) {
    const svgPts = pathPts.map(p => ({ x: toSvgX(p.pct), y: toSvgY(p.mult) }));
    linePath = `M ${svgPts[0].x} ${svgPts[0].y}`;
    for (let i = 1; i < svgPts.length; i++) {
      const prev = svgPts[i - 1], cur = svgPts[i];
      const cpx1 = prev.x + (cur.x - prev.x) * 0.4;
      const cpx2 = prev.x + (cur.x - prev.x) * 0.6;
      linePath += ` C ${cpx1} ${prev.y} ${cpx2} ${cur.y} ${cur.x} ${cur.y}`;
    }
    const last = svgPts[svgPts.length - 1];
    fillPath = linePath + ` L ${last.x} ${PAD_T + gH} L ${svgPts[0].x} ${PAD_T + gH} Z`;
  }

  const range = maxMult - 1;
  const rawStep = range / 5;
  const niceSteps = [0.2, 0.5, 1, 2, 5, 10, 20, 50];
  const tickStep = niceSteps.find(s => s >= rawStep) || rawStep;
  const yTicks = [];
  for (let v = 1; v <= maxMult + tickStep * 0.5; v += tickStep) {
    if (v > maxMult + 0.1) break;
    yTicks.push(parseFloat(v.toFixed(1)));
  }

  const lineColor = crashed ? "#ff4d6d" : "#ffb703";
  const glowColor = crashed ? "rgba(255,77,109,0.5)" : "rgba(255,183,3,0.35)";
  const gradId = crashed ? "crGrad" : "flGrad";
  const lastPt = pathPts.length > 0 ? pathPts[pathPts.length - 1] : null;
  const planeSvgX = lastPt ? toSvgX(lastPt.pct) : PAD_L;
  const planeSvgY = lastPt ? toSvgY(lastPt.mult) : PAD_T + gH;

  return (
    <svg className="csvg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="flGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb703" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#ff8c00" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="crGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff4d6d" stopOpacity="0" />
        </linearGradient>
        <filter id="lineGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="graphClip">
          <rect x={PAD_L} y={PAD_T} width={gW} height={gH} />
        </clipPath>
        <pattern id="scanlines" x="0" y="0" width="1" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="600" y2="0" stroke="rgba(255,255,255,0.012)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x={PAD_L} y={PAD_T} width={gW} height={gH} fill="rgba(0,0,0,0.1)" />
      <rect x={PAD_L} y={PAD_T} width={gW} height={gH} fill="url(#scanlines)" />
      {yTicks.map((v, i) => {
        const sy = toSvgY(v);
        if (sy < PAD_T - 2 || sy > PAD_T + gH + 2) return null;
        return (
          <g key={i}>
            <line x1={PAD_L} y1={sy} x2={PAD_L + gW} y2={sy}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 6" />
            <text x={PAD_L - 6} y={sy + 4} textAnchor="end"
              fontSize="9.5" fontFamily="JetBrains Mono, monospace"
              fill="rgba(107,122,153,0.75)" fontWeight="500">
              {v % 1 === 0 ? `${v}×` : `${v.toFixed(1)}×`}
            </text>
          </g>
        );
      })}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + gH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1={PAD_L} y1={PAD_T + gH} x2={PAD_L + gW} y2={PAD_T + gH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {fillPath && <path d={fillPath} fill={`url(#${gradId})`} clipPath="url(#graphClip)" />}
      {linePath && (
        <path d={linePath} fill="none" stroke={glowColor} strokeWidth="12"
          strokeLinecap="round" strokeLinejoin="round"
          clipPath="url(#graphClip)" filter="url(#lineGlow)" />
      )}
      {linePath && (
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" clipPath="url(#graphClip)" />
      )}
      {pathPts.length > 0 && gs === "flying" && planeSvgY >= PAD_T - 10 && planeSvgY <= PAD_T + gH + 10 && (
        <g clipPath="url(#graphClip)">
          <circle cx={planeSvgX} cy={planeSvgY} r="10" fill="#ffb703" opacity="0.12">
            <animate attributeName="r" values="6;14;6" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={planeSvgX} cy={planeSvgY} r="4" fill="#ffb703" opacity="0.7" />
          <circle cx={planeSvgX} cy={planeSvgY} r="2" fill="#ffffff" />
        </g>
      )}
      {pathPts.length > 0 && (() => {
        const boxX = Math.min(planeSvgX + 6, PAD_L + gW - 52);
        const boxY = Math.max(PAD_T + 4, Math.min(planeSvgY - 12, PAD_T + gH - 26));
        return (
          <g>
            <rect x={boxX} y={boxY} width="50" height="20" rx="4"
              fill={crashed ? "rgba(255,77,109,0.15)" : "rgba(255,183,3,0.12)"}
              stroke={crashed ? "rgba(255,77,109,0.4)" : "rgba(255,183,3,0.35)"} strokeWidth="1" />
            <text x={boxX + 25} y={boxY + 14} textAnchor="middle"
              fontSize="11" fontFamily="JetBrains Mono, monospace"
              fill={crashed ? "#ff4d6d" : "#ffb703"} fontWeight="700">
              {Number(mult).toFixed(2)}×
            </text>
          </g>
        );
      })()}
      <text x={PAD_L - 6} y={PAD_T + gH + 4} textAnchor="end"
        fontSize="9.5" fontFamily="JetBrains Mono, monospace" fill="rgba(107,122,153,0.6)">1×</text>
    </svg>
  );
}