import { useRef, useEffect } from "react";

const PAD_L = 28, PAD_B = 20, PAD_R = 20, PAD_T = 20;

export function getCurvedY(mult, maxMult, gH) {
  const normalized = (mult - 1) / (Math.max(maxMult, 1.8) - 1);
  const curved = Math.pow(Math.max(0, normalized), 2.1);
  return gH - Math.min(curved, 1.0) * gH;
}

function lerp(a, b, t) { return a + (b - a) * t; }

// Premium SVG jet — realistic narrow-body silhouette
const JET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" width="120" height="48">
  <defs>
    <linearGradient id="fuse" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ddeeff" stop-opacity="0.97"/>
      <stop offset="40%" stop-color="#b8d4ee" stop-opacity="1"/>
      <stop offset="100%" stop-color="#5a7a9a" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="wing" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a0c0e0" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#3a5a80" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="nose" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#cce8ff"/>
      <stop offset="100%" stop-color="#e8f6ff"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b8eeff" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#2255aa" stop-opacity="0.7"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Main fuselage — long slim tube -->
  <path d="M18 21 Q32 17 58 16 Q82 15 100 19 Q110 21 114 24 Q110 27 100 29 Q82 33 58 32 Q32 31 18 27 Z"
    fill="url(#fuse)" />

  <!-- Fuselage top highlight -->
  <path d="M20 19 Q50 16 90 18 Q102 19 110 22 Q102 20 86 19 Q50 18 20 21 Z"
    fill="rgba(255,255,255,0.28)"/>

  <!-- Fuselage bottom shadow -->
  <path d="M20 27 Q50 31 90 30 Q102 29 110 26 Q102 28 86 29 Q50 30 20 29 Z"
    fill="rgba(0,0,0,0.15)"/>

  <!-- Nose cone — sharp tapered -->
  <path d="M100 19 Q108 20 116 24 Q108 28 100 29 Z"
    fill="url(#nose)"/>
  <!-- Nose tip -->
  <path d="M112 23 L116 24 L112 25" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>

  <!-- Main wing — swept, realistic aspect ratio -->
  <path d="M62 25 L28 44 L38 44 L68 28 Z"
    fill="url(#wing)" opacity="0.94"/>
  <!-- Wing leading edge highlight -->
  <path d="M62 25 L28 44" stroke="rgba(160,210,255,0.5)" stroke-width="0.8" fill="none"/>
  <!-- Wing trailing edge -->
  <path d="M68 28 L38 44" stroke="rgba(0,0,0,0.12)" stroke-width="0.5" fill="none"/>
  <!-- Wing fold line -->
  <path d="M62 25 L48 36" stroke="rgba(80,120,180,0.3)" stroke-width="0.6" fill="none"/>

  <!-- Wing engine nacelle -->
  <path d="M52 29 Q46 27 42 29 Q40 31 42 34 Q46 36 52 34 Z"
    fill="#1a2a3a" opacity="0.92"/>
  <ellipse cx="42.5" cy="31.5" rx="2" ry="2.8" fill="#080e18"/>
  <!-- Engine intake rim -->
  <path d="M41 29 Q42.5 28.2 44 29" stroke="rgba(100,160,220,0.45)" stroke-width="0.6" fill="none"/>

  <!-- Horizontal stabilizer -->
  <path d="M24 23 L14 16 L18 16 L28 22 Z"
    fill="url(#wing)" opacity="0.88"/>
  <path d="M24 23 L14 16" stroke="rgba(140,200,255,0.35)" stroke-width="0.6" fill="none"/>

  <!-- Vertical stabilizer / tail fin -->
  <path d="M22 22 L18 10 L24 16 L28 22 Z"
    fill="#a8c8e8" opacity="0.88"/>
  <path d="M22 22 L18 10" stroke="rgba(200,230,255,0.4)" stroke-width="0.6" fill="none"/>

  <!-- Cockpit windows — 3 panels -->
  <path d="M90 19 Q96 17.5 104 20 Q100 18 92 18 Z"
    fill="url(#glass)" opacity="0.9"/>
  <!-- Window glint -->
  <path d="M91 19 Q96 17.8 102 19.5"
    stroke="rgba(255,255,255,0.6)" stroke-width="0.7" fill="none"/>

  <!-- Cabin windows row -->
  <g opacity="0.82">
    <rect x="44" y="18" width="5" height="6" rx="1.5" fill="#1a3a60" opacity="0.85"/>
    <rect x="53" y="17.5" width="5" height="6" rx="1.5" fill="#1a3a60" opacity="0.85"/>
    <rect x="62" y="17" width="5" height="6" rx="1.5" fill="#1a3a60" opacity="0.85"/>
    <rect x="71" y="17" width="5" height="6" rx="1.5" fill="#1a3a60" opacity="0.85"/>
    <rect x="80" y="17.5" width="5" height="6" rx="1.5" fill="#1a3a60" opacity="0.85"/>
    <!-- Window glints -->
    <rect x="44.5" y="18.5" width="2" height="2" rx="0.5" fill="rgba(160,220,255,0.5)"/>
    <rect x="53.5" y="18" width="2" height="2" rx="0.5" fill="rgba(160,220,255,0.5)"/>
    <rect x="62.5" y="17.5" width="2" height="2" rx="0.5" fill="rgba(160,220,255,0.5)"/>
    <rect x="71.5" y="17.5" width="2" height="2" rx="0.5" fill="rgba(160,220,255,0.5)"/>
    <rect x="80.5" y="18" width="2" height="2" rx="0.5" fill="rgba(160,220,255,0.5)"/>
  </g>

  <!-- Airline livery stripe -->
  <path d="M20 29.5 Q50 33 82 31 Q92 30 100 28"
    stroke="rgba(79,140,255,0.55)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M20 28 Q50 31.5 82 29.5 Q92 28.5 100 26.5"
    stroke="rgba(79,140,255,0.22)" stroke-width="0.6" fill="none" stroke-linecap="round"/>

  <!-- Landing gear fairings -->
  <ellipse cx="55" cy="33" rx="4.5" ry="1.4" fill="rgba(0,0,0,0.18)"/>
