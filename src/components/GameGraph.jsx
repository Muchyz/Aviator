import { useRef, useEffect } from "react";

const PAD_L = 56, PAD_B = 36, PAD_R = 28, PAD_T = 28;
const W_BASE = 600, H_BASE = 300;

export default function GameGraph({ gs, mult, pathPts, crashed }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const frameRef = useRef(0);
  const particlesRef = useRef([]);

  const gsRef = useRef(gs);
  const multRef = useRef(mult);
  const pathPtsRef = useRef(pathPts);
  const crashedRef = useRef(crashed);

  gsRef.current = gs;
  multRef.current = mult;
  pathPtsRef.current = pathPts;
  crashedRef.current = crashed;

  const spawnParticle = (x, y, color) => {
    particlesRef.current.push({
      x, y,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(Math.random() * 2 + 0.5),
      life: 1,
      decay: 0.022 + Math.random() * 0.018,
      size: Math.random() * 2.5 + 0.8,
      color,
    });
    if (particlesRef.current.length > 80) particlesRef.current.shift();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDims = () => {
      const rect = canvas.getBoundingClientRect();
      return { W: rect.width || W_BASE, H: rect.height || H_BASE };
    };

    const render = () => {
      frameRef.current++;
      const gs = gsRef.current;
      const mult = multRef.current;
      const pathPts = pathPtsRef.current;
      const crashed = crashedRef.current;

      const { W, H } = getDims();
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const gW = W - PAD_L - PAD_R;
      const gH = H - PAD_T - PAD_B;
      const maxMult = Math.max(1.5, mult * 1.2 + 0.3);

      const toX = (pct) => PAD_L + pct * gW;
      const toY = (m) => {
        const ratio = (m - 1) / (maxMult - 1);
        return PAD_T + gH - Math.min(ratio, 1.05) * gH;
      };

      const t = frameRef.current;
      const lineColor = crashed ? "#ff4d6d" : "#f0b429";
      const glowRGB = crashed ? "255,77,109" : "240,180,41";

      // Deep background vignette
      const vgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
      vgGrad.addColorStop(0, "rgba(10,14,28,0)");
      vgGrad.addColorStop(1, "rgba(4,6,12,0.7)");
      ctx.fillStyle = vgGrad;
      ctx.fillRect(0, 0, W, H);

      // Animated grid
      const range = maxMult - 1;
      const rawStep = range / 5;
      const niceSteps = [0.2, 0.5, 1, 2, 5, 10, 20, 50];
      const tickStep = niceSteps.find(s => s >= rawStep) || rawStep;
      const gridPulse = gs === "flying" ? 0.03 + Math.sin(t * 0.04) * 0.015 : 0.03;

      for (let v = 1; v <= maxMult + tickStep * 0.5; v += tickStep) {
        if (v > maxMult + 0.1) break;
        const y = toY(v);
        if (y < PAD_T - 2 || y > PAD_T + gH + 2) continue;

        const lineGrad = ctx.createLinearGradient(PAD_L, 0, PAD_L + gW, 0);
        lineGrad.addColorStop(0, `rgba(255,255,255,0)`);
        lineGrad.addColorStop(0.1, `rgba(255,255,255,${gridPulse})`);
        lineGrad.addColorStop(1, `rgba(255,255,255,${gridPulse * 0.4})`);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 10]);
        ctx.beginPath();
        ctx.moveTo(PAD_L, y);
        ctx.lineTo(PAD_L + gW, y);
        ctx.stroke();
        ctx.setLineDash([]);

        const isNearCurrent = pathPts.length > 0 && Math.abs(mult - v) < tickStep * 0.6;
        ctx.font = `${isNearCurrent ? "600" : "500"} 10px 'JetBrains Mono', monospace`;
        ctx.fillStyle = isNearCurrent ? `rgba(${glowRGB},0.9)` : "rgba(107,122,153,0.65)";
        ctx.textAlign = "right";
        ctx.shadowColor = isNearCurrent ? `rgba(${glowRGB},0.6)` : "transparent";
        ctx.shadowBlur = isNearCurrent ? 6 : 0;
        ctx.fillText(v % 1 === 0 ? `${v}×` : `${v.toFixed(1)}×`, PAD_L - 8, y + 4);
        ctx.shadowBlur = 0;
      }

      // Vertical time markers
      for (let i = 1; i <= 4; i++) {
        const x = PAD_L + (gW * i) / 4;
        ctx.strokeStyle = "rgba(255,255,255,0.025)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 8]);
        ctx.beginPath();
        ctx.moveTo(x, PAD_T);
        ctx.lineTo(x, PAD_T + gH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Axes
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_L, PAD_T);
      ctx.lineTo(PAD_L, PAD_T + gH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PAD_L, PAD_T + gH);
      ctx.lineTo(PAD_L + gW, PAD_T + gH);
      ctx.stroke();

      if (pathPts.length < 2) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const pts = pathPts.map(p => ({ x: toX(p.pct), y: toY(p.mult) }));
      const last = pts[pts.length - 1];

      const tracePath = (c) => {
        c.beginPath();
        c.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1], cur = pts[i];
          const cpx1 = prev.x + (cur.x - prev.x) * 0.45;
          const cpx2 = prev.x + (cur.x - prev.x) * 0.55;
          c.bezierCurveTo(cpx1, prev.y, cpx2, cur.y, cur.x, cur.y);
        }
      };

      ctx.save();
      ctx.beginPath();
      ctx.rect(PAD_L, PAD_T, gW, gH);
      ctx.clip();

      // Volumetric area fill
      tracePath(ctx);
      ctx.lineTo(last.x, PAD_T + gH);
      ctx.lineTo(pts[0].x, PAD_T + gH);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + gH);
      if (crashed) {
        areaGrad.addColorStop(0, "rgba(255,77,109,0.28)");
        areaGrad.addColorStop(0.4, "rgba(255,77,109,0.10)");
        areaGrad.addColorStop(1, "rgba(255,30,60,0.0)");
      } else {
        areaGrad.addColorStop(0, "rgba(240,180,41,0.22)");
        areaGrad.addColorStop(0.35, "rgba(240,140,30,0.08)");
        areaGrad.addColorStop(1, "rgba(200,100,20,0.0)");
      }
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Bottom chromatic base line
      const baseGrad = ctx.createLinearGradient(pts[0].x, 0, last.x, 0);
      baseGrad.addColorStop(0, `rgba(${glowRGB},0)`);
      baseGrad.addColorStop(0.5, `rgba(${glowRGB},0.12)`);
      baseGrad.addColorStop(1, `rgba(${glowRGB},0)`);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(pts[0].x, PAD_T + gH - 2, last.x - pts[0].x, 2);

      // Triple-pass neon line — pass 1: wide bloom
      tracePath(ctx);
      ctx.strokeStyle = `rgba(${glowRGB},0.18)`;
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Pass 2: medium halo
      tracePath(ctx);
      ctx.strokeStyle = `rgba(${glowRGB},0.45)`;
      ctx.lineWidth = 7;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Pass 3: crisp core
      const coreGrad = ctx.createLinearGradient(pts[0].x, 0, last.x, 0);
      coreGrad.addColorStop(0, crashed ? "rgba(255,77,109,0.6)" : "rgba(240,180,41,0.7)");
      coreGrad.addColorStop(1, lineColor);
      tracePath(ctx);
      ctx.strokeStyle = coreGrad;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Particle trail
      if (gs === "flying" && t % 2 === 0 && last.x > PAD_L && last.y > PAD_T) {
        spawnParticle(last.x, last.y, lineColor);
        if (mult > 5) spawnParticle(last.x, last.y, lineColor);
      }
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.life -= p.decay;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.life * 200).toString(16).padStart(2, "0");
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Animated tip
      if (!crashed && gs === "flying" && last.x > PAD_L && last.y > PAD_T) {
        const pulse = (Math.sin(t * 0.12) + 1) / 2;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 8 + pulse * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowRGB},${0.06 + pulse * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4 + pulse * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowRGB},${0.25 + pulse * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        const dotGrad = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 4);
        dotGrad.addColorStop(0, "#ffffff");
        dotGrad.addColorStop(0.5, lineColor);
        dotGrad.addColorStop(1, `rgba(${glowRGB},0)`);
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = dotGrad;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Crash explosion
      if (crashed && last.x > PAD_L) {
        const shockwave = (Math.sin(t * 0.3) + 1) / 2;
        for (let r = 0; r < 3; r++) {
          const radius = 10 + r * 14 + shockwave * 8;
          ctx.beginPath();
          ctx.arc(last.x, last.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,77,109,${0.3 - r * 0.08})`;
          ctx.lineWidth = 2 - r * 0.5;
          ctx.stroke();
        }
        const xSize = 7;
        ctx.strokeStyle = "rgba(255,77,109,0.9)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ff4d6d";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(last.x - xSize, last.y - xSize);
        ctx.lineTo(last.x + xSize, last.y + xSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(last.x + xSize, last.y - xSize);
        ctx.lineTo(last.x - xSize, last.y + xSize);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Multiplier callout box
      const boxW = 58, boxH = 24;
      const bx = Math.min(last.x + 10, PAD_L + gW - boxW - 4);
      const by = Math.max(PAD_T + 4, Math.min(last.y - 15, PAD_T + gH - boxH - 4));
      ctx.save();
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = crashed ? 0 : 10;
      roundRect(ctx, bx, by, boxW, boxH, 6);
      const boxBg = ctx.createLinearGradient(bx, by, bx, by + boxH);
      boxBg.addColorStop(0, `rgba(${glowRGB},0.2)`);
      boxBg.addColorStop(1, `rgba(${glowRGB},0.06)`);
      ctx.fillStyle = boxBg;
      ctx.fill();
      ctx.strokeStyle = `rgba(${glowRGB},0.55)`;
      ctx.lineWidth = 1;
      roundRect(ctx, bx, by, boxW, boxH, 6);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = lineColor;
      ctx.textAlign = "center";
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 6;
      ctx.fillText(`${Number(mult).toFixed(2)}×`, bx + boxW / 2, by + 16);
      ctx.shadowBlur = 0;
      ctx.restore();

      // Scanlines
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = "rgba(0,0,0,0.018)";
        ctx.fillRect(0, y, W, 1);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []); // empty — mounts once, reads live refs

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