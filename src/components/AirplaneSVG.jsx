export default function AirplaneSVG({ crashed = false }) {
  const color = crashed ? "#ff4d6d" : "#ffffff";
  const accent = crashed ? "#ff8099" : "#e8f0ff";
  const wingColor = crashed ? "#cc2244" : "#c8d8f8";
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none"
      style={{
        display: "block",
        filter: crashed
          ? "drop-shadow(0 0 8px rgba(255,77,109,0.9)) drop-shadow(0 0 16px rgba(255,77,109,0.5))"
          : "drop-shadow(0 0 6px rgba(200,220,255,0.7)) drop-shadow(0 0 14px rgba(150,190,255,0.4))",
        transform: crashed ? "rotate(25deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease, filter 0.3s ease",
      }}>
      {!crashed && (
        <g opacity="0.85">
          <ellipse cx="7" cy="22" rx="7" ry="3.5" fill="url(#flameGrad1)" />
          <ellipse cx="4" cy="22" rx="4" ry="2" fill="url(#flameGrad2)" opacity="0.7" />
          <ellipse cx="2" cy="22" rx="2" ry="1.2" fill="#fff" opacity="0.5" />
        </g>
      )}
      <defs>
        <linearGradient id="flameGrad1" x1="0" y1="0" x2="14" y2="0">
          <stop offset="0%" stopColor="#ff6b00" stopOpacity="0" />
          <stop offset="40%" stopColor="#ff9500" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffdd00" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="flameGrad2" x1="0" y1="0" x2="8" y2="0">
          <stop offset="0%" stopColor="#ff4400" stopOpacity="0" />
          <stop offset="100%" stopColor="#ff8800" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="10" y1="18" x2="10" y2="26">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wingColor} />
          <stop offset="100%" stopColor={crashed ? "#991133" : "#8aaee0"} />
        </linearGradient>
      </defs>
      <path d="M14 19.5 Q20 17 40 17.5 Q58 18 66 21 Q58 24 40 24.5 Q20 25 14 22.5 Z" fill="url(#bodyGrad)" />
      <path d="M60 19 L72 21 L60 23 Z" fill={accent} />
      <path d="M30 20 L18 6 L44 18 Z" fill="url(#wingGrad)" opacity="0.95" />
      <path d="M30 22 L18 34 L44 22 Z" fill={wingColor} opacity="0.5" />
      <path d="M16 20 L13 11 L22 18 Z" fill={accent} opacity="0.9" />
      <path d="M14 21 L8 16 L20 20 Z" fill={wingColor} opacity="0.75" />
      <path d="M14 21 L8 26 L20 22 Z" fill={wingColor} opacity="0.6" />
      <ellipse cx="28" cy="24" rx="5" ry="2.5" fill={crashed ? "#882233" : "#7090c0"} />
      <ellipse cx="26" cy="24" rx="2" ry="2.2" fill={crashed ? "#aa3344" : "#4060a0"} />
      <ellipse cx="54" cy="19.5" rx="3.5" ry="2" fill="rgba(150,220,255,0.6)" />
      <ellipse cx="48" cy="19" rx="2.5" ry="1.8" fill="rgba(150,220,255,0.4)" />
    </svg>
  );
}