</svg>`;

const JET_SVG_CRASHED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" width="120" height="48">
  <defs>
    <linearGradient id="fuse" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff8899" stop-opacity="0.97"/>
      <stop offset="40%" stop-color="#cc2244" stop-opacity="1"/>
      <stop offset="100%" stop-color="#881122" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="wing" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cc2244" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#660011" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="nose" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6680"/>
      <stop offset="100%" stop-color="#ffaabb"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff99aa" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#880022" stop-opacity="0.7"/>
    </linearGradient>
  </defs>

  <path d="M18 21 Q32 17 58 16 Q82 15 100 19 Q110 21 114 24 Q110 27 100 29 Q82 33 58 32 Q32 31 18 27 Z"
    fill="url(#fuse)"/>
  <path d="M20 19 Q50 16 90 18 Q102 19 110 22 Q102 20 86 19 Q50 18 20 21 Z"
    fill="rgba(255,180,180,0.2)"/>
  <path d="M100 19 Q108 20 116 24 Q108 28 100 29 Z" fill="url(#nose)"/>
  <path d="M62 25 L28 44 L38 44 L68 28 Z" fill="url(#wing)" opacity="0.94"/>
  <path d="M62 25 L28 44" stroke="rgba(255,120,140,0.4)" stroke-width="0.8" fill="none"/>
  <path d="M52 29 Q46 27 42 29 Q40 31 42 34 Q46 36 52 34 Z" fill="#1a0a0a" opacity="0.92"/>
  <ellipse cx="42.5" cy="31.5" rx="2" ry="2.8" fill="#0a0202"/>
  <path d="M24 23 L14 16 L18 16 L28 22 Z" fill="url(#wing)" opacity="0.88"/>
  <path d="M22 22 L18 10 L24 16 L28 22 Z" fill="#cc3355" opacity="0.88"/>
  <path d="M90 19 Q96 17.5 104 20 Q100 18 92 18 Z" fill="url(#glass)" opacity="0.9"/>
  <g opacity="0.7">
    <rect x="44" y="18" width="5" height="6" rx="1.5" fill="#3a0a10"/>
    <rect x="53" y="17.5" width="5" height="6" rx="1.5" fill="#3a0a10"/>
    <rect x="62" y="17" width="5" height="6" rx="1.5" fill="#3a0a10"/>
    <rect x="71" y="17" width="5" height="6" rx="1.5" fill="#3a0a10"/>
    <rect x="80" y="17.5" width="5" height="6" rx="1.5" fill="#3a0a10"/>
  </g>
  <path d="M20 29.5 Q50 33 82 31 Q92 30 100 28"
    stroke="rgba(255,80,100,0.5)" stroke-width="1.4" fill="none" stroke-linecap="round"/>

  <!-- Crash sparks -->
  <line x1="108" y1="18" x2="116" y2="10" stroke="#ffee44" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="110" y1="22" x2="119" y2="18" stroke="#ff9922" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="109" y1="28" x2="118" y2="33" stroke="#ff5533" stroke-width="1.0" stroke-linecap="round"/>
  <circle cx="116" cy="10" r="2" fill="#ffee44"/>
  <circle cx="119" cy="18" r="1.4" fill="#ffaa22"/>
  <circle cx="118" cy="33" r="1.1" fill="#ff6644"/>
</svg>`;

