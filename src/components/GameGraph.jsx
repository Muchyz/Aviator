import { useRef, useEffect } from "react";

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default function GameGraph({
  gs, mult = 1, pathPts = [], crashed = false,
  roundId, onlinePlayers, waiting = false, countdown = 0,
}) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const frameRef  = useRef(0);

  const multRef      = useRef(mult);
  const crashedRef   = useRef(crashed);
  const waitingRef   = useRef(waiting);
  const countdownRef = useRef(countdown);

  multRef.current      = mult;
  crashedRef.current   = crashed;
  waitingRef.current   = waiting;
  countdownRef.current = countdown;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDims = () => {
      const r = canvas.getBoundingClientRect();
      return { W: r.width || 360, H: r.height || 220 };
    };

    const drawRays = (ctx, W, H) => {
      const RX = W * 0.0;
      const RY = H * 1.0;
      const RAY_COUNT = 28;
      const RAY_LEN   = Math.sqrt(W * W + H * H) * 1.5;
      const START_ANG = -Math.PI * 0.02;
      const END_ANG   = -Math.PI * 0.80;

      for (let i = 0; i < RAY_COUNT; i++) {
        const frac  = i / (RAY_COUNT - 1);
        const angle = START_ANG + (END_ANG - START_ANG) * frac;
        const halfW = (Math.PI * 0.78 / RAY_COUNT) * 0.55;

        ctx.beginPath();
        ctx.moveTo(RX, RY);
        ctx.arc(RX, RY, RAY_LEN, angle - halfW, angle + halfW);
        ctx.closePath();

        const bright = i % 2 === 0;
        ctx.fillStyle = bright
          ? "rgba(85,85,100,0.11)"
          : "rgba(55,55,70,0.06)";
        ctx.fill();
      }
    };

    const render = () => {
      frameRef.current++;
      const frame   = frameRef.current;
      const mult    = multRef.current;
      const crashed = crashedRef.current;
      const waiting = waitingRef.current;

      const { W, H } = getDims();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width  !== Math.round(W * dpr) ||
          canvas.height !== Math.round(H * dpr)) {
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#111118";
      ctx.fillRect(0, 0, W, H);

      const vig = ctx.createRadialGradient(W*0.5, H*0.45, H*0.1, W*0.5, H*0.45, H*0.95);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      drawRays(ctx, W, H);

      // ── WAITING STATE
      if (waiting) {
        const p = 0.5 + Math.sin(frame * 0.08) * 0.5;

        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";

        ctx.font        = `700 ${clamp(W * 0.042, 13, 18)}px 'Arial',sans-serif`;
        ctx.fillStyle   = `rgba(200,210,230,${0.5 + p * 0.35})`;
        ctx.shadowColor = "rgba(120,160,255,0.5)";
        ctx.shadowBlur  = 12;
        ctx.fillText("STARTING IN", W / 2, H * 0.33);

        ctx.font        = `900 ${clamp(W * 0.22, 66, 110)}px 'Arial Black',sans-serif`;
        ctx.fillStyle = mult >= 10 ? "#ec4899" : mult >= 2 ? "#a855f7" : "#3b82f6";
        ctx.shadowColor = "rgba(255,255,255,0.6)";
        ctx.shadowBlur  = 24 + p * 10;
        ctx.fillText(`${countdownRef.current}`, W / 2, H * 0.57);
        ctx.shadowBlur  = 0;

        animRef.current = requestAnimationFrame(render);
        return;
      }

      // ── MULTIPLIER TEXT
      const fs = clamp(W * 0.175, 48, 96);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      if (crashed) {
        const labelFs = clamp(W * 0.062, 16, 28);
        ctx.font        = `800 ${labelFs}px 'Arial Black',sans-serif`;
        ctx.fillStyle   = "#ff1a1a";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur  = 20;
        ctx.fillText("FLEW AWAY!", W / 2, H * 0.38);

        ctx.font        = `900 italic ${fs}px 'Arial Black',sans-serif`;
        ctx.fillStyle   = "#ff1a1a";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur  = 18;
        ctx.fillText(`${mult.toFixed(2)}x`, W / 2, H * 0.57);
        ctx.shadowBlur  = 0;
      } else {
        ctx.font        = `900 italic ${fs}px 'Arial Black',sans-serif`;
        ctx.fillStyle   = "rgba(255,255,255,0.07)";
        ctx.shadowColor = "rgba(255,220,180,0.5)";
        ctx.shadowBlur  = 36;
        ctx.fillText(`${mult.toFixed(2)}x`, W / 2, H * 0.46);

        ctx.fillStyle = mult >= 10 ? "#ec4899" : mult >= 2 ? "#a855f7" : "#3b82f6";
        ctx.shadowColor = mult >= 10 ? "rgba(236,72,153,0.6)" : mult >= 2 ? "rgba(168,85,247,0.6)" : "rgba(59,130,246,0.6)";
        ctx.shadowBlur  = 8;
        ctx.fillText(`${mult.toFixed(2)}x`, W / 2, H * 0.46);
        ctx.shadowBlur  = 0;
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        borderRadius: "inherit",
      }}
    />
  );
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }
}