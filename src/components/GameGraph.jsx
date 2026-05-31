import { useRef, useEffect } from "react";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getCurvedY(mult, maxMult, gH, padding) {
  const normalized = (mult - 1) / (Math.max(maxMult, 1.5) - 1);
  const curved = Math.pow(Math.max(0, Math.min(normalized, 1)), 1.6);
  return gH - padding.bottom - curved * (gH - padding.top - padding.bottom);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Catmull-Rom spline interpolation for ultra-smooth curves
function catmullRomPoints(pts, segments = 6) {
  if (pts.length < 2) return pts;
  const result = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let t = 0; t < segments; t++) {
      const tt = t / segments;
      const tt2 = tt * tt;
      const tt3 = tt2 * tt;
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * tt +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * tt +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3);
      result.push({ x, y });
    }
  }
  result.push(pts[pts.length - 1]);
  return result;
}

export default function GameGraph({ gs, mult, pathPts, crashed }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const frameRef = useRef(0);

  const planeXRef = useRef(0);
  const planeYRef = useRef(0);
  const planeTiltRef = useRef(-15);
  const velXRef = useRef(0);
  const velYRef = useRef(0);
  const bankAngleRef = useRef(0);

  const crashFrameRef = useRef(0);
  const prevCrashedRef = useRef(false);
  const shakeRef = useRef({ intensity: 0, decay: 0 });
  const contrailRef = useRef([]);
  const crashDebrisRef = useRef([]);

  const planeImgRef = useRef(null);
  const imgsReadyRef = useRef(false);

  const gsRef = useRef(gs);
  const multRef = useRef(mult);
  const pathPtsRef = useRef(pathPts);
  const crashedRef = useRef(crashed);
  const displayMultRef = useRef(1.0);

  gsRef.current = gs;
  multRef.current = mult;
  pathPtsRef.current = pathPts;
  crashedRef.current = crashed;

  useEffect(() => {
    loadImage("/plane.png")
      .then((img) => {
        planeImgRef.current = img;
        imgsReadyRef.current = true;
      })
      .catch(() => {
        imgsReadyRef.current = false;
      });
  }, []);

  useEffect(() => {
    if (crashed && !prevCrashedRef.current) {
      crashFrameRef.current = 0;
      shakeRef.current = { intensity: 8, decay: 0.85 };
      crashDebrisRef.current = Array.from({ length: 18 }, () => ({
        x: planeXRef.current,
        y: planeYRef.current,
        vx: (Math.random() - 0.5) * 5,
        vy: -(Math.random() * 4 + 1),
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? "#ff3355" : "#ff8844",
      }));
    }
    prevCrashedRef.current = crashed;
  }, [crashed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDims = () => {
      const r = canvas.getBoundingClientRect();
      return { W: r.width || 600, H: r.height || 340 };
    };

    const render = () => {
      frameRef.current++;
      const frame = frameRef.current;
      const mult = multRef.current;
      const pathPts = pathPtsRef.current;
      const crashed = crashedRef.current;

      const { W, H } = getDims();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        canvas.width !== Math.round(W * dpr) ||
        canvas.height !== Math.round(H * dpr)
      ) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      const ctx = canvas.getContext("2d");

      // Padding for graph area
      const pad = { top: 60, bottom: 48, left: 52, right: 24 };
      const gW = W - pad.left - pad.right;
      const gH = H - pad.top - pad.bottom;

      // Screen shake
      let sx = 0, sy = 0;
      if (crashed && shakeRef.current.intensity > 0.1) {
        const sh = shakeRef.current.intensity;
        sx = (Math.random() - 0.5) * sh;
        sy = (Math.random() - 0.5) * sh;
        shakeRef.current.intensity *= shakeRef.current.decay;
      }

      ctx.setTransform(dpr, 0, 0, dpr, sx, sy);
      ctx.clearRect(0, 0, W, H);

      // ── BACKGROUND ──
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#0d1117");
      bgGrad.addColorStop(1, "#111827");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ── GRID ──
      ctx.save();
      ctx.translate(pad.left, pad.top);

      // Determine multiplier scale for Y axis
      const maxMult = Math.max(1.5, mult * 1.15 + 0.3);
      const multLevels = [];
      const step = maxMult <= 2 ? 0.25 : maxMult <= 5 ? 0.5 : maxMult <= 10 ? 1 : maxMult <= 20 ? 2 : 5;
      for (let m = 1; m <= maxMult + step; m += step) {
        multLevels.push(parseFloat(m.toFixed(2)));
      }

      // Horizontal grid lines with multiplier labels
      multLevels.forEach((m) => {
        const y = getCurvedY(m, maxMult, gH, { top: 0, bottom: 0 });
        if (y < 0 || y > gH) return;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gW, y);
        ctx.strokeStyle = "rgba(255,255,255,0.045)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Y-axis label
        ctx.font = `500 ${Math.max(9, Math.min(11, W * 0.018))}px 'Inter', 'SF Pro Display', sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.textAlign = "right";
        ctx.fillText(`${m.toFixed(2)}x`, -8, y + 3.5);
      });

      // Vertical grid lines (time-based)
      const vLines = 6;
      for (let i = 0; i <= vLines; i++) {
        const x = (gW / vLines) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gH);
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axis lines
      ctx.beginPath();
      ctx.moveTo(0, gH);
      ctx.lineTo(gW, gH);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, gH);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      if (pathPts.length < 2) {
        // Smooth display mult toward 1.0
        displayMultRef.current = lerp(displayMultRef.current, mult, 0.12);

        // Draw multiplier display even before curve starts
        drawMultiplierDisplay(ctx, W, H, displayMultRef.current, crashed, frame, pad);
        animRef.current = requestAnimationFrame(render);
        return;
      }

      // Coordinate mappers into graph space
      const toX = (pct) => pad.left + pct * gW;
      const toY = (m) => pad.top + getCurvedY(m, maxMult, gH, { top: 0, bottom: 0 });

      const originX = pad.left;
      const originY = pad.top + gH;

      const rawPts = pathPts.map((p) => ({ x: toX(p.pct), y: toY(p.mult) }));
      // Reduce points for spline (every Nth for perf)
      const stride = Math.max(1, Math.floor(rawPts.length / 120));
      const reduced = rawPts.filter((_, i) => i % stride === 0 || i === rawPts.length - 1);
      const smoothPts = catmullRomPoints(reduced, 8);
      const last = rawPts[rawPts.length - 1];

      // ── PLANE PHYSICS ──
      const targetX = last.x;
      const targetY = last.y;
      const spring = crashed ? 0.12 : 0.032;
      const damp = 0.82;
      velXRef.current = velXRef.current * damp + (targetX - planeXRef.current) * spring;
      velYRef.current = velYRef.current * damp + (targetY - planeYRef.current) * spring;
      planeXRef.current += velXRef.current;
      planeYRef.current += velYRef.current;

      // Realistic banking based on velocity
      const speed = Math.sqrt(velXRef.current ** 2 + velYRef.current ** 2);
      const trajectoryAngle = speed > 0.1
        ? Math.atan2(velYRef.current, velXRef.current) * (180 / Math.PI)
        : planeTiltRef.current;

      if (!crashed) {
        const targetTilt = Math.max(-40, Math.min(10, trajectoryAngle * 0.7));
        planeTiltRef.current = lerp(planeTiltRef.current, targetTilt, 0.06);
        bankAngleRef.current = lerp(bankAngleRef.current, trajectoryAngle * 0.15, 0.05);
      } else {
        planeTiltRef.current = lerp(planeTiltRef.current, 70, 0.04);
        bankAngleRef.current = lerp(bankAngleRef.current, 30, 0.03);
      }

      const px = planeXRef.current;
      const py = planeYRef.current;

      // ── CONTRAIL ──
      if (!crashed && px > pad.left + 10) {
        contrailRef.current.push({
          x: px - Math.cos((planeTiltRef.current * Math.PI) / 180) * 20,
          y: py - Math.sin((planeTiltRef.current * Math.PI) / 180) * 20,
          life: 1,
          size: 3 + Math.random() * 1.5,
        });
      }
      if (contrailRef.current.length > 80) contrailRef.current.shift();
      contrailRef.current.forEach((p) => { p.life -= 0.018; });
      contrailRef.current = contrailRef.current.filter((p) => p.life > 0);

      contrailRef.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,215,255,${p.life * 0.12})`;
        ctx.fill();
      });

      // ── BUILD PATH ──
      const buildPath = (c) => {
        c.beginPath();
        c.moveTo(originX, originY);
        if (smoothPts.length > 0) {
          c.lineTo(smoothPts[0].x, smoothPts[0].y);
          for (let i = 1; i < smoothPts.length; i++) {
            c.lineTo(smoothPts[i].x, smoothPts[i].y);
          }
        }
      };

      // ── AREA FILL ──
      buildPath(ctx);
      ctx.lineTo(last.x, originY);
      ctx.lineTo(originX, originY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, pad.top, 0, originY);
      areaGrad.addColorStop(0, "rgba(220,40,60,0.22)");
      areaGrad.addColorStop(0.5, "rgba(180,20,40,0.08)");
      areaGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // ── OUTER SOFT GLOW ──
      buildPath(ctx);
      ctx.strokeStyle = "rgba(255,50,80,0.06)";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // ── MAIN LINE ──
      buildPath(ctx);
      ctx.strokeStyle = crashed ? "rgba(255,60,80,0.5)" : "rgba(255,40,70,0.65)";
      ctx.lineWidth = 5;
      ctx.shadowColor = "rgba(255,30,60,0.4)";
      ctx.shadowBlur = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── CRISP HIGHLIGHT ──
      buildPath(ctx);
      const lineGrad = ctx.createLinearGradient(originX, 0, last.x, 0);
      lineGrad.addColorStop(0, "#cc1133");
      lineGrad.addColorStop(0.5, "#ff2244");
      lineGrad.addColorStop(1, "#ff5577");
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(255,40,70,0.5)";
      ctx.shadowBlur = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── ENDPOINT PULSE ──
      if (!crashed) {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12);
        // Outer ring
        ctx.beginPath();
        ctx.arc(last.x, last.y, 6 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,60,90,${0.3 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Inner dot
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ff2244";
        ctx.shadowColor = "rgba(255,30,60,0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Bright center
        ctx.beginPath();
        ctx.arc(last.x, last.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }

      // ── CRASH FX ──
      if (crashed) {
        crashFrameRef.current++;
        const cf = crashFrameRef.current;

        // Brief red flash
        if (cf < 12) {
          const flashAlpha = Math.max(0, (12 - cf) / 12) * 0.25;
          ctx.fillStyle = `rgba(220,20,50,${flashAlpha})`;
          ctx.fillRect(0, 0, W, H);
        }

        // Expanding ring
        for (let r = 0; r < 2; r++) {
          const rad = 6 + r * 12 + Math.min(cf * 1.2, 40);
          const alpha = Math.max(0, 0.5 - r * 0.15 - cf * 0.012);
          if (alpha <= 0) continue;
          ctx.beginPath();
          ctx.arc(last.x, last.y, rad, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,40,70,${alpha})`;
          ctx.lineWidth = 2 - r * 0.5;
          ctx.stroke();
        }

        // Crash X mark — clean, not cartoon
        const xs = 7;
        ctx.strokeStyle = "rgba(255,50,80,0.9)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(255,30,60,0.6)";
        ctx.shadowBlur = 6;
        [[-1, -1, 1, 1], [1, -1, -1, 1]].forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath();
          ctx.moveTo(last.x + x1 * xs, last.y + y1 * xs);
          ctx.lineTo(last.x + x2 * xs, last.y + y2 * xs);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;

        // Debris particles (small, realistic)
        crashDebrisRef.current = crashDebrisRef.current.filter((p) => p.life > 0);
        crashDebrisRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.vx *= 0.97;
          p.life -= p.decay;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(")", `,${p.life * 0.7})`).replace("rgb", "rgba");
          ctx.fill();
        });
      }

      // ── PLANE ──
      if (px > pad.left + 4) {
        const tilt = (planeTiltRef.current * Math.PI) / 180;
        const planeSize = Math.max(38, Math.min(64, W * 0.1));

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tilt);

        if (imgsReadyRef.current && planeImgRef.current) {
          // Shadow/glow
          ctx.shadowColor = crashed ? "rgba(255,40,70,0.6)" : "rgba(255,120,140,0.3)";
          ctx.shadowBlur = crashed ? 16 : 12;

          ctx.drawImage(
            planeImgRef.current,
            -planeSize * 0.5,
            -planeSize * 0.5,
            planeSize,
            planeSize
          );

          if (crashed) {
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "rgba(255,40,60,0.45)";
            ctx.fillRect(-planeSize * 0.5, -planeSize * 0.5, planeSize, planeSize);
            ctx.globalCompositeOperation = "source-over";
          }
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      // ── MULTIPLIER DISPLAY ──
      displayMultRef.current = lerp(displayMultRef.current, mult, crashed ? 0.05 : 0.15);
      drawMultiplierDisplay(ctx, W, H, displayMultRef.current, crashed, frame, pad);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
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

function drawMultiplierDisplay(ctx, W, H, mult, crashed, frame, pad) {
  const cx = W / 2;
  const cy = (pad.top + (H - pad.bottom)) / 2 - 10;

  const displayText = `${mult.toFixed(2)}x`;
  const fontSize = Math.max(28, Math.min(56, W * 0.09));

  ctx.save();

  // Subtle background pill
  const pillW = fontSize * displayText.length * 0.62;
  const pillH = fontSize * 1.35;
  const rx = 10;
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(cx - pillW / 2, cy - pillH / 2, pillW, pillH, rx)
    : ctx.rect(cx - pillW / 2, cy - pillH / 2, pillW, pillH);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();

  // Multiplier text
  ctx.font = `700 ${fontSize}px 'Inter', 'SF Pro Display', -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (crashed) {
    ctx.fillStyle = "#ff2244";
    ctx.shadowColor = "rgba(255,30,60,0.5)";
    ctx.shadowBlur = 16;
  } else {
    // Gentle pulse on the text color
    const pulse = 0.85 + 0.15 * Math.sin(frame * 0.1);
    ctx.fillStyle = `rgba(255,${Math.floor(220 + 35 * pulse)},${Math.floor(220 + 35 * pulse)},1)`;
    ctx.shadowColor = "rgba(255,100,120,0.25)";
    ctx.shadowBlur = 10;
  }

  ctx.fillText(displayText, cx, cy);
  ctx.shadowBlur = 0;

  // Subtext label
  if (crashed) {
    const subSize = Math.max(11, Math.min(16, W * 0.025));
    ctx.font = `600 ${subSize}px 'Inter', sans-serif`;
    ctx.fillStyle = "rgba(255,80,100,0.75)";
    ctx.shadowBlur = 0;
    ctx.fillText("FLEW AWAY", cx, cy + fontSize * 0.75);
  }

  ctx.restore();
}