function svgToImage(svgStr) {
  return new Promise((resolve) => {
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.src = url;
  });
}

export default function GameGraph({ gs, mult, pathPts, crashed }) {
  const canvasRef      = useRef(null);
  const animRef        = useRef(null);
  const frameRef       = useRef(0);

  // Lerped plane position
  const planeXRef      = useRef(PAD_L);
  const planeYRef      = useRef(200);
  const planeTiltRef   = useRef(-4);
  const velXRef        = useRef(0);
  const velYRef        = useRef(0);

  // Crash fx
  const crashFrameRef  = useRef(0);
  const prevCrashedRef = useRef(false);
  const shakeRef       = useRef({ intensity: 0 });
  const smokeRef       = useRef([]);
  const particlesRef   = useRef([]);

  // Preloaded jet images
  const jetImgRef        = useRef(null);
  const jetCrashedImgRef = useRef(null);
  const imgsReadyRef     = useRef(false);

  // Live refs
  const gsRef       = useRef(gs);
  const multRef     = useRef(mult);
  const pathPtsRef  = useRef(pathPts);
  const crashedRef  = useRef(crashed);
  gsRef.current      = gs;
  multRef.current    = mult;
  pathPtsRef.current = pathPts;
  crashedRef.current = crashed;

  // Preload SVG images once
  useEffect(() => {
    Promise.all([svgToImage(JET_SVG), svgToImage(JET_SVG_CRASHED)]).then(([normal, crashed]) => {
      jetImgRef.current        = normal;
      jetCrashedImgRef.current = crashed;
      imgsReadyRef.current     = true;
    });
  }, []);

  // Crash trigger
  useEffect(() => {
    if (crashed && !prevCrashedRef.current) {
      crashFrameRef.current = 0;
      shakeRef.current = { intensity: 8 };
      const pts = pathPtsRef.current;
      if (pts.length > 0) {
        const last = pts[pts.length - 1];
        smokeRef.current = Array.from({ length: 28 }, () => ({
          relPct: last.pct, relMult: last.mult,
          x: 0, y: 0, resolved: false,
          vx: (Math.random() - 0.5) * 3.5,
          vy: -(Math.random() * 2.8 + 0.4),
          life: 1,
          decay: 0.010 + Math.random() * 0.013,
          size: Math.random() * 9 + 3,
          hue: Math.random() > 0.45 ? 0 : 22,
        }));
      }
    }
    prevCrashedRef.current = crashed;
  }, [crashed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDims = () => {
      const r = canvas.getBoundingClientRect();
      return { W: r.width || 600, H: r.height || 300 };
    };

    const spawnTrail = (x, y, m) => {
      if (particlesRef.current.length > 60) particlesRef.current.shift();
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.6) * 0.8,
        vy: (Math.random() - 0.5) * 0.6,
        life: 1,
        decay: 0.032 + Math.random() * 0.028,
        size: Math.random() * 1.2 + 0.3,
        color: m > 6 ? "#ffb060" : "#4fa8ff",
      });
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

      // Screen shake
      let sx = 0, sy = 0;
      if (crashed && shakeRef.current.intensity > 0.2) {
        const sh = shakeRef.current.intensity;
        sx = (Math.random() - 0.5) * sh;
        sy = (Math.random() - 0.5) * sh;
        shakeRef.current.intensity *= 0.74;
      }

      ctx.setTransform(dpr, 0, 0, dpr, sx, sy);
      ctx.clearRect(-4, -4, W + 8, H + 8);

      const gW = W - PAD_L - PAD_R;
      const gH = H - PAD_T - PAD_B;
      const maxMult = Math.max(1.8, mult * 1.18 + 0.6);

      const toX = (pct) => PAD_L + pct * gW;
      const toY = (m)   => PAD_T + getCurvedY(m, maxMult, gH);
      const baseY = PAD_T + gH;

      // Subtle vignette
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.55, W * 0.8);
      vg.addColorStop(0, "rgba(6,10,28,0)");
      vg.addColorStop(1, "rgba(2,4,10,0.52)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      // Minimal grid — only 3 faint bands, no labels
      [2, 5, 10].forEach(v => {
        if (v > maxMult) return;
        const y = toY(v);
        if (y < PAD_T || y > baseY) return;
        ctx.strokeStyle = `rgba(90,130,210,${v === 2 ? 0.065 : v === 5 ? 0.045 : 0.03})`;
        ctx.lineWidth   = 1;
        ctx.setLineDash([2, 24]);
        ctx.beginPath();
        ctx.moveTo(PAD_L, y);
        ctx.lineTo(PAD_L + gW, y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Baseline
      const bg = ctx.createLinearGradient(PAD_L, 0, PAD_L + gW, 0);
      bg.addColorStop(0,   "rgba(50,120,255,0)");
      bg.addColorStop(0.15,"rgba(50,120,255,0.1)");
      bg.addColorStop(0.85,"rgba(50,120,255,0.1)");
      bg.addColorStop(1,   "rgba(50,120,255,0)");
      ctx.strokeStyle = bg;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_L, baseY);
      ctx.lineTo(PAD_L + gW, baseY);
      ctx.stroke();

      if (pathPts.length < 2) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const pts  = pathPts.map(p => ({ x: toX(p.pct), y: toY(p.mult) }));
      const last = pts[pts.length - 1];

      // ── SPRING-LERP PLANE — inertia feel ──
      const targetX  = last.x;
      const targetY  = last.y;
      const spring   = crashed ? 0.14 : 0.058;
      const damping  = 0.72;
      velXRef.current = velXRef.current * damping + (targetX - planeXRef.current) * spring;
      velYRef.current = velYRef.current * damping + (targetY - planeYRef.current) * spring;
      planeXRef.current += velXRef.current;
      planeYRef.current += velYRef.current;

      // Tilt from velocity — smooth and natural
      if (Math.abs(velXRef.current) > 0.01) {
        const rawTilt = crashed
          ? lerp(planeTiltRef.current, 32, 0.06)
          : Math.max(-36, Math.min(8, (Math.atan2(velYRef.current, velXRef.current) * 180) / Math.PI));
        planeTiltRef.current = lerp(planeTiltRef.current, rawTilt, 0.045);
      }

      const px = planeXRef.current;
      const py = planeYRef.current;

      ctx.save();
      ctx.beginPath();
      ctx.rect(PAD_L, PAD_T, gW, gH + 1);
      ctx.clip();

      // Bezier path tracer
      const tracePath = (c) => {
        c.beginPath();
        c.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1], p1 = pts[i];
          const cpx1 = p0.x + (p1.x - p0.x) * 0.44;
          const cpx2 = p1.x - (p1.x - p0.x) * 0.44;
          c.bezierCurveTo(cpx1, p0.y, cpx2, p1.y, p1.x, p1.y);
        }
      };

      // Area fill
      tracePath(ctx);
      ctx.lineTo(last.x, baseY);
      ctx.lineTo(pts[0].x, baseY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, PAD_T, 0, baseY);
      if (crashed) {
        areaGrad.addColorStop(0,   "rgba(255,35,60,0.18)");
        areaGrad.addColorStop(0.45,"rgba(160,10,30,0.07)");
        areaGrad.addColorStop(1,   "rgba(0,0,0,0)");
      } else {
        areaGrad.addColorStop(0,   "rgba(45,110,255,0.17)");
        areaGrad.addColorStop(0.4, "rgba(30,80,200,0.07)");
        areaGrad.addColorStop(1,   "rgba(0,0,0,0)");
      }
      ctx.fillStyle = areaGrad;
      ctx.fill();

      const lineColor = crashed ? "#ff3355" : "#4aa8ff";
      const glowRGB   = crashed ? "255,51,85" : "50,130,255";
      const brightRGB = crashed ? "255,100,120" : "120,190,255";

      // Pass 1 — outer bloom (thinner than before)
      tracePath(ctx);
      ctx.strokeStyle = `rgba(${glowRGB},0.04)`;
      ctx.lineWidth   = 14;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();

      // Pass 2 — mid glow (reduced intensity)
      tracePath(ctx);
      ctx.strokeStyle = `rgba(${glowRGB},0.15)`;
      ctx.lineWidth   = 5;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur  = 12;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // Pass 3 — bright halo
      tracePath(ctx);
      ctx.strokeStyle = `rgba(${brightRGB},0.45)`;
      ctx.lineWidth   = 2.0;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur  = 7;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // Pass 4 — crisp core
      const coreGrad = ctx.createLinearGradient(pts[0].x, 0, last.x, 0);
      if (crashed) {
        coreGrad.addColorStop(0,   "rgba(255,51,85,0.28)");
        coreGrad.addColorStop(0.6, "#ff3355");
        coreGrad.addColorStop(1,   "#ffaabb");
      } else {
        coreGrad.addColorStop(0,   "rgba(35,90,255,0.28)");
        coreGrad.addColorStop(0.5, "#4aa8ff");
        coreGrad.addColorStop(1,   "#c0e4ff");
      }
      tracePath(ctx);
      ctx.strokeStyle = coreGrad;
      ctx.lineWidth   = 1.6;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur  = 6;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // Slim trail particles — subtle
      if (gs === "flying" && frame % 3 === 0 && px > PAD_L + 12) {
        spawnTrail(px, py, mult);
        if (mult > 4) spawnTrail(px - 2, py + 1, mult);
      }
      particlesRef.current = particlesRef.current.filter(p => p.life > 0.04);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.03; p.vx *= 0.97;
        p.life -= p.decay;
        const a = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fillStyle   = p.color + Math.floor(a * 160).toString(16).padStart(2, "0");
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 3;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });

      // Tip pulse — subtle
      if (!crashed && gs === "flying" && last.x > PAD_L + 5) {
        const pulse = (Math.sin(frame * 0.12) + 1) / 2;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 8 + pulse * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowRGB},${0.025 + pulse * 0.045})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3.5 + pulse * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowRGB},${0.12 + pulse * 0.12})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        const dotG = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 4);
        dotG.addColorStop(0,   "#ffffff");
        dotG.addColorStop(0.4, lineColor);
        dotG.addColorStop(1,   `rgba(${glowRGB},0)`);
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle   = dotG;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur  = 10;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      // Crash FX
      if (crashed && last.x > PAD_L) {
        crashFrameRef.current++;
        const cf = crashFrameRef.current;

        if (cf < 14) {
          ctx.fillStyle = `rgba(255,40,60,${Math.max(0, (14 - cf) / 14) * 0.25})`;
          ctx.fillRect(PAD_L, PAD_T, gW, gH);
        }
        for (let r = 0; r < 3; r++) {
          const radius = 8 + r * 13 + Math.min(cf * 0.5, 30);
          if (radius > 90) continue;
          ctx.beginPath();
          ctx.arc(last.x, last.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,51,85,${Math.max(0, 0.28 - r * 0.08 - cf * 0.005)})`;
          ctx.lineWidth   = 1.3 - r * 0.3;
          ctx.stroke();
        }
        const xs = 6.5 + Math.sin(frame * 0.22) * 0.6;
        ctx.strokeStyle = "rgba(255,55,82,0.88)";
        ctx.lineWidth   = 1.9;
        ctx.lineCap     = "round";
        ctx.shadowColor = "#ff3355";
        ctx.shadowBlur  = 9;
        [[-1,-1,1,1],[1,-1,-1,1]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath();
          ctx.moveTo(last.x + x1 * xs, last.y + y1 * xs);
          ctx.lineTo(last.x + x2 * xs, last.y + y2 * xs);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;

        smokeRef.current = smokeRef.current.filter(p => p.life > 0.02);
        smokeRef.current.forEach(p => {
          if (!p.resolved) {
            p.x = toX(p.relPct); p.y = toY(p.relMult);
            p.resolved = true;
          }
          p.x += p.vx; p.y += p.vy;
          p.vy += 0.05; p.vx *= 0.95;
          p.life -= p.decay;
          p.size = Math.min(p.size + 0.24, 20);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},50%,44%,${p.life * 0.2})`;
          ctx.fill();
        });
      }

      ctx.restore();

      // ── DRAW JET IMAGE — outside clip so it can overflow slightly ──
      if (imgsReadyRef.current && px > PAD_L + 4) {
        const img     = crashed ? jetCrashedImgRef.current : jetImgRef.current;
        const iW      = 90; // rendered width — 25% smaller than SVG viewBox
        const iH      = 36;
        const tilt    = (planeTiltRef.current * Math.PI) / 180;

        // Subtle glow behind plane
        const gColor  = crashed ? "rgba(255,51,85,0.22)" : "rgba(60,130,255,0.18)";
        ctx.save();
        ctx.shadowColor = gColor;
        ctx.shadowBlur  = crashed ? 14 : 10;
        ctx.translate(px, py);
        ctx.rotate(tilt);

        // Draw exhaust flame effect behind jet
        if (!crashed) {
          const hot      = Math.min((mult - 1) / 8, 1);
          const fLen     = 16 + hot * 20 + Math.sin(frame * 0.5) * 2;
          const wobble   = Math.sin(frame * 0.4) * 1.0;
          const ex = ctx.createLinearGradient(0, 0, -fLen, wobble);
          ex.addColorStop(0,   `rgba(255,240,160,${0.65 + hot * 0.2})`);
          ex.addColorStop(0.3, `rgba(255,150,40,0.35)`);
          ex.addColorStop(0.7, `rgba(255,70,10,0.12)`);
          ex.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = ex;
          ctx.beginPath();
          ctx.moveTo(-2, -1.5 + wobble * 0.2);
          ctx.bezierCurveTo(-fLen * 0.3, -2.5 + wobble, -fLen * 0.7, -1.5 + wobble, -fLen, wobble * 0.4);
          ctx.bezierCurveTo(-fLen * 0.7, 1.5 + wobble, -fLen * 0.3, 2.5 + wobble * 0.5, -2, 1.5);
          ctx.closePath();
          ctx.fill();
        }

        ctx.drawImage(img, -iW * 0.82, -iH * 0.5, iW, iH);
        ctx.shadowBlur = 0;
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