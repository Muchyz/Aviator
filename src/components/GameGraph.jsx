import { useRef, useEffect } from "react";

const PAD_L = 56, PAD_B = 36, PAD_R = 28, PAD_T = 28;

// SHARED curve — must match PlaneOverlay exactly
function getCurvedY(mult, maxMult, gH) {
  const normalized = (mult - 1) / (Math.max(maxMult, 1.8) - 1);
  const curved = Math.pow(Math.max(0, normalized), 1.6);
  return gH - Math.min(curved, 1.0) * gH;
}

export default function GameGraph({ gs, mult, pathPts, crashed }) {
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const frameRef     = useRef(0);
  const particlesRef = useRef([]);
  const smokeRef     = useRef([]);
  const shakeRef     = useRef({ intensity: 0 });
  const crashFrameRef   = useRef(0);
  const prevCrashedRef  = useRef(false);

  // Live refs — no stale closures
  const gsRef       = useRef(gs);
  const multRef     = useRef(mult);
  const pathPtsRef  = useRef(pathPts);
  const crashedRef  = useRef(crashed);

  gsRef.current      = gs;
  multRef.current    = mult;
  pathPtsRef.current = pathPts;
  crashedRef.current = crashed;

  // Trigger crash effects once on crash
  useEffect(() => {
    if (crashed && !prevCrashedRef.current) {
      crashFrameRef.current = 0;
      shakeRef.current = { intensity: 7 };
      const pts = pathPtsRef.current;
      if (pts.length > 0) {
        const last = pts[pts.length - 1];
        smokeRef.current = Array.from({ length: 20 }, () => ({
          relPct: last.pct,
          relMult: last.mult,
          x: 0, y: 0,
          resolved: false,
          vx: (Math.random() - 0.5) * 3,
          vy: -(Math.random() * 2.2 + 0.6),
          life: 1,
          decay: 0.013 + Math.random() * 0.015,
          size: Math.random() * 8 + 3,
          hue: Math.random() > 0.5 ? 0 : 20,
        }));
      }
    }
    prevCrashedRef.current = crashed;
  }, [crashed]);

  const spawnParticle = (x, y, color) => {
    if (particlesRef.current.length > 60) particlesRef.current.shift();
    particlesRef.current.push({
      x, y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(Math.random() * 1.0 + 0.15),
      life: 1,
      decay: 0.03 + Math.random() * 0.025,
      size: Math.random() * 1.4 + 0.3,
      color,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDims = () => {
      const r = canvas.getBoundingClientRect();
      return { W: r.width || 600, H: r.height || 300 };
    };

    const render = () => {
      frameRef.current++;
      const frame   = frameRef.current;
      const mult    = multRef.current;
      const pathPts = pathPtsRef.current;
      const crashed = crashedRef.current;
      const gs      = gsRef.current;

      const { W, H } = getDims();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        canvas.width  !== Math.round(W * dpr) ||
        canvas.height !== Math.round(H * dpr)
      ) {
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      const ctx = canvas.getContext("2d");

      // Screen shake on crash
      let sx = 0, sy = 0;
      if (crashed && shakeRef.current.intensity > 0.3) {
        const sh = shakeRef.current.intensity;
        sx = (Math.random() - 0.5) * sh;
        sy = (Math.random() - 0.5) * sh;
        shakeRef.current.intensity *= 0.78;
      }

      ctx.setTransform(dpr, 0, 0, dpr, sx, sy);
      ctx.clearRect(-4, -4, W + 8, H + 8);

      const gW = W - PAD_L - PAD_R;
      const gH = H - PAD_T - PAD_B;

      // maxMult drives the Y scale — slight breathing room above curve
      const maxMult = Math.max(1.8, mult * 1.12 + 0.4);

      const toX = (pct) => PAD_L + pct * gW;
      const toY = (m)   => PAD_T + getCurvedY(m, maxMult, gH);

      const lineColor = crashed ? "#ff3355" : "#4f8ef7";
      const glowRGB   = crashed ? "255,51,85" : "79,142,247";

      // ── GRID LINES ──
      const range    = maxMult - 1;
      const rawStep  = range / 5;
      const niceSteps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];
      const tickStep = niceSteps.find(s => s >= rawStep) || rawStep;
      const breathe  = gs === "flying"
        ? 0.022 + Math.sin(frame * 0.035) * 0.008
        : 0.018;

      for (let v = 1; v <= maxMult + tickStep; v += tickStep) {
        if (v > maxMult + 0.05) break;
        const y = toY(v);
        if (y < PAD_T - 2 || y > PAD_T + gH + 2) continue;

        const lg = ctx.createLinearGradient(PAD_L, 0, PAD_L + gW, 0);
        lg.addColorStop(0,    "rgba(255,255,255,0)");
        lg.addColorStop(0.05, `rgba(255,255,255,${breathe})`);
        lg.addColorStop(0.9,  `rgba(255,255,255,${breathe * 0.35})`);
        lg.addColorStop(1,    "rgba(255,255,255,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 16]);
        ctx.beginPath();
        ctx.moveTo(PAD_L, y);
        ctx.lineTo(PAD_L + gW, y);
        ctx.stroke();
        ctx.setLineDash([]);

        const isNear = pathPts.length > 0 && Math.abs(mult - v) < tickStep * 0.55;
        ctx.font = `${isNear ? "700" : "500"} 10px 'JetBrains Mono',monospace`;
        ctx.fillStyle = isNear
          ? `rgba(${glowRGB},0.92)`
          : "rgba(80,95,130,0.52)";
        ctx.textAlign = "right";
        ctx.shadowColor = isNear ? `rgba(${glowRGB},0.65)` : "transparent";
        ctx.shadowBlur  = isNear ? 6 : 0;
        ctx.fillText(
          v % 1 === 0 ? `${v}×` : `${v.toFixed(1)}×`,
          PAD_L - 7, y + 4
        );
        ctx.shadowBlur = 0;
      }

      // Vertical faint guides
      for (let i = 1; i <= 4; i++) {
        const x = PAD_L + (gW * i) / 4;
        ctx.strokeStyle = "rgba(255,255,255,0.014)";
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 14]);
        ctx.beginPath();
        ctx.moveTo(x, PAD_T);
        ctx.lineTo(x, PAD_T + gH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Axes
      ctx.strokeStyle = "rgba(255,255,255,0.055)";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_L, PAD_T);
      ctx.lineTo(PAD_L, PAD_T + gH + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PAD_L - 1, PAD_T + gH);
      ctx.lineTo(PAD_L + gW, PAD_T + gH);
      ctx.stroke();

      if (pathPts.length < 2) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const pts  = pathPts.map(p => ({ x: toX(p.pct), y: toY(p.mult) }));
      const last = pts[pts.length - 1];

      // Smooth cubic bezier path tracer
      const tracePath = (c) => {
        c.beginPath();
        c.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const cur  = pts[i];
          const cpx1 = prev.x + (cur.x - prev.x) * 0.44;
          const cpx2 = cur.x  - (cur.x - prev.x) * 0.44;
          c.bezierCurveTo(cpx1, prev.y, cpx2, cur.y, cur.x, cur.y);
        }
      };

      ctx.save();
      ctx.beginPath();
      ctx.rect(PAD_L, PAD_T, gW, gH);
      ctx.clip();

      // ── AREA FILL — subtle and premium ──
      tracePath(ctx);
      ctx.lineTo(last.x, PAD_T + gH);
      ctx.lineTo(pts[0].x, PAD_T + gH);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + gH);
      if (crashed) {
        areaGrad.addColorStop(0,   "rgba(255,51,85,0.18)");
        areaGrad.addColorStop(0.5, "rgba(200,20,50,0.05)");
        areaGrad.addColorStop(1,   "rgba(0,0,0,0)");
      } else {
        areaGrad.addColorStop(0,   "rgba(79,142,247,0.16)");
        areaGrad.addColorStop(0.45,"rgba(50,100,220,0.05)");
        areaGrad.addColorStop(1,   "rgba(0,0,0,0)");
      }
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // ── LINE PASS 1 — wide soft outer bloom ──
      tracePath(ctx);
      ctx.strokeStyle = `rgba(${glowRGB},0.06)`;
      ctx.lineWidth   = 18;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();

      // ── LINE PASS 2 — mid glow ──
      tracePath(ctx);
      ctx.strokeStyle  = `rgba(${glowRGB},0.25)`;
      ctx.lineWidth    = 5;
      ctx.shadowColor  = lineColor;
      ctx.shadowBlur   = 12;
      ctx.stroke();
      ctx.shadowBlur   = 0;

      // ── LINE PASS 3 — crisp core ──
      const coreGrad = ctx.createLinearGradient(pts[0].x, 0, last.x, 0);
      if (crashed) {
        coreGrad.addColorStop(0,   "rgba(255,51,85,0.4)");
        coreGrad.addColorStop(0.7, "#ff3355");
        coreGrad.addColorStop(1,   "#ff99aa");
      } else {
        coreGrad.addColorStop(0,   "rgba(50,100,220,0.4)");
        coreGrad.addColorStop(0.6, "#4f8ef7");
        coreGrad.addColorStop(1,   "#aaccff");
      }
      tracePath(ctx);
      ctx.strokeStyle  = coreGrad;
      ctx.lineWidth    = 1.6;
      ctx.shadowColor  = lineColor;
      ctx.shadowBlur   = 7;
      ctx.stroke();
      ctx.shadowBlur   = 0;

      // ── PARTICLES — engine trail ──
      if (gs === "flying" && frame % 3 === 0 && last.x > PAD_L && last.y > PAD_T) {
        spawnParticle(last.x, last.y, lineColor);
        if (mult > 4) spawnParticle(last.x - 2, last.y + 2, lineColor);
        if (mult > 9) spawnParticle(last.x - 5, last.y + 3, "#ffffff");
      }
      particlesRef.current = particlesRef.current.filter(p => p.life > 0.04);
      particlesRef.current.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.035;
        p.vx *= 0.97;
        p.life -= p.decay;
        const a  = Math.max(0, p.life);
        const ah = Math.floor(a * 190).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fillStyle  = p.color + ah;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── ANIMATED TIP — flying ──
      if (!crashed && gs === "flying" && last.x > PAD_L && last.y > PAD_T) {
        const pulse = (Math.sin(frame * 0.14) + 1) / 2;
        // Outer ring
        ctx.beginPath();
        ctx.arc(last.x, last.y, 8 + pulse * 11, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowRGB},${0.04 + pulse * 0.07})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Inner ring
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4 + pulse * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowRGB},${0.18 + pulse * 0.18})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        // Core dot
        const dotG = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 4);
        dotG.addColorStop(0,   "#ffffff");
        dotG.addColorStop(0.4, lineColor);
        dotG.addColorStop(1,   `rgba(${glowRGB},0)`);
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle  = dotG;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── CRASH EFFECTS ──
      if (crashed && last.x > PAD_L) {
        crashFrameRef.current++;
        const cf = crashFrameRef.current;

        // Flash fade
        if (cf < 12) {
          const fa = Math.max(0, (12 - cf) / 12) * 0.25;
          ctx.fillStyle = `rgba(255,60,80,${fa})`;
          ctx.fillRect(PAD_L, PAD_T, gW, gH);
        }

        // Expanding shockwaves
        for (let r = 0; r < 3; r++) {
          const radius = 6 + r * 12 + Math.min(cf * 0.45, 28);
          if (radius > 80) continue;
          ctx.beginPath();
          ctx.arc(last.x, last.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,51,85,${Math.max(0, 0.28 - r * 0.08 - cf * 0.004)})`;
          ctx.lineWidth = 1.5 - r * 0.35;
          ctx.stroke();
        }

        // X mark
        const xs = 6 + Math.sin(frame * 0.25) * 0.6;
        ctx.strokeStyle = "rgba(255,70,90,0.88)";
        ctx.lineWidth   = 1.8;
        ctx.lineCap     = "round";
        ctx.shadowColor = "#ff3355";
        ctx.shadowBlur  = 9;
[[-1, -1, 1, 1], [1, -1, -1, 1]].forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath();
          ctx.moveTo(last.x + x1 * xs, last.y + y1 * xs);
          ctx.lineTo(last.x + x2 * xs, last.y + y2 * xs);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;

        // Smoke particles
        smokeRef.current = smokeRef.current.filter(p => p.life > 0.02);
        smokeRef.current.forEach(p => {
          if (!p.resolved) {
            p.x = toX(p.relPct);
            p.y = toY(p.relMult);
            p.resolved = true;
          }
          p.x += p.vx; p.y += p.vy;
          p.vy += 0.05; p.vx *= 0.96;
          p.life -= p.decay;
          p.size = Math.min(p.size + 0.2, 18);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},60%,50%,${p.life * 0.22})`;
          ctx.fill();
        });
      }

      ctx.restore();

      // ── MULTIPLIER CALLOUT BOX ──
      const boxW = 60, boxH = 22;
      const bx = Math.min(last.x + 10, PAD_L + gW - boxW - 4);
      const by = Math.max(PAD_T + 4, Math.min(last.y - 13, PAD_T + gH - boxH - 4));
      ctx.save();
      ctx.shadowColor = lineColor;
      ctx.shadowBlur  = crashed ? 0 : 10;
      roundRect(ctx, bx, by, boxW, boxH, 5);
      const boxBg = ctx.createLinearGradient(bx, by, bx, by + boxH);
      boxBg.addColorStop(0, `rgba(${glowRGB},0.18)`);
      boxBg.addColorStop(1, `rgba(${glowRGB},0.04)`);
      ctx.fillStyle   = boxBg;
      ctx.fill();
      ctx.strokeStyle = `rgba(${glowRGB},0.5)`;
      ctx.lineWidth   = 1;
      roundRect(ctx, bx, by, boxW, boxH, 5);
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.font        = "bold 11px 'JetBrains Mono',monospace";
      ctx.fillStyle   = crashed ? "#ff99aa" : "#aaccff";
      ctx.textAlign   = "center";
      ctx.shadowColor = lineColor;
      ctx.shadowBlur  = 6;
      ctx.fillText(`${Number(mult).toFixed(2)}×`, bx + boxW / 2, by + 15);
      ctx.shadowBlur  = 0;
      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(() => {});
    obs.observe(canvas);
    return () => obs.disconnect();
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
      }}
    />
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}