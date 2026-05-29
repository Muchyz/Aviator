import AirplaneSVG from "./AirplaneSVG";

const PAD_L = 56, PAD_B = 36, PAD_R = 28, PAD_T = 28;

export default function PlaneOverlay({ pct, mult, maxMult, crashed }) {
  const W = 600, H = 300;
  const gW = W - PAD_L - PAD_R;
  const gH = H - PAD_T - PAD_B;

  const svgX = PAD_L + pct * gW;
  const ratio = (mult - 1) / (Math.max(1.5, maxMult) - 1);
  const clampedRatio = Math.min(ratio, 1.0);
  const svgY = PAD_T + gH - clampedRatio * gH;

  const leftPct = (svgX / W) * 100;
  const topPct = (svgY / H) * 100;

  return (
    <div style={{
      position: "absolute",
      left: `${leftPct}%`,
      top: `${topPct}%`,
      transform: "translate(-50%, -55%)",
      pointerEvents: "none",
      zIndex: 7,
      transition: crashed ? "none" : "left 0.1s linear, top 0.1s linear",
    }}>
      <AirplaneSVG crashed={crashed} />
    </div>
  );
}