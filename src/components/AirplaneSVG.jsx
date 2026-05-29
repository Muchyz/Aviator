export default function AirplaneSVG({ crashed }) {
  const bodyColor = crashed ? "#ff3355" : "#e8f2ff";
  const wingColor = crashed ? "#cc2244" : "#b8d4f0";
  const accentColor = crashed ? "#ff6680" : "#ffffff";
  const engineColor = crashed ? "#882233" : "#6a8aaa";
  const glowColor = crashed ? "255,51,85" : "180,210,255";
  const stripeColor = crashed ? "rgba(255,120,140,0.7)" : "rgba(79,142,247,0.85)";

  return (
    <div
      style={{
        position: "relative",
        width: 88,
        height: 56,
        filter: crashed
          ? `drop-shadow(0 0 8px rgba(255,51,85,0.9)) drop-shadow(0 0 20px rgba(255,0,40,0.5))`
          : `drop-shadow(0 0 6px rgba(180,210,255,0.5)) drop-shadow(0 0 16px rgba(79,142,247,0.3))`,
        transition: "filter 0.3s ease",
      }}
    >
      <svg
        width="88"
        height="56"
        viewBox="0 0 88 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fuselage gradient — top-lit */}
          <linearGradient id="fuseGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.95" />
            <stop offset="38%" stopColor={bodyColor} stopOpacity="1" />
            <stop offset="100%" stopColor={engineColor} stopOpacity="0.9" />
          </linearGradient>

          {/* Wing gradient */}
          <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor={bodyColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={engineColor} stopOpacity="0.6" />
          </linearGradient>

          {/* Engine pod gradient */}
          <linearGradient id="engGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#1a2a3a" />
            <stop offset="40%" stopColor="#3a5060" />
            <stop offset="100%" stopColor="#223040" />
          </linearGradient>

          {/* Cockpit glass */}
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="rgba(160,220,255,0.9)" />
            <stop offset="100%" stopColor="rgba(40,90,160,0.7)" />
          </linearGradient>

          {/* Exhaust glow */}
          <radialGradient id="exhaustGrad" cx="100%" cy="50%" r="100%">
            <stop offset="0%" stopColor="rgba(255,160,40,0.9)" />
            <stop offset="50%" stopColor="rgba(255,80,20,0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* ── MAIN WING — swept, low mounted ── */}
        {/* Primary wing surface */}
        <path
          d="M42 30 L10 46 L18 47 L46 34 Z"
          fill="url(#wingGrad)"
          opacity="0.92"
        />
        {/* Wing leading edge highlight */}
        <path
          d="M42 30 L10 46"
          stroke={`rgba(${glowColor},0.45)`}
          strokeWidth="0.7"
          fill="none"
        />
        {/* Wing fold crease */}
        <path
          d="M28 39 L42 30"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* ── HORIZONTAL STABILIZER ── */}
        <path
          d="M66 24 L56 32 L60 33 L70 27 Z"
          fill="url(#wingGrad)"
          opacity="0.85"
        />
        <path
          d="M66 24 L56 32"
          stroke={`rgba(${glowColor},0.3)`}
          strokeWidth="0.5"
          fill="none"
        />

        {/* ── VERTICAL STABILIZER / FIN ── */}
        <path
          d="M67 24 L64 14 L70 20 L70 27 Z"
          fill={crashed ? "#cc2244" : "#c8dff0"}
          opacity="0.9"
        />
        {/* Fin leading edge */}
        <path
          d="M67 24 L64 14"
          stroke={accentColor}
          strokeWidth="0.6"
          strokeOpacity="0.5"
          fill="none"
        />

        {/* ── ENGINE NACELLE — rear-mounted, low ── */}
        {/* Pod body */}
        <path
          d="M30 34 Q26 30 24 32 Q22 34 24 37 Q26 40 30 38 Z"
          fill="url(#engGrad)"
          opacity="0.95"
        />
        {/* Intake lip */}
        <ellipse cx="24.5" cy="34.5" rx="2.2" ry="3.2" fill="#111820" />
        <ellipse cx="24.5" cy="34.5" rx="1.3" ry="2" fill="#050c14" />
        {/* Fan face shimmer */}
        <path
          d="M22.5 32.8 Q24.5 31.8 26.5 32.8"
          stroke="rgba(120,160,200,0.4)"
          strokeWidth="0.6"
          fill="none"
        />
        {/* Nozzle */}
        <path
          d="M30 34 Q32 35 30 38"
          stroke="rgba(80,100,120,0.8)"
          strokeWidth="1"
          fill="none"
        />

        {/* ── FUSELAGE ── */}
        {/* Main body — cigar shaped, flat bottom */}
        <path
          d="M18 30
             Q22 24 36 23
             Q52 22 64 26
             Q72 28 76 31
             Q80 33 78 35
             Q76 37 70 38
             Q52 40 32 38
             Q22 36 18 33 Z"
          fill="url(#fuseGrad)"
        />

        {/* Underside shadow */}
        <path
          d="M20 33
             Q36 38 60 37
             Q68 36 73 34
             Q70 38 60 39
             Q36 41 20 36 Z"
          fill="rgba(0,0,0,0.18)"
        />

        {/* Upper fuselage highlight */}
        <path
          d="M22 26
             Q40 23 62 25
             Q70 26 75 29
             Q68 25 54 24
             Q36 23 22 27 Z"
          fill="rgba(255,255,255,0.22)"
        />

        {/* ── NOSE — sharply tapered ── */}
        <path
          d="M76 31
             Q82 31.5 86 33
             Q85 35 82 35.5
             Q80 35.5 78 35 Z"
          fill={crashed ? "#ff8899" : "#deeeff"}
        />
        {/* Nose tip */}
        <path
          d="M84 33 Q86 33 86 33"
          stroke={accentColor}
          strokeWidth="0.5"
          strokeOpacity="0.6"
          fill="none"
        />

        {/* ── COCKPIT WINDSHIELD ── */}
        <path
          d="M70 27 Q74 26 78 29 Q76 27 72 27 Z"
          fill="url(#glassGrad)"
          opacity="0.85"
        />
        {/* Glass glint */}
        <path
          d="M71 27 Q74 26.2 77 28"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* ── CABIN WINDOWS ── */}
        {[52, 58, 64].map((wx, i) => (
          <g key={i}>
            <rect
              x={wx - 2}
              y="27"
              width="4.2"
              height="5.5"
              rx="1.3"
              fill="rgba(30,70,130,0.85)"
            />
            <rect
              x={wx - 1}
              y="27.5"
              width="1.5"
              height="2"
              rx="0.5"
              fill="rgba(180,230,255,0.55)"
            />
          </g>
        ))}

        {/* ── AIRLINE STRIPE ── */}
        <path
          d="M22 36.5 Q44 39 68 37.5 Q72 37 74 36"
          stroke={stripeColor}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Second thin accent stripe */}
        <path
          d="M22 34.8 Q44 37 68 35.8 Q72 35.2 74 34.4"
          stroke={stripeColor}
          strokeWidth="0.5"
          strokeOpacity="0.45"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── LANDING GEAR FAIRING (subtle bump) ── */}
        <ellipse cx="38" cy="39" rx="4" ry="1.5" fill="rgba(0,0,0,0.22)" />

        {/* ── EXHAUST GLOW when flying ── */}
        {!crashed && (
          <g>
            <ellipse cx="29" cy="36" rx="2.5" ry="1.8" fill="rgba(255,160,40,0.5)" />
            <ellipse cx="27" cy="36" rx="1.5" ry="1.2" fill="rgba(255,220,120,0.4)" />
          </g>
        )}

        {/* ── CRASH SPARKS ── */}
        {crashed && (
          <g>
            <line x1="78" y1="29" x2="85" y2="22" stroke="#ffdd44" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="80" y1="32" x2="88" y2="28" stroke="#ff9933" strokeWidth="1.1" strokeLinecap="round" />
            <line x1="79" y1="36" x2="87" y2="39" stroke="#ff5533" strokeWidth="0.9" strokeLinecap="round" />
            <circle cx="85" cy="22" r="1.6" fill="#ffee44" />
            <circle cx="88" cy="28" r="1.1" fill="#ffaa22" />
            <circle cx="87" cy="39" r="0.9" fill="#ff6644" />
          </g>
        )}
      </svg>
    </div>
  );
}