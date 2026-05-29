export default function AirplaneSVG({ crashed }) {
  return (
    <div style={{
      position: "relative",
      width: 72,
      height: 72,
      filter: crashed
        ? "drop-shadow(0 0 12px #ff4d6d) drop-shadow(0 0 24px #ff004466)"
        : "drop-shadow(0 0 10px #f0b429) drop-shadow(0 0 22px #f0b42988)",
      transform: crashed ? "rotate(20deg)" : "rotate(-12deg)",
      transition: "transform 0.3s ease, filter 0.3s ease",
    }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={crashed ? "#ff8fa3" : "#ffffff"} />
            <stop offset="40%" stopColor={crashed ? "#ff4d6d" : "#e8f4fd"} />
            <stop offset="100%" stopColor={crashed ? "#c0002a" : "#9ec8e8"} />
          </linearGradient>
          <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={crashed ? "#ff6b87" : "#d0e8f5"} />
            <stop offset="100%" stopColor={crashed ? "#aa0020" : "#6aa8cc"} />
          </linearGradient>
          <linearGradient id="engineGrad" x1="0" y1="0" x2="20" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#888" />
            <stop offset="100%" stopColor="#ccc" />
          </linearGradient>
          <radialGradient id="windowGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#a8e4ff" />
            <stop offset="100%" stopColor="#2b7baa" />
          </radialGradient>
        </defs>

        {/* Engine nacelle */}
        <ellipse cx="22" cy="40" rx="10" ry="5" fill="url(#engineGrad)" opacity="0.9" />
        <ellipse cx="14" cy="40" rx="4" ry="4.5" fill="#555" />
        <ellipse cx="14" cy="40" rx="2.5" ry="3" fill="#222" />
        <path d="M11 37.5 Q14 36 17 37.5" stroke="#aaa" strokeWidth="0.8" fill="none" opacity="0.7" />

        {/* Main wing */}
        <path d="M30 34 L8 48 L14 49 L36 38 Z" fill="url(#wingGrad)" opacity="0.95" />
        <path d="M30 34 L8 48" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none" />
        <path d="M22 43 L30 34" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" fill="none" />

        {/* Tail horizontal stabilizer */}
        <path d="M52 30 L44 38 L48 39 L56 32 Z" fill="url(#wingGrad)" opacity="0.9" />

        {/* Tail vertical stabilizer */}
        <path d="M52 30 L50 22 L55 28 L56 32 Z" fill={crashed ? "#dd2244" : "#b8d8ee"} opacity="0.95" />
        <path d="M52 30 L50 22" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" fill="none" />

        {/* Fuselage */}
        <path
          d="M16 36 Q20 28 36 28 Q52 28 60 34 Q64 37 62 40 Q60 43 52 43 Q36 44 20 40 Z"
          fill="url(#bodyGrad)"
        />
        <path
          d="M20 40 Q36 44 52 43 Q58 42 61 40 Q59 44 50 45 Q34 46 18 41 Z"
          fill="rgba(0,0,0,0.12)"
        />
        <path
          d="M22 30 Q36 27 52 29 Q58 30 61 33 Q56 29 36 29 Q22 29 18 33 Z"
          fill="rgba(255,255,255,0.35)"
        />

        {/* Nose cone */}
        <path d="M60 34 Q68 36 67 38 Q66 40 60 40 L62 37 Z" fill={crashed ? "#ff8fa3" : "#e0f0ff"} />
        <path d="M60 34 Q68 36 67 38" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" fill="none" />

        {/* Windows */}
        {[38, 44, 50, 56].map((wx, i) => (
          <g key={i}>
            <ellipse cx={wx} cy="34.5" rx="2.2" ry="2.8" fill="url(#windowGrad)" opacity="0.9" />
            <ellipse cx={wx - 0.5} cy="33.5" rx="0.8" ry="0.9" fill="rgba(255,255,255,0.6)" />
          </g>
        ))}

        {/* Cockpit windshield */}
        <path d="M58 32 Q62 33 64 36 Q62 34 57 34 Z" fill="rgba(160,220,255,0.7)" />
        <path d="M58 32 Q62 33 64 36" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" fill="none" />

        {/* Airline stripe */}
        <path
          d="M20 39.5 Q36 41 52 40.5 Q56 40 58 39"
          stroke={crashed ? "rgba(255,100,120,0.6)" : "rgba(240,180,41,0.7)"}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Engine exhaust glow when flying */}
        {!crashed && (
          <>
            <ellipse cx="12" cy="40" rx="3" ry="2.5" fill="#f0b429" opacity="0.35" />
            <ellipse cx="10" cy="40" rx="2" ry="1.8" fill="#fff" opacity="0.2" />
          </>
        )}

        {/* Crash sparks */}
        {crashed && (
          <g opacity="0.85">
            <line x1="60" y1="32" x2="66" y2="26" stroke="#ffdd44" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="62" y1="35" x2="69" y2="32" stroke="#ff8844" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="61" y1="38" x2="68" y2="40" stroke="#ff4444" strokeWidth="1" strokeLinecap="round" />
            <circle cx="66" cy="26" r="1.5" fill="#ffee00" />
            <circle cx="69" cy="32" r="1" fill="#ffaa00" />
          </g>
        )}
      </svg>
    </div>
  );
}