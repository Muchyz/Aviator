import AirplaneSVG from "./AirplaneSVG";

export default function PlaneOverlay({ pct, mult, maxMult, crashed }) {
  const W = 600, H = 300;
  const PAD_L = 46, PAD_B = 28, PAD_R = 20, PAD_T = 20;
  const gW = W - PAD_L - PAD_R;
  const gH = H - PAD_T - PAD_B;
  const svgX = PAD_L + pct * gW;
  const ratio = (mult - 1) / (Math.max(1.5, maxMult) - 1);
  const svgY = PAD_T + gH - Math.min(ratio, 1) * gH;
  const leftPct = (svgX / W) * 100;
  const bottomPct = ((H - svgY) / H) * 100;
  return (
    <div style={{
      position: "absolute",
      left: `${leftPct}%`,
      bottom: `${bottomPct}%`,
      transform: "translate(-10%, 50%)",
      pointerEvents: "none",
      zIndex: 7,
      transition: crashed ? "none" : "left 0.12s linear, bottom 0.12s linear",
    }}>
      <AirplaneSVG crashed={crashed} />
    </div>
  );
}