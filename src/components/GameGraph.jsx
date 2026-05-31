import { useRef, useEffect } from "react";

// ─── math helpers ────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function getCurvedY(mult, maxMult, gH) {
  const normalized = (mult - 1) / (Math.max(maxMult, 1.5) - 1);
  const curved = Math.pow(clamp(normalized, 0, 1), 2.4);
  const bottomPad = gH * 0.04;
  const topPad = gH * 0.08;
  return gH - bottomPad - curved * (gH - topPad - bottomPad);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Multiplier → accent color (green safe zone → yellow caution → red danger)
function multColor(mult, alpha = 1) {
  if (mult < 2)   return `rgba(0,230,120,${alpha})`;
  if (mult < 5)   return `rgba(255,210,0,${alpha})`;
  if (mult < 10)  return `rgba(255,120,0,${alpha})`;
  return `rgba(255,40,80,${alpha})`;
}

function multColorSolid(mult) {
  if (mult < 2)   return "#00e678";
  if (mult < 5)   return "#ffd200";
  if (mult < 10)  return "#ff7800";
  return "#ff2850";
}

// ─── main component ───────────────────────────────────────────────────────────
export default function GameGraph({
  gs,
  mult = 1,
  pathPts = [],
  crashed = false,
  roundId,
  onlinePlayers,
  waiting = false,         // NEW: show waiting/countdown state
  countdown = 0,           // NEW: seconds until next round
}) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const frameRef  = useRef(0);

  // Plane state
  const planeXRef    = useRef(-999);
  const planeYRef    = useRef(-999);
  const planeTiltRef = useRef(-20);
  const velXRef      = useRef(0);
  const velYRef      = useRef(0);

  // Assets
  const planeImgRef  = useRef(null);
  const imgsReadyRef = useRef(false);

  // Effects
  const shakeRef      = useRef(0);
  const flashRef      = useRef(0);
  const crashFrameRef = useRef(0);
  const prevCrashedRef = useRef(false);

  // Particles / explosion
  const trailRef     = useRef([]);      // engine exhaust trail
  const particlesRef = useRef([]);      // exhaust glow particles
  const explosionRef = useRef([]);
  const debrisRef    = useRef([]);      // NEW: crash debris chunks

  // Camera
  const cameraYRef = useRef(0);

  // Stars (persistent, randomised once)
  const starsRef = useRef(
    Array.from({ length: 150 }, () => ({
      x: Math.random(), y: Math.random(),
      size: Math.random() * 1.8 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.01 + 0.005,
    }))
  );

  // Refs that bridge React renders → animation loop
  const gsRef             = useRef(gs);
  const multRef           = useRef(mult);
  const pathPtsRef        = useRef(pathPts);
  const crashedRef        = useRef(crashed);
  const waitingRef        = useRef(waiting);
  const countdownRef      = useRef(countdown);
  const roundIdRef        = useRef(roundId    || Math.floor(Math.random() * 90000 + 10000));
  const onlinePlayersRef  = useRef(onlinePlayers || Math.floor(Math.random() * 800 + 200));

  gsRef.current            = gs;
  multRef.current          = mult;
  pathPtsRef.current       = pathPts;
  crashedRef.current       = crashed;
  waitingRef.current       = waiting;
  countdownRef.current     = countdown;
  if (roundId)         roundIdRef.current        = roundId;
  if (onlinePlayers)   onlinePlayersRef.current  = onlinePlayers;

  // ── load plane image ────────────────────────────────────────────────────────
  useEffect(() => {
    loadImage("/plane.png")
      .then(img => { planeImgRef.current = img; imgsReadyRef.current = true; })
      .catch(() => { imgsReadyRef.current = false; });
  }, []);

  // ── crash trigger ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (crashed && !prevCrashedRef.current) {
      crashFrameRef.current = 0;
      shakeRef.current      = 18;
      flashRef.current      = 1;

      explosionRef.current = Array.from({ length: 80 }, (_, i) => ({
        angle: (Math.PI * 2 * i) / 80,
        speed: Math.random() * 9 + 3,
        life:  1,
        size:  Math.random() * 4 + 2,
      }));

      debrisRef.current = Array.from({ length: 18 }, () => ({
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 5 + 2,
        rot:   Math.random() * Math.PI * 2,
        rotV:  (Math.random() - 0.5) * 0.25,
        w: Math.random() * 14 + 6,
        h: Math.random() * 6 + 3,
        life: 1,
      }));
    }
    prevCrashedRef.current = crashed;
  }, [crashed]);

  // ── main render loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDims = () => {
      const r = canvas.getBoundingClientRect();
      return { W: r.width || 600, H: r.height || 340 };
    };

    const render = () => {
      frameRef.current++;
      const frame   = frameRef.current;
      const mult    = multRef.current;
      const pathPts = pathPtsRef.current;
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

      const pad = { top: 56, bottom: 40, left: 52, right: 20 };
      const gW = W - pad.left - pad.right;
      const gH = H - pad.top  - pad.bottom;

      // ── screen shake ──────────────────────────────────────────────────────
      let sx = 0, sy = 0;
      if (shakeRef.current > 0.4) {
        sx = (Math.random() - 0.5) * shakeRef.current;
        sy = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current *= 0.80;
      }
      ctx.setTransform(dpr, 0, 0, dpr, sx, sy);

      // ── background ────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#0a1020");
      bgGrad.addColorStop(1, "#03050e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // subtle radial vignette
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.9);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ── stars ─────────────────────────────────────────────────────────────
      starsRef.current.forEach(star => {
        const alpha = 0.15 + Math.sin(frame * star.speed + star.phase) * 0.18;
        ctx.beginPath();
        ctx.arc(star.x * W, star.y * H, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${alpha})`;
        ctx.fill();
      });

      // ── flash overlay (crash) ─────────────────────────────────────────────
      if (flashRef.current > 0.01) {
        ctx.fillStyle = `rgba(255,60,60,${flashRef.current * 0.22})`;
        ctx.fillRect(0, 0, W, H);
        flashRef.current *= 0.84;
      }

      // ── coordinate helpers ────────────────────────────────────────────────
      const maxMult  = Math.max(1.5, mult * 1.18 + 0.2);
      const toX      = pct  => pad.left + pct * gW;
      const toY      = m    => pad.top  + getCurvedY(m, maxMult, gH) + cameraYRef.current;
      const originX  = pad.left;
      const originY  = pad.top + gH + cameraYRef.current;

      // camera scroll at high multipliers
      const targetCam = mult > 10 ? -Math.min(100, (mult - 10) * 3.5) : 0;
      cameraYRef.current = lerp(cameraYRef.current, targetCam, 0.04);

      // ── grid ──────────────────────────────────────────────────────────────
      ctx.save();
      ctx.translate(pad.left, pad.top + cameraYRef.current);

      const gridOffset = (frame * 0.4) % 80;
      const vCount = Math.floor(gW / 80) + 2;
      for (let i = 0; i < vCount; i++) {
        const x = i * 80 - gridOffset;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, gH);
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // horizontal grid lines with labels
      const allLevels = [1, 1.5, 2, 3, 5, 8, 10, 15, 20, 30, 50, 100];
      allLevels.filter(m => m <= maxMult * 1.05).forEach(m => {
        const y = getCurvedY(m, maxMult, gH);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(gW, y);
        ctx.strokeStyle = "rgba(255,255,255,0.055)";
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font         = "bold 10px 'Courier New', monospace";
        ctx.fillStyle    = "rgba(255,255,255,0.3)";
        ctx.textAlign    = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(`${m}x`, -10, y);
      });

      // axes
      ctx.beginPath(); ctx.moveTo(0, gH); ctx.lineTo(gW, gH);
      ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, gH);
      ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 1; ctx.stroke();

      ctx.restore();

      // ── waiting state ─────────────────────────────────────────────────────
      if (waiting) {
        const pulse = 0.5 + Math.sin(frame * 0.08) * 0.5;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.font         = `900 52px 'Courier New', monospace`;
        ctx.fillStyle    = `rgba(255,255,255,${0.6 + pulse * 0.4})`;
        ctx.shadowColor  = "#4488ff";
        ctx.shadowBlur   = 30 + pulse * 20;
        ctx.fillText(`STARTING IN`, W / 2, H * 0.38);
        ctx.font       = `900 80px 'Courier New', monospace`;
        ctx.fillStyle  = "#ffffff";
        ctx.shadowBlur = 40 + pulse * 20;
        ctx.fillText(`${countdownRef.current}s`, W / 2, H * 0.58);
        ctx.shadowBlur = 0;

        animRef.current = requestAnimationFrame(render);
        return;
      }

      // ── early exit if no path ─────────────────────────────────────────────
      if (pathPts.length < 2) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      // ── path points ───────────────────────────────────────────────────────
      const rawPts = pathPts.map(p => ({ x: toX(p.pct), y: toY(p.mult) }));
      const last   = rawPts[rawPts.length - 1];

      // ── plane physics ─────────────────────────────────────────────────────
      const dist = Math.hypot(planeXRef.current - last.x, planeYRef.current - last.y);
      if (planeXRef.current < 0 || dist > 120) {
        planeXRef.current = last.x;
        planeYRef.current = last.y;
      } else {
        const spring = crashed ? 0.10 : 0.22;
        const damp   = 0.75;
        velXRef.current = velXRef.current * damp + (last.x - planeXRef.current) * spring;
        velYRef.current = velYRef.current * damp + (last.y - planeYRef.current) * spring;
        planeXRef.current += velXRef.current;
        planeYRef.current += velYRef.current;
      }

      if (rawPts.length >= 2 && !crashed) {
        const p0    = rawPts[Math.max(0, rawPts.length - 6)];
        const p1    = rawPts[rawPts.length - 1];
        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI);
        planeTiltRef.current = lerp(planeTiltRef.current, clamp(angle, -55, 5), 0.10);
      }

      const px      = planeXRef.current;
      const py      = planeYRef.current;
      const tiltRad = (planeTiltRef.current * Math.PI) / 180;

      // ── engine trail (exhaust) ────────────────────────────────────────────
      if (!crashed) {
        trailRef.current.push({ x: px, y: py, life: 1 });
        if (trailRef.current.length > 60) trailRef.current.shift();

        particlesRef.current.push({
          x:  px - Math.cos(tiltRad) * 20 + (Math.random() - 0.5) * 4,
          y:  py - Math.sin(tiltRad) * 20 + (Math.random() - 0.5) * 4,
          vx: -Math.cos(tiltRad) * (Math.random() * 3 + 1),
          vy: -Math.sin(tiltRad) * (Math.random() * 3 + 1) + (Math.random() - 0.5),
          size: Math.random() * 5 + 2,
          life: 1,
        });
      }

      particlesRef.current = particlesRef.current
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, size: p.size * 0.97, life: p.life - 0.03 }))
        .filter(p => p.life > 0);

      // draw exhaust trail
      if (trailRef.current.length > 1) {
        for (let i = 1; i < trailRef.current.length; i++) {
          const t0 = trailRef.current[i - 1];
          const t1 = trailRef.current[i];
          const a  = (i / trailRef.current.length) * 0.35;
          ctx.beginPath();
          ctx.moveTo(t0.x, t0.y);
          ctx.lineTo(t1.x, t1.y);
          ctx.strokeStyle = `rgba(255,140,60,${a})`;
          ctx.lineWidth   = (i / trailRef.current.length) * 5;
          ctx.lineCap     = "round";
          ctx.stroke();
        }
      }

      // draw exhaust particles
      particlesRef.current.forEach(p => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        g.addColorStop(0, `rgba(255,160,80,${p.life * 0.8})`);
        g.addColorStop(1, `rgba(255,60,0,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // ── build curve path helper ───────────────────────────────────────────
      const buildPath = (c) => {
        c.beginPath();
        c.moveTo(originX, originY);
        c.lineTo(rawPts[0].x, rawPts[0].y);
        for (let i = 1; i < rawPts.length; i++) {
          const p0 = rawPts[i - 1], p1 = rawPts[i];
          const cp = p0.x + (p1.x - p0.x) * 0.5;
          c.bezierCurveTo(cp, p0.y, cp, p1.y, p1.x, p1.y);
        }
      };

      // ── area fill ─────────────────────────────────────────────────────────
      buildPath(ctx);
      ctx.lineTo(last.x, originY);
      ctx.lineTo(originX, originY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, pad.top, 0, originY);
      areaGrad.addColorStop(0, multColor(mult, 0.22));
      areaGrad.addColorStop(1, multColor(mult, 0));
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // ── glow line ─────────────────────────────────────────────────────────
      buildPath(ctx);
      ctx.strokeStyle = multColor(mult, 0.15);
      ctx.lineWidth   = 16;
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.stroke();

      buildPath(ctx);
      ctx.strokeStyle  = multColorSolid(mult);
      ctx.shadowColor  = multColorSolid(mult);
      ctx.shadowBlur   = 18;
      ctx.lineWidth    = 3.5;
      ctx.stroke();
      ctx.shadowBlur   = 0;

      // shimmer highlight
      buildPath(ctx);
      const shimmer = (frame * 4) % gW;
      const glow    = ctx.createLinearGradient(shimmer - 140, 0, shimmer + 140, 0);
      glow.addColorStop(0, "rgba(255,255,255,0)");
      glow.addColorStop(0.5, "rgba(255,255,255,0.65)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = glow;
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // ── multiplier HUD ────────────────────────────────────────────────────
      const pulse    = 0.5 + Math.sin(frame * 0.14) * 0.5;
      const multSize = clamp(W * 0.09, 36, 72);
      const accentCol = multColorSolid(mult);

      // outer pulse ring
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.22, multSize * 0.8 + pulse * 8, 0, Math.PI * 2);
      ctx.strokeStyle = `${accentCol}33`;
      ctx.lineWidth   = 2;
      ctx.stroke();

      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = `900 ${multSize}px 'Courier New', monospace`;
      ctx.shadowColor  = accentCol;
      ctx.shadowBlur   = 24 + pulse * 12;
      ctx.fillStyle    = crashed ? "#ff5555" : "#ffffff";
      ctx.fillText(`${mult.toFixed(2)}x`, W / 2, H * 0.22);
      ctx.shadowBlur = 0;

      // round + players HUD badges
      ctx.font      = "600 11px 'Courier New', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`ROUND #${roundIdRef.current}`, W / 2, H * 0.22 + multSize * 0.68);

      // online players badge (top-right)
      const bx = W - pad.right - 5, by = 10;
      ctx.font      = "bold 10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.textAlign = "right";
      ctx.fillText(`● ${onlinePlayersRef.current} online`, bx, by + 8);

      // ── crash effects ─────────────────────────────────────────────────────
      if (crashed) {
        crashFrameRef.current++;
        const cf = crashFrameRef.current;

        // expanding ring
        ctx.beginPath();
        ctx.arc(last.x, last.y, cf * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,80,80,${Math.max(0, 0.9 - cf * 0.025)})`;
        ctx.lineWidth   = 3;
        ctx.stroke();

        // second ring (delayed)
        if (cf > 6) {
          ctx.beginPath();
          ctx.arc(last.x, last.y, (cf - 6) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,180,0,${Math.max(0, 0.7 - (cf-6) * 0.03)})`;
          ctx.lineWidth   = 2;
          ctx.stroke();
        }

        // explosion sparks
        explosionRef.current.forEach(p => {
          const x = last.x + Math.cos(p.angle) * p.speed * cf;
          const y = last.y + Math.sin(p.angle) * p.speed * cf;
          const gp = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
          gp.addColorStop(0, `rgba(255,${140 + Math.random()*80|0},40,${p.life})`);
          gp.addColorStop(1, "rgba(255,40,0,0)");
          ctx.beginPath();
          ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = gp;
          ctx.fill();
          p.life *= 0.955;
        });

        // debris chunks
        debrisRef.current.forEach(p => {
          const x = last.x + Math.cos(p.angle) * p.speed * cf;
          const y = last.y + Math.sin(p.angle) * p.speed * cf + cf * cf * 0.08;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(p.rot + p.rotV * cf);
          ctx.fillStyle = `rgba(180,180,200,${p.life * 0.9})`;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
          p.life *= 0.965;
        });

        // CRASHED text with flicker
        const flicker = Math.random() > 0.08 ? 1 : 0;
        ctx.font      = `900 42px 'Courier New', monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(255,60,60,${flicker})`;
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur  = 28;
        ctx.fillText("CRASHED", W / 2, H * 0.30);
        ctx.shadowBlur  = 0;
      }

      // ── plane ─────────────────────────────────────────────────────────────
      if (px > pad.left) {
        const tilt      = (planeTiltRef.current * Math.PI) / 180;
        const planeSize = clamp(W * 0.10, 44, 72);
        const ePulse    = 0.6 + Math.sin(frame * 0.22) * 0.4;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(crashed ? tilt + crashFrameRef.current * 0.09 : tilt);

        // engine glow
        const eGrad = ctx.createRadialGradient(
          -planeSize * 0.4, 0, 0,
          -planeSize * 0.4, 0, planeSize * 0.5 * ePulse
        );
        eGrad.addColorStop(0, "rgba(255,160,40,0.9)");
        eGrad.addColorStop(0.4, "rgba(255,60,0,0.5)");
        eGrad.addColorStop(1, "rgba(255,0,0,0)");
        ctx.beginPath();
        ctx.ellipse(
          -planeSize * 0.38, 0,
          planeSize * 0.28 * ePulse, planeSize * 0.1, 0, 0, Math.PI * 2
        );
        ctx.fillStyle = eGrad;
        ctx.fill();

        // plane image or fallback polygon
        if (imgsReadyRef.current && planeImgRef.current) {
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur  = 14;
          ctx.drawImage(planeImgRef.current, -planeSize / 2, -planeSize / 2, planeSize, planeSize);
          ctx.shadowBlur  = 0;
        } else {
          // nice fallback plane silhouette
          ctx.beginPath();
          ctx.moveTo( planeSize * 0.48,  0);
          ctx.lineTo(-planeSize * 0.18, -planeSize * 0.17);
          ctx.lineTo(-planeSize * 0.05,  0);
          ctx.lineTo(-planeSize * 0.18,  planeSize * 0.17);
          ctx.closePath();
          ctx.fillStyle   = "#e8eaf6";
          ctx.shadowColor = "#aabbff";
          ctx.shadowBlur  = 10;
          ctx.fill();
          // wing
          ctx.beginPath();
          ctx.moveTo(planeSize * 0.1, -planeSize * 0.02);
          ctx.lineTo(planeSize * 0.1,  -planeSize * 0.28);
          ctx.lineTo(-planeSize * 0.1,  -planeSize * 0.04);
          ctx.closePath();
          ctx.fillStyle   = "#c5cae9";
          ctx.shadowBlur  = 0;
          ctx.fill();
          // tailfin
          ctx.beginPath();
          ctx.moveTo(-planeSize * 0.14, -planeSize * 0.03);
          ctx.lineTo(-planeSize * 0.28, -planeSize * 0.17);
          ctx.lineTo(-planeSize * 0.22,  0);
          ctx.closePath();
          ctx.fillStyle = "#9fa8da";
          ctx.fill();
        }

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ── roundRect helper (kept for external use) ─────────────────────────────────
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}
