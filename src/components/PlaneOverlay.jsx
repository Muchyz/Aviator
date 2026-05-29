import AirplaneSVG from "./AirplaneSVG";

const PAD_L = 56, PAD_B = 36, PAD_R = 28, PAD_T = 28;

// Matches the EXACT same Y curve used in GameGraph
function getCurvedY(mult, maxMult, gH) {
  const normalized = (mult - 1) / (Math.max(maxMult, 1.8) - 1);
  // Power 1.6 = stays near flat until ~2x, then curves up naturally
  const curved = Math.pow(Math.max(0, normalized), 1.6);
  return gH - Math.min(curved, 1.0) * gH;
}

export default function PlaneOverlay({ pct, mult, maxMult, crashed }) {
  // Use % positions so plane tracks correctly across all screen sizes
  const W = 600, H = 300;
  const gW = W - PAD_L - PAD_R;
  const gH = H - PAD_T - PAD_B;

  const curvedY = getCurvedY(mult, maxMult, gH);
  const svgX = PAD_L + pct * gW;
  const svgY = PAD_T + curvedY;

  const leftPct = (svgX / W) * 100;
  const topPct  = (svgY / H) * 100;

  // Tilt angle: nearly flat at 1x, smooth arc to ~-32° at high mult
  const ratio = Math.min(curvedY / gH, 1); // 1 = at baseline, 0 = top
  const climbRatio = 1 - ratio; // 0 at start, 1 at peak climb
  const tiltDeg = crashed
    ? 28
    : -(3 + Math.pow(climbRatio, 1.4) * 30);

  // Trail opacity and length scale with speed/mult
  const trailScale = Math.min((mult - 1) / 8, 1);

  return (
    <div
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: `translate(-50%, -52%) rotate(${tiltDeg}deg)`,
        pointerEvents: "none",
        zIndex: 7,
        // Smooth but snappy — 60ms feels physical
        transition: crashed
          ? "transform 0.25s ease-in"
          : "left 0.06s linear, top 0.06s linear, transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)",
        willChange: "left, top, transform",
      }}
    >
      {/* ── JET TRAIL — outer wide bloom ── */}
      {!crashed && (
        <div
          style={{
            position: "absolute",
            right: "72%",
            top: "50%",
            transform: "translateY(-50%)",
            width: `${40 + trailScale * 55}px`,
            height: "22px",
            background:
              "linear-gradient(to left, rgba(120,180,255,0.13), rgba(79,142,247,0.05), transparent)",
            borderRadius: "0 8px 8px 0",
            filter: "blur(6px)",
            pointerEvents: "none",
            opacity: 0.6 + trailScale * 0.4,
          }}
        />
      )}

      {/* ── JET TRAIL — mid haze ── */}
      {!crashed && (
        <div
          style={{
            position: "absolute",
            right: "70%",
            top: "50%",
            transform: "translateY(-50%)",
            width: `${22 + trailScale * 38}px`,
            height: "10px",
            background:
              "linear-gradient(to left, rgba(180,220,255,0.22), rgba(140,190,255,0.08), transparent)",
            borderRadius: "0 5px 5px 0",
            filter: "blur(3px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── JET TRAIL — hot exhaust core ── */}
      {!crashed && (
        <div
          style={{
            position: "absolute",
            right: "68%",
            top: "51%",
            transform: "translateY(-50%)",
            width: `${10 + trailScale * 18}px`,
            height: "5px",
            background:
              "linear-gradient(to left, rgba(255,200,80,0.75), rgba(255,120,30,0.35), transparent)",
            borderRadius: "0 3px 3px 0",
            filter: "blur(1.5px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── PLANE ── */}
      <AirplaneSVG crashed={crashed} />
    </div>
  );
}