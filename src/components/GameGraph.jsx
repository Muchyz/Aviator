import { useRef, useEffect } from "react";

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function GameGraph({
  gs, mult = 1, pathPts = [], crashed = false,
  roundId, onlinePlayers, waiting = false, countdown = 0,
}) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const frameRef  = useRef(0);

  const planeXRef    = useRef(-1);
  const planeYRef    = useRef(-1);
  const planeTiltRef = useRef(-5);
  const velXRef      = useRef(0);
  const velYRef      = useRef(0);

  const planeImgRef  = useRef(null);
  const imgsReadyRef = useRef(false);

  const shakeRef       = useRef(0);
  const flashRef       = useRef(0);
  const crashFrameRef  = useRef(0);
  const prevCrashedRef = useRef(false);
  const explosionRef   = useRef([]);
  const debrisRef      = useRef([]);
  const trailRef       = useRef([]);

  const multRef      = useRef(mult);
  const pathPtsRef   = useRef(pathPts);
  const crashedRef   = useRef(crashed);
  const waitingRef   = useRef(waiting);
  const countdownRef = useRef(countdown);

  multRef.current      = mult;
  pathPtsRef.current   = pathPts;
  crashedRef.current   = crashed;
  waitingRef.current   = waiting;
  countdownRef.current = countdown;

  useEffect(() => {
    loadImage("/plane.png")
      .then(img => { planeImgRef.current = img; imgsReadyRef.current = true; })
      .catch(() => { imgsReadyRef.current = false; });
  }, []);

  useEffect(() => {
    if (crashed && !prevCrashedRef.current) {
      crashFrameRef.current = 0;
      shakeRef.current = 10;
      flashRef.current = 1;
      explosionRef.current = Array.from({ length: 55 }, (_, i) => ({
        angle: (Math.PI * 2 * i) / 55,
        speed: Math.random() * 6 + 2,
        life: 1, size: Math.random() * 3 + 1.5,
      }));
      debrisRef.current = Array.from({ length: 10 }, () => ({
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 4 + 1.5,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.2,
        w: Math.random() * 10 + 4, h: Math.random() * 4 + 2, life: 1,
      }));
    }
    prevCrashedRef.current = crashed;
  }, [crashed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getDims = () => {
      const r = canvas.getBoundingClientRect();
      return { W: r.width || 360, H: r.height || 220 };
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ── BACKGROUND
      ctx.fillStyle = "#080810";
      ctx.fillRect(0, 0, W, H);

      // Purple glow center
      const cg = ctx.createRadialGradient(W*0.5, H*0.38, 0, W*0.5, H*0.38, W*0.65);
      cg.addColorStop(0, "rgba(75,15,155,0.20)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);

      // ── RAYS from bottom-left
      const RX = 0, RY = H;
      for (let i = 0; i < 32; i++) {
        const frac  = i / 31;
        const angle = Math.PI - frac * (Math.PI * 0.78);
        const half  = (Math.PI * 0.78 / 32) * 0.46;
        ctx.beginPath();
        ctx.moveTo(RX, RY);
        ctx.arc(RX, RY, Math.max(W,H)*2.8, angle-half, angle+half);
        ctx.closePath();
        ctx.fillStyle = `rgba(110,90,200,${i%2===0?0.027:0.010})`;
        ctx.fill();
      }

      if (shakeRef.current > 0.4) {
        ctx.setTransform(dpr,0,0,dpr,
          (Math.random()-0.5)*shakeRef.current*dpr,
          (Math.random()-0.5)*shakeRef.current*dpr);
        shakeRef.current *= 0.78;
      }
      if (flashRef.current > 0.01) {
        ctx.fillStyle = `rgba(255,30,30,${flashRef.current*0.14})`;
        ctx.fillRect(0,0,W,H);
        flashRef.current *= 0.82;
      }

      const OX = 0, OY = H;

      // ── WAITING
      if (waiting) {
        const p = 0.5 + Math.sin(frame*0.09)*0.5;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.font=`800 30px 'Arial Black',sans-serif`;
        ctx.fillStyle=`rgba(255,255,255,${0.4+p*0.35})`;
        ctx.shadowColor="#3311dd"; ctx.shadowBlur=14+p*7;
        ctx.fillText("STARTING IN",W/2,H*0.38);
        ctx.font=`900 58px 'Arial Black',sans-serif`;
        ctx.fillStyle="#ffffff"; ctx.shadowBlur=20+p*10;
        ctx.fillText(`${countdownRef.current}s`,W/2,H*0.60);
        ctx.shadowBlur=0;
        animRef.current=requestAnimationFrame(render);
        return;
      }

      if (pathPts.length < 2) {
        animRef.current=requestAnimationFrame(render);
        return;
      }

      // ── COORDINATE SYSTEM
      // Problem: pct goes 0→1 over 200 ticks but we cap/rescale
      // We need X to always spread across FULL canvas width
      // So: find the actual pct range in current pathPts and stretch to W
      
      const BOT_PAD = 3;
      const TOP_PAD = 18;

      // X: use index-based spread so points always fill the canvas width
      // regardless of pct values — this guarantees rightward motion
      const toX = (idx, total) => (idx / Math.max(1, total - 1)) * W;

      // Y: logarithmic height — mostly flat, gentle rise
      // At mult=1 → 0px up, mult=2 → ~20% height, mult=5 → ~45%, mult=10 → ~62%
      const toY = (m) => {
        if (m <= 1) return OY - BOT_PAD;
        const rise = Math.log(m) / Math.log(Math.max(1.01, mult)) * (H - TOP_PAD - BOT_PAD) * 0.70;
        return Math.max(TOP_PAD, OY - BOT_PAD - rise);
      };

      const pts = pathPts.map((p, i) => ({
        x: toX(i, pathPts.length),
        y: Math.min(OY - BOT_PAD, toY(p.mult)),
      }));

      const last = pts[pts.length - 1];

      // ── PLANE spring — must follow X strongly rightward
      if (planeXRef.current < 0) {
        planeXRef.current = 0;
        planeYRef.current = OY - BOT_PAD;
      }
      const sp = crashed ? 0.06 : 0.14;
      velXRef.current = velXRef.current * 0.76 + (last.x - planeXRef.current) * sp;
      velYRef.current = velYRef.current * 0.76 + (last.y - planeYRef.current) * sp;
      planeXRef.current += velXRef.current;
      planeYRef.current += velYRef.current;
      planeYRef.current = Math.min(OY - BOT_PAD - 2, planeYRef.current);

      // Tilt: look at last few points for direction
      if (pts.length >= 4 && !crashed) {
        const i0  = Math.max(0, pts.length - 6);
        const dx  = pts[pts.length-1].x - pts[i0].x;
        const dy  = pts[pts.length-1].y - pts[i0].y;
        const ang = Math.atan2(dy, dx) * (180 / Math.PI);
        planeTiltRef.current = lerp(planeTiltRef.current, clamp(ang, -50, 3), 0.09);
      }

      const px   = planeXRef.current;
      const py   = planeYRef.current;
      const tilt = planeTiltRef.current * Math.PI / 180;

      // ── TRAIL
      if (!crashed) {
        trailRef.current.push({ x: px, y: py });
        if (trailRef.current.length > 40) trailRef.current.shift();
      }
      for (let i = 1; i < trailRef.current.length; i++) {
        const t0 = trailRef.current[i-1], t1 = trailRef.current[i];
        const a  = (i / trailRef.current.length) * 0.70;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y);
        ctx.strokeStyle = `rgba(255,110,20,${a})`;
        ctx.lineWidth   = (i / trailRef.current.length) * 3.2;
        ctx.lineCap     = "round"; ctx.stroke();
      }

      // ── BUILD PATH from exact corner
      const buildPath = (c) => {
        c.beginPath();
        c.moveTo(OX, OY);
        c.lineTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i-1], p1 = pts[i];
          const cpx = p0.x + (p1.x - p0.x) * 0.5;
          c.bezierCurveTo(cpx, p0.y, cpx, p1.y, p1.x, p1.y);
        }
      };

      // ── FILL
      buildPath(ctx);
      ctx.lineTo(last.x, OY);
      ctx.lineTo(OX, OY);
      ctx.closePath();
      const ag = ctx.createLinearGradient(0, TOP_PAD, 0, OY);
      ag.addColorStop(0,    crashed?"rgba(175,10,10,0.72)":"rgba(195,14,14,0.74)");
      ag.addColorStop(0.45, crashed?"rgba(140,7,7,0.52)" :"rgba(160,10,10,0.54)");
      ag.addColorStop(0.85, crashed?"rgba(90,4,4,0.28)"  :"rgba(110,6,6,0.26)");
      ag.addColorStop(1,    "rgba(35,2,2,0.06)");
      ctx.fillStyle = ag; ctx.fill();

      // ── GLOW
      buildPath(ctx);
      ctx.strokeStyle="rgba(255,35,35,0.13)";
      ctx.lineWidth=10; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke();

      // ── LINE
      buildPath(ctx);
      ctx.strokeStyle = crashed ? "#bb0808" : "#ff1515";
      ctx.shadowColor  = crashed ? "#ff0000" : "#ff3030";
      ctx.shadowBlur   = crashed ? 12 : 8;
      ctx.lineWidth    = 2.8;
      ctx.lineCap="round"; ctx.lineJoin="round"; ctx.stroke();
      ctx.shadowBlur=0;

      // ── MULTIPLIER
      const fs = clamp(W*0.135, 40, 84);
      ctx.textAlign="center"; ctx.textBaseline="middle";
      if (crashed) {
        ctx.font=`900 ${clamp(W*0.062,18,32)}px 'Arial Black',sans-serif`;
        ctx.fillStyle="#ff1515";
        ctx.shadowColor="#ff0000"; ctx.shadowBlur=18;
        ctx.fillText("FLEW AWAY!", W/2, H*0.25);
        ctx.font=`900 ${fs}px 'Arial Black',sans-serif`;
        ctx.fillStyle="#ff1515"; ctx.shadowBlur=14;
        ctx.fillText(`${mult.toFixed(2)}x`, W/2, H*0.43);
        ctx.shadowBlur=0;
      } else {
        ctx.font=`900 ${fs}px 'Arial Black',sans-serif`;
        ctx.fillStyle="#ffffff";
        ctx.shadowColor="rgba(0,0,0,0.95)"; ctx.shadowBlur=8;
        ctx.fillText(`${mult.toFixed(2)}x`, W/2, H*0.33);
        ctx.shadowBlur=0;
      }

      // ── CRASH PARTICLES
      if (crashed) {
        crashFrameRef.current++;
        const cf = crashFrameRef.current;
        ctx.beginPath();
        ctx.arc(last.x,last.y,cf*4,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,55,55,${Math.max(0,0.8-cf*0.02)})`;
        ctx.lineWidth=2; ctx.stroke();
        explosionRef.current.forEach(p => {
          const ex=last.x+Math.cos(p.angle)*p.speed*cf;
          const ey=last.y+Math.sin(p.angle)*p.speed*cf;
          const g=ctx.createRadialGradient(ex,ey,0,ex,ey,p.size*2);
          g.addColorStop(0,`rgba(255,${90+Math.random()*110|0},12,${p.life})`);
          g.addColorStop(1,"rgba(255,8,0,0)");
          ctx.beginPath(); ctx.arc(ex,ey,p.size*2,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill(); p.life*=0.96;
        });
        debrisRef.current.forEach(p => {
          const dx2=last.x+Math.cos(p.angle)*p.speed*cf;
          const dy2=last.y+Math.sin(p.angle)*p.speed*cf+cf*cf*0.05;
          ctx.save(); ctx.translate(dx2,dy2);
          ctx.rotate(p.rot+p.rotV*cf);
          ctx.fillStyle=`rgba(185,155,155,${p.life*0.8})`;
          ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
          ctx.restore(); p.life*=0.97;
        });
      }

      // ── PLANE
      if (px >= 0 && py <= OY) {
        const ps = clamp(W*0.085, 30, 54);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(crashed ? tilt + crashFrameRef.current*0.07 : tilt);
        if (imgsReadyRef.current && planeImgRef.current) {
          ctx.shadowColor="rgba(255,80,30,0.22)"; ctx.shadowBlur=4;
          ctx.drawImage(planeImgRef.current,-ps/2,-ps/2,ps,ps);
          ctx.shadowBlur=0;
        } else {
          ctx.fillStyle="#e8eaf6";
          ctx.beginPath();
          ctx.moveTo(ps*0.46,0); ctx.lineTo(-ps*0.15,-ps*0.15);
          ctx.lineTo(-ps*0.04,0); ctx.lineTo(-ps*0.15,ps*0.15);
          ctx.closePath(); ctx.fill();
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
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"block" }}
    />
  );
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x,y,w,h,r); }
  else {
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
    ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
    ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
    ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }
}