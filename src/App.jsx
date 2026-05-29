import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── FONTS (injected once) ────────────────────────────────────────────────
if (!document.getElementById("av-gf")) {
  const l = document.createElement("link");
  l.id = "av-gf"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap";
  document.head.appendChild(l);
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────
const STYLE = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07080f;
  --surface:#0d0f1a;
  --card:#111422;
  --card2:#161929;
  --border:rgba(255,255,255,0.05);
  --border-md:rgba(255,255,255,0.09);
  --border-hi:rgba(255,255,255,0.16);
  --blue:#4f8ef7;
  --blue-soft:rgba(79,142,247,0.12);
  --blue-border:rgba(79,142,247,0.28);
  --green:#00e8a0;
  --green-soft:rgba(0,232,160,0.1);
  --green-border:rgba(0,232,160,0.3);
  --red:#f74f6e;
  --red-soft:rgba(247,79,110,0.1);
  --red-border:rgba(247,79,110,0.3);
  --amber:#f5b731;
  --amber-soft:rgba(245,183,49,0.1);
  --amber-border:rgba(245,183,49,0.3);
  --purple:#a78bfa;
  --mpesa:#00c057;
  --mpesa-h:#00a34a;
  --text:#f0f2fc;
  --text2:#6272a0;
  --text3:#252d47;
  --r:14px;
  --r-sm:9px;
  --shadow:0 4px 32px rgba(0,0,0,0.6);
  --shadow-lg:0 16px 64px rgba(0,0,0,0.85);
  --font:'Outfit',sans-serif;
  --mono:'Space Mono',monospace;
}

html,body{
  width:100%;min-height:100vh;
  background:var(--bg);
  color:var(--text);
  font-family:var(--font);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--border-md);border-radius:3px}

.av-root{
  min-height:100vh;
  background:var(--bg);
  background-image:
    radial-gradient(ellipse 90% 50% at 50% -5%, rgba(79,142,247,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 40% 30% at 85% 90%, rgba(167,139,250,0.04) 0%, transparent 50%);
  padding-bottom:60px;
}

/* ── NAV ── */
.av-nav{
  position:sticky;top:0;z-index:500;
  height:56px;
  background:rgba(7,8,15,0.92);
  backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border);
}
.av-nav-inner{
  max-width:1340px;margin:0 auto;
  height:100%;padding:0 16px;
  display:flex;align-items:center;gap:10px;
}
.av-logo{
  display:flex;align-items:center;gap:9px;
  cursor:pointer;user-select:none;flex-shrink:0;
  text-decoration:none;
}
.av-logo-mark{
  width:32px;height:32px;border-radius:9px;
  background:linear-gradient(140deg,#4f8ef7 0%,#a78bfa 100%);
  display:flex;align-items:center;justify-content:center;
  font-size:16px;box-shadow:0 0 18px rgba(79,142,247,0.4);
}
.av-logo-text{
  font-size:17px;font-weight:800;letter-spacing:-0.5px;color:var(--text);
}
.av-logo-text em{
  font-style:normal;
  background:linear-gradient(90deg,#4f8ef7,#a78bfa);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.av-nav-tabs{
  display:none;gap:2px;margin-left:16px;flex:1;
}
.av-nav-tab{
  padding:6px 14px;border-radius:8px;border:none;
  background:transparent;color:var(--text2);
  font-family:var(--font);font-size:13px;font-weight:600;
  cursor:pointer;display:flex;align-items:center;gap:5px;
  white-space:nowrap;letter-spacing:0.1px;
  transition:color .15s,background .15s;
}
.av-nav-tab:hover{color:var(--text);background:rgba(255,255,255,0.03)}
.av-nav-tab.active{
  background:var(--blue-soft);color:var(--blue);
  border:1px solid var(--blue-border);
}
.av-nav-right{
  display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0;
}
.av-bal{
  display:flex;align-items:center;gap:8px;
  background:var(--surface);border:1px solid var(--border-md);
  border-radius:9px;padding:6px 12px;
}
.av-bal-label{
  font-size:9px;font-weight:700;letter-spacing:1.2px;
  text-transform:uppercase;color:var(--text2);
  display:none;
}
.av-bal-value{
  font-family:var(--mono);font-size:13px;font-weight:700;color:var(--green);
}
.av-btn-dep{
  display:flex;align-items:center;gap:6px;
  padding:7px 13px;border-radius:9px;border:none;
  background:var(--mpesa);color:#fff;
  font-family:var(--font);font-size:13px;font-weight:700;
  cursor:pointer;transition:all .15s;white-space:nowrap;
  box-shadow:0 0 16px rgba(0,192,87,0.28);
}
.av-btn-dep:hover{background:var(--mpesa-h);box-shadow:0 0 24px rgba(0,192,87,0.4)}
.av-dep-text{display:none}
.av-icon-btn{
  width:34px;height:34px;border-radius:9px;
  border:1px solid var(--border-md);background:var(--surface);
  color:var(--text2);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .15s;flex-shrink:0;font-size:16px;
}
.av-icon-btn:hover{border-color:var(--border-hi);color:var(--text)}
.av-avatar-wrap{position:relative}
.av-avatar{
  width:34px;height:34px;border-radius:9px;
  background:linear-gradient(140deg,#4f8ef7,#a78bfa);
  border:none;color:#fff;font-family:var(--font);
  font-size:14px;font-weight:700;cursor:pointer;
  box-shadow:0 0 14px rgba(79,142,247,0.32);
  transition:box-shadow .15s;
}
.av-avatar:hover{box-shadow:0 0 22px rgba(79,142,247,0.5)}
.av-dropdown{
  position:absolute;top:calc(100% + 9px);right:0;
  min-width:210px;z-index:600;
  background:var(--card2);border:1px solid var(--border-md);
  border-radius:14px;padding:5px;
  box-shadow:var(--shadow-lg);
  animation:dropIn .14s ease;
}
@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.av-dd-head{padding:13px 14px 11px;border-bottom:1px solid var(--border);margin-bottom:4px}
.av-dd-name{font-size:14px;font-weight:700;letter-spacing:-0.2px}
.av-dd-phone{font-size:11px;color:var(--text2);font-family:var(--mono);margin-top:2px}
.av-dd-item{
  display:flex;align-items:center;gap:9px;
  width:100%;padding:9px 13px;border-radius:9px;
  border:none;background:transparent;color:var(--text);
  font-family:var(--font);font-size:13px;font-weight:600;
  cursor:pointer;text-align:left;transition:background .12s;
}
.av-dd-item:hover{background:rgba(255,255,255,0.04)}
.av-dd-item.danger{color:var(--red)}
.av-dd-sep{height:1px;background:var(--border);margin:4px 0}
.av-nav-auth{display:flex;gap:7px}
.av-btn-ghost{
  padding:6px 14px;border-radius:9px;
  border:1px solid var(--border-md);background:transparent;
  color:var(--text);font-family:var(--font);font-size:13px;font-weight:600;
  cursor:pointer;transition:all .15s;
}
.av-btn-ghost:hover{border-color:var(--border-hi);background:rgba(255,255,255,0.03)}
.av-btn-primary{
  padding:6px 14px;border-radius:9px;border:none;
  background:var(--blue);color:#fff;
  font-family:var(--font);font-size:13px;font-weight:700;
  cursor:pointer;transition:all .15s;
  box-shadow:0 0 14px rgba(79,142,247,0.3);
}
.av-btn-primary:hover{background:#3d7de8}

/* ── MOB BOTTOM NAV ── */
.av-mob-nav{
  display:flex;
  background:rgba(7,8,15,0.97);
  border-top:1px solid var(--border);
  position:fixed;bottom:0;left:0;right:0;z-index:500;
  backdrop-filter:blur(20px);
}
.av-mob-tab{
  flex:1;padding:8px 0 6px;border:none;background:transparent;
  color:var(--text2);font-family:var(--font);
  font-size:9px;font-weight:700;letter-spacing:0.4px;
  cursor:pointer;display:flex;flex-direction:column;
  align-items:center;gap:3px;transition:color .15s;
  text-transform:uppercase;min-height:48px;
}
.av-mob-tab.active{color:var(--blue)}
.av-mob-tab.active svg{filter:drop-shadow(0 0 7px rgba(79,142,247,0.6))}

/* ── OVERLAY / MODAL ── */
.av-overlay{
  position:fixed;inset:0;z-index:700;
  background:rgba(0,0,0,0.88);backdrop-filter:blur(14px);
  display:flex;align-items:flex-end;justify-content:center;
  animation:ovIn .15s ease;
}
@keyframes ovIn{from{opacity:0}to{opacity:1}}
.av-modal{
  width:100%;max-width:480px;
  background:var(--card2);border:1px solid var(--border-md);
  border-radius:22px 22px 0 0;
  max-height:94vh;overflow-y:auto;
  box-shadow:var(--shadow-lg);
  animation:modalUp .28s cubic-bezier(.32,.72,0,1);
}
@keyframes modalUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.av-modal-pull{width:44px;height:4px;border-radius:2px;background:var(--border-md);margin:14px auto 0}
.av-modal-head{
  padding:16px 20px 14px;border-bottom:1px solid var(--border);
  display:flex;align-items:flex-start;justify-content:space-between;
}
.av-modal-title{font-size:18px;font-weight:800;letter-spacing:-0.4px}
.av-modal-sub{font-size:12px;color:var(--text2);margin-top:3px}
.av-modal-close{
  width:30px;height:30px;border-radius:9px;
  border:1px solid var(--border-md);background:var(--surface);
  color:var(--text2);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;margin-left:12px;transition:all .12s;font-size:16px;
}
.av-modal-close:hover{color:var(--text);border-color:var(--border-hi)}
.av-modal-body{padding:20px 20px 32px}

/* ── FORMS ── */
.av-fg{margin-bottom:14px}
.av-label{
  display:block;font-size:10px;font-weight:700;
  letter-spacing:0.9px;text-transform:uppercase;
  color:var(--text2);margin-bottom:6px;
}
.av-input{
  width:100%;background:var(--surface);
  border:1px solid var(--border-md);border-radius:10px;
  padding:12px 14px;color:var(--text);
  font-family:var(--font);font-size:14px;font-weight:500;
  outline:none;transition:border-color .15s,box-shadow .15s;
  -webkit-appearance:none;
}
.av-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(79,142,247,0.12)}
.av-input.err{border-color:var(--red)}
.av-input::placeholder{color:var(--text3)}
.av-frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.av-ferr{font-size:11px;color:var(--red);margin-top:4px}
.av-fhint{font-size:11px;color:var(--text2);margin-top:5px;line-height:1.55}
.av-flink{color:var(--blue);font-size:13px;font-weight:700;background:none;border:none;cursor:pointer;padding:0}
.av-flink:hover{text-decoration:underline}
.av-ffoot{text-align:center;margin-top:16px;font-size:13px;color:var(--text2)}
.av-alert{border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:14px;font-weight:500}
.av-alert.err{background:var(--red-soft);border:1px solid var(--red-border);color:var(--red)}
.av-alert.ok{background:var(--green-soft);border:1px solid var(--green-border);color:var(--green)}
.av-phone-wrap{
  display:flex;background:var(--surface);
  border:1px solid var(--border-md);border-radius:10px;
  overflow:hidden;transition:border-color .15s,box-shadow .15s;
}
.av-phone-wrap:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(79,142,247,0.12)}
.av-phone-flag{
  padding:0 13px;display:flex;align-items:center;gap:6px;
  font-size:13px;font-weight:700;color:var(--text2);
  border-right:1px solid var(--border);background:var(--card);
  white-space:nowrap;flex-shrink:0;
}
.av-phone-in{
  flex:1;background:transparent;border:none;
  padding:12px 14px;color:var(--text);
  font-family:var(--font);font-size:14px;font-weight:500;
  outline:none;-webkit-appearance:none;
}
.av-phone-in::placeholder{color:var(--text3)}
.av-pw-wrap{position:relative}
.av-pw-wrap .av-input{padding-right:44px}
.av-pw-eye{
  position:absolute;right:12px;top:50%;transform:translateY(-50%);
  background:none;border:none;color:var(--text2);cursor:pointer;
  padding:4px;display:flex;align-items:center;font-size:16px;
}
.av-pw-eye:hover{color:var(--text)}
.av-btn-main{
  width:100%;padding:14px;border-radius:11px;border:none;
  background:var(--blue);color:#fff;
  font-family:var(--font);font-size:15px;font-weight:700;
  cursor:pointer;transition:all .15s;letter-spacing:0.1px;
  box-shadow:0 0 20px rgba(79,142,247,0.28);
}
.av-btn-main:hover{background:#3d7de8;box-shadow:0 0 28px rgba(79,142,247,0.4)}
.av-btn-main:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.av-btn-mpesa{
  width:100%;padding:14px;border-radius:11px;border:none;
  background:var(--mpesa);color:#fff;
  font-family:var(--font);font-size:15px;font-weight:700;
  cursor:pointer;transition:all .15s;
  display:flex;align-items:center;justify-content:center;gap:8px;
  box-shadow:0 0 18px rgba(0,192,87,0.25);
}
.av-btn-mpesa:hover{background:var(--mpesa-h);box-shadow:0 0 28px rgba(0,192,87,0.4)}
.av-btn-mpesa:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.av-presets{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}
.av-preset{
  padding:6px 12px;background:var(--surface);
  border:1px solid var(--border-md);border-radius:8px;
  color:var(--text2);font-family:var(--mono);font-size:12px;
  cursor:pointer;transition:all .12s;
}
.av-preset:hover{border-color:var(--mpesa);color:var(--mpesa)}

/* ── PROCESSING STATE ── */
.av-processing{text-align:center;padding:30px 0}
.av-proc-icon{
  width:58px;height:58px;border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 16px;font-size:24px;
}
.av-proc-icon.green{background:var(--green-soft);border:1px solid var(--green-border);box-shadow:0 0 24px rgba(0,232,160,0.15)}
.av-proc-icon.blue{background:var(--blue-soft);border:1px solid var(--blue-border);box-shadow:0 0 24px rgba(79,142,247,0.15)}
.av-proc-title{font-size:18px;font-weight:800;margin-bottom:9px;letter-spacing:-0.3px}
.av-proc-sub{color:var(--text2);font-size:13px;line-height:1.6}
.av-blink{color:var(--mpesa);font-size:12px;font-weight:700;margin-top:14px;animation:blink 1.1s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* ── MAIN LAYOUT ── */
.av-layout{
  display:flex;flex-direction:column;gap:10px;
  padding:10px;max-width:1340px;margin:0 auto;
}

/* ── GAME CARD ── */
.av-gcard{
  background:var(--card);border:1px solid var(--border);
  border-radius:var(--r);overflow:hidden;
}
.av-topbar{
  padding:8px 12px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:6px;min-height:44px;
  flex-wrap:wrap;background:rgba(0,0,0,0.25);
}
.av-live{
  display:flex;align-items:center;gap:5px;
  font-size:9px;font-weight:700;letter-spacing:1.2px;
  text-transform:uppercase;color:var(--text2);flex-shrink:0;
}
.av-live-dot{
  width:6px;height:6px;border-radius:50%;
  background:var(--green);box-shadow:0 0 8px var(--green);
  animation:blink 1.4s infinite;
}
.av-state-badge{
  font-family:var(--mono);font-size:10px;font-weight:700;
  padding:4px 10px;border-radius:6px;
  background:var(--surface);border:1px solid var(--border-md);
  color:var(--text2);flex-shrink:0;letter-spacing:0.3px;
}
.av-state-badge.flying{color:var(--amber);border-color:var(--amber-border);background:var(--amber-soft);box-shadow:0 0 12px rgba(245,183,49,0.15)}
.av-state-badge.crashed{color:var(--red);border-color:var(--red-border);background:var(--red-soft)}
.av-round-badge{
  font-family:var(--mono);font-size:9px;font-weight:600;
  color:var(--text3);background:var(--surface);
  border:1px solid var(--border);border-radius:6px;padding:3px 8px;flex-shrink:0;
}
.av-topbar-div{width:1px;height:14px;background:var(--border-md);flex-shrink:0;margin:0 2px}
.av-history-strip{
  display:flex;align-items:center;gap:4px;overflow-x:auto;flex:1;min-width:0;
}
.av-history-strip::-webkit-scrollbar{display:none}
.av-cbadge{
  padding:3px 9px;border-radius:6px;flex-shrink:0;
  font-family:var(--mono);font-size:10px;font-weight:700;
  border:1px solid transparent;transition:all .2s;
}
.av-cbadge.lo{background:rgba(79,142,247,0.07);color:#7eb4f7;border-color:rgba(79,142,247,0.18)}
.av-cbadge.mi{background:rgba(98,114,160,0.07);color:#8a9ab8;border-color:rgba(98,114,160,0.15)}
.av-cbadge.hi{background:rgba(167,139,250,0.09);color:var(--purple);border-color:rgba(167,139,250,0.22)}
.av-cbadge.new{animation:badgePop .4s cubic-bezier(.175,.885,.32,1.275)}
@keyframes badgePop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}

/* ── GAME CANVAS ── */
.av-canvas{
  position:relative;height:240px;overflow:hidden;
  border-bottom:1px solid var(--border);
  background:
    radial-gradient(ellipse 100% 60% at 50% 105%,rgba(79,142,247,0.05) 0%,transparent 60%),
    linear-gradient(180deg,#020408 0%,#030509 50%,#050710 100%);
}
.av-canvas-svg{position:absolute;inset:0;width:100%;height:100%}

/* multiplier overlay */
.av-mult-overlay{
  position:absolute;top:12px;left:50%;transform:translateX(-50%);
  text-align:center;pointer-events:none;user-select:none;z-index:5;
}
.av-mult-num{
  font-family:var(--mono);font-size:48px;font-weight:700;
  line-height:1;letter-spacing:-3px;transition:color .2s;
}
.av-mult-num.waiting{color:var(--text3)}
.av-mult-num.flying{color:#fff}
.av-mult-num.flying.hi5{color:var(--amber);text-shadow:0 0 32px rgba(245,183,49,0.55)}
.av-mult-num.flying.hi10{color:var(--purple);text-shadow:0 0 56px rgba(167,139,250,0.85);animation:multPulse .5s ease infinite}
.av-mult-num.crashed{color:var(--red);text-shadow:0 0 32px rgba(247,79,110,0.65);animation:shake .4s ease}
@keyframes multPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.av-mult-sub{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-top:4px;color:var(--text2)}
.av-mult-sub.flying{color:rgba(245,183,49,.5)}
.av-mult-sub.crashed{color:rgba(247,79,110,.7)}

/* win flash */
.av-win-flash{
  position:absolute;top:12px;right:12px;z-index:10;
  background:rgba(0,232,160,0.1);border:1px solid var(--green-border);
  border-radius:9px;padding:6px 14px;
  font-family:var(--mono);font-size:11px;font-weight:700;color:var(--green);
  white-space:nowrap;animation:popIn .28s ease;
  backdrop-filter:blur(12px);box-shadow:0 0 20px rgba(0,232,160,0.2);
}
@keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}

/* countdown */
.av-cd{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);z-index:5;
  display:flex;flex-direction:column;align-items:center;gap:10px;
}
.av-cd-ring{position:relative;width:72px;height:72px}
.av-cd-ring svg{transform:rotate(-90deg)}
.av-cd-track{fill:none;stroke:var(--border-md);stroke-width:2.5}
.av-cd-fill{
  fill:none;stroke:var(--blue);stroke-width:2.5;stroke-linecap:round;
  transition:stroke-dashoffset .9s linear;
  filter:drop-shadow(0 0 7px rgba(79,142,247,0.55));
}
.av-cd-val{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-size:22px;font-weight:700;color:var(--blue);
}
.av-cd-label{font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--text2)}

/* big win */
.av-bigwin{
  position:absolute;inset:0;z-index:20;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.5);backdrop-filter:blur(4px);
  pointer-events:none;animation:ovIn .3s ease;
}
.av-bigwin-box{text-align:center;animation:bigwinPop .45s cubic-bezier(.175,.885,.32,1.275)}
@keyframes bigwinPop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.av-bigwin-mult{
  font-family:var(--mono);font-size:52px;font-weight:700;
  color:var(--purple);text-shadow:0 0 56px rgba(167,139,250,.9);
  line-height:1;animation:multPulse .4s ease infinite;
}
.av-bigwin-name{font-size:13px;font-weight:600;color:var(--text2);margin-top:7px;letter-spacing:.5px}
.av-bigwin-label{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(167,139,250,.6);margin-top:4px}

/* ── BET PANEL ── */
.av-betpanel{padding:14px 14px 18px}
.av-betpanel-header{
  padding:10px 14px 0;border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;margin-bottom:0;
}
.av-betpanel-title{font-size:10px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;color:var(--text2)}
.av-dual-row{display:flex;align-items:center;gap:7px}
.av-dual-label{font-size:11px;font-weight:600;color:var(--text2)}
.av-stepper{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.av-step-btn{
  width:44px;height:44px;border-radius:10px;
  border:1px solid var(--border-md);background:var(--surface);
  color:var(--text);cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-size:20px;font-weight:300;
  transition:all .12s;
}
.av-step-btn:hover:not(:disabled){border-color:var(--border-hi);background:var(--card2);color:var(--blue)}
.av-step-btn:disabled{opacity:.3;cursor:not-allowed}
.av-step-val{
  flex:1;background:var(--surface);border:1px solid var(--border-md);
  border-radius:10px;padding:10px 12px;color:var(--text);
  font-family:var(--mono);font-size:18px;font-weight:700;
  text-align:center;outline:none;-webkit-appearance:none;
  transition:border-color .15s;
}
.av-step-val:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(79,142,247,0.1)}
.av-step-val:disabled{opacity:.35}
.av-qgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px}
.av-qbtn{
  padding:9px 4px;background:var(--surface);border:1px solid var(--border);
  border-radius:9px;color:var(--text2);
  font-family:var(--mono);font-size:11px;font-weight:600;
  cursor:pointer;transition:all .12s;text-align:center;
}
.av-qbtn:hover:not(:disabled){border-color:var(--blue-border);color:var(--blue);background:var(--blue-soft)}
.av-qbtn:disabled{opacity:.3;cursor:not-allowed}
.av-repeat{
  display:flex;align-items:center;gap:5px;
  padding:6px 10px;background:var(--surface);
  border:1px solid var(--border-md);border-radius:8px;
  color:var(--text2);font-family:var(--mono);font-size:10px;font-weight:600;
  cursor:pointer;transition:all .12s;white-space:nowrap;margin-bottom:12px;
}
.av-repeat:hover:not(:disabled){border-color:var(--border-hi);color:var(--text)}
.av-repeat:disabled{opacity:.3;cursor:not-allowed}
.av-cta{
  width:100%;padding:15px;border-radius:11px;border:none;
  font-family:var(--font);font-size:15px;font-weight:800;
  cursor:pointer;transition:all .15s;margin-bottom:12px;
  letter-spacing:.1px;display:flex;align-items:center;justify-content:center;gap:8px;
}
.av-cta.place{
  background:linear-gradient(135deg,#00c957,#00e8a0);color:#001a0d;
  box-shadow:0 0 22px rgba(0,232,160,0.22);
}
.av-cta.place:hover:not(:disabled){filter:brightness(1.07);box-shadow:0 0 32px rgba(0,232,160,0.38)}
.av-cta.place:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
.av-cta.cashout{
  background:linear-gradient(135deg,#f5a623,#f5b731);color:#1a0900;
  box-shadow:0 0 26px rgba(245,183,49,0.32);animation:cashGlow 1.1s ease infinite;
}
@keyframes cashGlow{0%,100%{box-shadow:0 0 26px rgba(245,183,49,0.32)}50%{box-shadow:0 0 44px rgba(245,183,49,0.55)}}
.av-cta.idle{background:var(--surface);border:1px solid var(--border-md);color:var(--text2);font-size:14px;cursor:default}
.av-cta.signin{background:var(--blue-soft);border:1px solid var(--blue-border);color:var(--blue);font-size:14px}
.av-cta.signin:hover{background:rgba(79,142,247,0.18)}
.av-space-hint{
  display:flex;align-items:center;justify-content:center;gap:5px;
  font-size:9px;color:var(--text3);margin-top:-8px;margin-bottom:11px;user-select:none;
}
.av-kbd{
  display:inline-block;background:var(--surface);border:1px solid var(--border-md);
  border-radius:4px;padding:1px 7px;font-size:9px;font-family:var(--mono);color:var(--text2);
}
.av-auto-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:2px}
.av-auto-label{font-size:12px;font-weight:600;color:var(--text2)}
.av-toggle-wrap{display:flex;align-items:center;gap:8px}
.av-toggle{position:relative;width:38px;height:21px;flex-shrink:0;cursor:pointer}
.av-toggle input{opacity:0;width:0;height:0;position:absolute}
.av-toggle-track{position:absolute;inset:0;border-radius:11px;background:var(--surface);border:1px solid var(--border-md);transition:all .2s}
.av-toggle input:checked+.av-toggle-track{background:var(--blue);border-color:var(--blue);box-shadow:0 0 10px rgba(79,142,247,0.4)}
.av-toggle-thumb{position:absolute;top:4px;left:4px;width:11px;height:11px;border-radius:50%;background:#fff;transition:all .2s;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.av-toggle input:checked~.av-toggle-thumb{left:21px}
.av-aco{
  width:62px;background:var(--surface);border:1px solid var(--border-md);
  border-radius:8px;padding:4px 8px;color:var(--text);
  font-family:var(--mono);font-size:12px;font-weight:600;
  text-align:center;outline:none;transition:border-color .15s;
}
.av-aco:focus{border-color:var(--blue)}
.av-dual-panels{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid var(--border)}
.av-dual-panel{border-right:1px solid var(--border)}
.av-dual-panel:last-child{border-right:none}
.av-dual-panel-label{
  font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;
  color:var(--text2);padding:8px 14px 0;display:flex;align-items:center;gap:5px;
}
.av-dual-panel-label .dot{width:6px;height:6px;border-radius:50%;background:var(--blue);box-shadow:0 0 5px var(--blue)}
.av-dual-panel-label .dot2{background:var(--amber);box-shadow:0 0 5px var(--amber)}

/* provably fair */
.av-pf{
  border-top:1px solid var(--border);padding:7px 13px;
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  background:rgba(0,0,0,.18);
}
.av-pf-label{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);flex-shrink:0}
.av-pf-hash{font-family:var(--mono);font-size:9px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.av-pf-btn{
  font-size:9px;font-weight:700;color:var(--blue);
  background:none;border:none;cursor:pointer;flex-shrink:0;
  padding:2px 7px;border-radius:5px;display:flex;align-items:center;gap:3px;
  transition:background .12s;
}
.av-pf-btn:hover{background:var(--blue-soft)}

/* ── RIGHT SIDEBAR ── */
.av-rcol{display:none;flex-direction:column;gap:10px}
.av-rcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.av-rhead{
  padding:11px 14px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.av-rtitle{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--text)}
.av-rcnt{
  background:var(--surface);border:1px solid var(--border);
  border-radius:6px;padding:2px 8px;font-size:10px;color:var(--text2);font-family:var(--mono);
}
.av-plist{padding:4px;max-height:260px;overflow-y:auto}
.av-plist::-webkit-scrollbar{width:2px}
.av-prow{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 11px;border-radius:8px;transition:background .1s;
}
.av-prow:hover{background:rgba(255,255,255,.02)}
.av-prow.cashed{background:rgba(0,232,160,.03)}
.av-pname{font-size:11px;font-weight:600}
.av-pbet{font-size:9px;color:var(--text2);font-family:var(--mono);margin-top:1px}
.av-pmult{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--text2)}
.av-pmult.cashed{color:var(--green)}
.av-quick-dep{
  background:linear-gradient(135deg,rgba(79,142,247,.07),rgba(79,142,247,.02));
  border:1px solid var(--blue-border);border-radius:11px;padding:13px;margin-bottom:12px;
}
.av-bal-block-label{font-size:9px;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase}
.av-bal-block-amt{font-family:var(--mono);font-size:20px;font-weight:700;color:var(--green);margin:5px 0 3px}
.av-bal-block-sub{font-size:10px;color:var(--text2)}
.av-rpad{padding:13px}

/* ── CHAT ── */
.av-chat-feed{height:150px;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:5px}
.av-chat-feed::-webkit-scrollbar{display:none}
.av-chat-msg{font-size:11px;line-height:1.55}
.av-chat-name{font-weight:700;margin-right:3px;font-size:10px}
.av-chat-name.blue{color:var(--blue)}.av-chat-name.green{color:var(--green)}.av-chat-name.amber{color:var(--amber)}
.av-chat-text{color:var(--text2)}
.av-chat-input-row{display:flex;gap:7px;padding:10px;border-top:1px solid var(--border)}
.av-chat-input{
  flex:1;background:var(--surface);border:1px solid var(--border-md);
  border-radius:9px;padding:8px 12px;color:var(--text);
  font-family:var(--font);font-size:12px;outline:none;transition:border-color .15s;
}
.av-chat-input:focus{border-color:var(--blue)}
.av-chat-send{
  width:34px;height:34px;border-radius:9px;border:none;
  background:var(--blue);color:#fff;cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-size:14px;box-shadow:0 0 12px rgba(79,142,247,.25);transition:all .12s;
}
.av-chat-send:hover{background:#3d7de8}

/* ── MOB PLAYERS ── */
.av-mob-players{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}

/* ── PAGES ── */
.av-page{width:100%;max-width:520px;margin:12px auto;padding:0 10px}
.av-page.wide{max-width:680px}
.av-pcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.av-pcard-head{padding:18px 20px;border-bottom:1px solid var(--border)}
.av-pcard-title{font-size:17px;font-weight:800;letter-spacing:-.4px}
.av-pcard-sub{font-size:12px;color:var(--text2);margin-top:3px}
.av-pcard-body{padding:18px 20px}
.av-big-bal{
  background:linear-gradient(135deg,rgba(79,142,247,.08),transparent);
  border:1px solid var(--blue-border);border-radius:13px;padding:16px;margin-bottom:16px;
}
.av-bb-label{font-size:9px;color:var(--text2);letter-spacing:1.3px;text-transform:uppercase}
.av-bb-amt{font-family:var(--mono);font-size:30px;font-weight:700;color:var(--green);margin:6px 0 4px}
.av-bb-sub{font-size:11px;color:var(--text2)}
.av-tab-row{display:flex;gap:8px;margin-bottom:16px}
.av-tabbtn{
  flex:1;padding:10px 6px;border-radius:10px;border:1px solid var(--border-md);
  background:var(--surface);color:var(--text2);
  font-family:var(--font);font-size:13px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .12s;
}
.av-tabbtn.dep{background:var(--green-soft);border-color:var(--green-border);color:var(--green)}
.av-tabbtn.wd{background:var(--amber-soft);border-color:var(--amber-border);color:var(--amber)}
.av-filter-row{
  display:flex;gap:6px;padding:10px 14px;border-bottom:1px solid var(--border);overflow-x:auto;
}
.av-filter-row::-webkit-scrollbar{display:none}
.av-fpill{
  padding:5px 13px;border-radius:18px;border:1px solid var(--border);
  background:transparent;color:var(--text2);font-size:11px;font-weight:700;
  cursor:pointer;white-space:nowrap;transition:all .12s;letter-spacing:.1px;
}
.av-fpill.on{background:var(--blue-soft);border-color:var(--blue-border);color:var(--blue)}
.av-hist-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.02);
}
.av-hist-left{display:flex;align-items:center;gap:10px;min-width:0}
.av-hist-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}
.av-hist-icon.dep{background:var(--green-soft);color:var(--green)}
.av-hist-icon.win{background:var(--amber-soft);color:var(--amber)}
.av-hist-icon.wd{background:var(--blue-soft);color:var(--blue)}
.av-hist-icon.bet,.av-hist-icon.loss{background:rgba(167,139,250,.1);color:var(--purple)}
.av-hist-desc{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.1px}
.av-hist-time{font-size:9px;color:var(--text2);font-family:var(--mono);margin-top:2px}
.av-hist-amt{font-family:var(--mono);font-size:13px;font-weight:700;flex-shrink:0;padding-left:12px}
.av-hist-amt.pos{color:var(--green)}
.av-hist-amt.neg{color:var(--red)}
.av-locked{display:flex;flex-direction:column;align-items:center;text-align:center;padding:56px 24px}
.av-locked-icon{width:54px;height:54px;border-radius:14px;background:var(--surface);border:1px solid var(--border-md);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;color:var(--text2)}
.av-locked-title{font-size:18px;font-weight:800;margin-bottom:9px;letter-spacing:-.3px}
.av-locked-sub{color:var(--text2);font-size:13px;line-height:1.65;margin-bottom:22px;max-width:250px}
.av-locked-btns{display:flex;gap:10px}
.av-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.av-stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;transition:border-color .15s}
.av-stat-card:hover{border-color:var(--border-md)}
.av-stat-icon{margin-bottom:8px;font-size:16px}
.av-stat-val{font-family:var(--mono);font-size:18px;font-weight:700;color:var(--text)}
.av-stat-val.green{color:var(--green)}
.av-stat-val.amber{color:var(--amber)}
.av-stat-val.red{color:var(--red)}
.av-stat-label{font-size:10px;color:var(--text2);margin-top:4px;font-weight:600}
.av-acct{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:15px}
.av-acct-section-label{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2);margin-bottom:12px}
.av-acct-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:7px 0}
.av-acct-row+.av-acct-row{border-top:1px solid var(--border)}
.av-acct-key{color:var(--text2)}
.av-acct-val{font-weight:700}
.av-acct-val.mono{font-family:var(--mono);font-size:11px}
.av-acct-val.green{color:var(--green)}
.av-lb-row{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.02)}
.av-lb-rank{font-family:var(--mono);font-size:12px;font-weight:700;width:28px;flex-shrink:0;text-align:center}
.av-lb-rank.gold{color:var(--amber);text-shadow:0 0 9px rgba(245,183,49,.55)}
.av-lb-rank.silver{color:#94a3b8}
.av-lb-rank.bronze{color:#b07a40}
.av-lb-av{width:32px;height:32px;border-radius:9px;background:linear-gradient(140deg,#4f8ef7,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
.av-lb-name{flex:1;font-size:13px;font-weight:700;letter-spacing:-.1px}
.av-lb-sub{font-size:9px;color:var(--text2);margin-top:1px;font-family:var(--mono)}
.av-lb-amt{font-family:var(--mono);font-size:12px;font-weight:700;color:var(--green)}

/* ── TOAST ── */
.av-toast{
  position:fixed;bottom:68px;left:50%;transform:translateX(-50%);
  z-index:900;width:calc(100% - 28px);max-width:300px;
  padding:11px 15px;border-radius:11px;
  font-size:13px;font-weight:700;text-align:center;
  display:flex;align-items:center;justify-content:center;gap:7px;
  animation:toastUp .22s ease;backdrop-filter:blur(16px);letter-spacing:.1px;
}
@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.av-toast.ok{background:rgba(0,232,160,.1);border:1px solid var(--green-border);color:var(--green);box-shadow:0 4px 22px rgba(0,232,160,.2)}
.av-toast.err{background:var(--red-soft);border:1px solid var(--red-border);color:var(--red);box-shadow:0 4px 22px rgba(247,79,110,.2)}

/* ── FLOAT NOTIFS ── */
.av-float{position:fixed;bottom:76px;left:12px;z-index:800;pointer-events:none;display:flex;flex-direction:column;gap:5px;max-width:220px}
.av-fnotif{
  background:rgba(0,232,160,.09);border:1px solid var(--green-border);
  border-radius:10px;padding:7px 12px;font-size:10px;font-weight:700;color:var(--green);
  animation:floatUp 4.5s ease forwards;backdrop-filter:blur(10px);
}
@keyframes floatUp{0%{opacity:0;transform:translateY(14px)}10%{opacity:1;transform:translateY(0)}78%{opacity:1;transform:translateY(-8px)}100%{opacity:0;transform:translateY(-22px)}}

/* ── SPLASH ── */
.av-splash{
  position:fixed;inset:0;z-index:1000;background:var(--bg);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;
  background-image:radial-gradient(ellipse 60% 40% at 50% 50%,rgba(79,142,247,.07) 0%,transparent 65%);
}
.av-splash-logo{font-size:26px;font-weight:900;letter-spacing:-.6px}
.av-splash-logo em{font-style:normal;background:linear-gradient(90deg,#4f8ef7,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.av-splash-spin{width:44px;height:44px;border-radius:50%;border:2.5px solid var(--border-md);border-top-color:var(--blue);animation:spin .85s linear infinite;box-shadow:0 0 22px rgba(79,142,247,.22)}
@keyframes spin{to{transform:rotate(360deg)}}
.av-nodata{text-align:center;padding:30px;color:var(--text2);font-size:13px}

/* ── RESPONSIVE ── */
@media(min-width:400px){.av-canvas{height:260px}.av-mult-num{font-size:54px}}
@media(min-width:540px){
  .av-dep-text{display:inline}
  .av-bal-label{display:block}
  .av-canvas{height:280px}
  .av-mult-num{font-size:64px}
  .av-float{bottom:20px}
  .av-toast{bottom:20px;left:auto;right:16px;transform:none;width:auto;max-width:290px;animation:toastRight .2s ease}
}
@keyframes toastRight{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:768px){
  .av-nav-tabs{display:flex}
  .av-mob-nav{display:none}
  .av-root{padding-bottom:0}
  .av-canvas{height:296px}
  .av-mult-num{font-size:72px}
}
@media(min-width:1000px){
  .av-layout{display:grid;grid-template-columns:1fr 296px;gap:10px;padding:12px 16px}
  .av-rcol{display:flex}
  .av-mob-players{display:none}
  .av-canvas{height:316px}
  .av-mult-num{font-size:78px}
}
`;

if (!document.getElementById("av-css")) {
  const s = document.createElement("style");
  s.id = "av-css"; s.textContent = STYLE;
  document.head.appendChild(s);
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────
const fKES = n => `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fTime = d => d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
const fDate = d => d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
const cbCls = v => v >= 10 ? "hi" : v >= 2 ? "mi" : "lo";
const randId = () => Math.random().toString(36).slice(2, 9);

const BOT_NAMES = ["KipC***","WanjiM***","OmonB***","Amina***","JohnK***","FatumA***","MwanM***","NjeriW***","BrianO***","GraceA***","SamK***","LucyN***"];
const BOT_CHATS = [
  { color:"amber", text:"That 8x was fire 🔥" },
  { color:"green", text:"cashed at 3.2x, nice one" },
  { color:"blue", text:"Big win alert this round!" },
  { color:"", text:"let's go all in" },
  { color:"amber", text:"anyone riding to 20x?" },
  { color:"", text:"just deposited, ready!" },
  { color:"green", text:"auto cashout saves the day" },
  { color:"", text:"gg everyone 💪" },
  { color:"amber", text:"wow that crash was brutal 😭" },
  { color:"green", text:"×5 and cashed baby!" },
  { color:"", text:"next round gonna be big 🚀" },
];
const FLOAT_WINS = [
  "WanjiM*** won KES 1,240","KipC*** cashed out ×8.4","Amina*** won KES 3,500",
  "OmonB*** cashed out ×5.2","JohnK*** won KES 840","FatumA*** cashed ×12.1",
];

// ─── GAME ENGINE ──────────────────────────────────────────────────────────
// Uses same exponential formula as server: mult = e^(elapsed * 0.35)
// Crash determined by provably-fair-style random with house edge
function generateCrash() {
  const r = Math.random();
  if (r < 0.04) return 1.00;
  // Inverse: e^(t*0.35) = target, so target chosen from exponential distribution
  const u = Math.random();
  if (u < 0.38) return Math.max(1.00, +(1 + Math.random() * 0.8).toFixed(2));
  if (u < 0.68) return +(1.8 + Math.random() * 2.5).toFixed(2);
  if (u < 0.88) return +(4 + Math.random() * 8).toFixed(2);
  return +(12 + Math.random() * 25).toFixed(2);
}

// ─── ANIMATED BALANCE ─────────────────────────────────────────────────────
function useAnimBal(target) {
  const [disp, setDisp] = useState(target);
  const prev = useRef(target);
  const raf = useRef(null);
  useEffect(() => {
    const from = prev.current, to = target;
    if (Math.abs(from - to) < 0.01) { setDisp(to); prev.current = to; return; }
    const t0 = performance.now(), dur = 650;
    if (raf.current) cancelAnimationFrame(raf.current);
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(from + (to - from) * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else { setDisp(to); prev.current = to; }
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);
  return disp;
}
function AnimBal({ value }) {
  const d = useAnimBal(value);
  return <span>{fKES(d)}</span>;
}

// ─── SVG PLANE ────────────────────────────────────────────────────────────
function Plane({ crashed }) {
  return (
    <svg width="74" height="42" viewBox="0 0 74 42" fill="none"
      style={{
        display: "block",
        filter: crashed
          ? "drop-shadow(0 0 12px rgba(247,79,110,0.9))"
          : "drop-shadow(0 0 9px rgba(200,230,255,0.9)) drop-shadow(0 0 20px rgba(150,200,255,0.4))",
        transform: crashed ? "rotate(28deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
      }}>
      <defs>
        <linearGradient id="pb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={crashed ? "#cc2244" : "#cce0f5"} />
          <stop offset="100%" stopColor={crashed ? "#f74f6e" : "#ffffff"} />
        </linearGradient>
        <linearGradient id="pf" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffe000" stopOpacity=".95" />
          <stop offset="60%" stopColor="#ff9500" stopOpacity=".8" />
          <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {!crashed && <ellipse cx="6" cy="21" rx="9" ry="3.5" fill="url(#pf)" opacity=".9" />}
      <path d="M15 18.5Q21 16 41 17Q59 17.5 67 21Q59 24.5 41 25Q21 26 15 23.5Z" fill="url(#pb)" />
      <path d="M61 19L73 21L61 23Z" fill={crashed ? "#ff7090" : "#e8f4ff"} />
      <path d="M31 20.5L17 5L45 19Z" fill={crashed ? "#991133" : "#8ab4d8"} opacity=".9" />
      <path d="M31 22L17 37L45 23Z" fill={crashed ? "#771122" : "#6699bb"} opacity=".5" />
      <path d="M17 20.5L14 11L23 19Z" fill={crashed ? "#bb2244" : "#aaccee"} opacity=".9" />
      <path d="M15 21L8 16L21 20Z" fill={crashed ? "#881133" : "#7aaccc"} opacity=".75" />
      <path d="M15 22L8 27L21 23Z" fill={crashed ? "#661122" : "#5a9bbb"} opacity=".55" />
      <ellipse cx="30" cy="24.5" rx="5" ry="2.2" fill={crashed ? "#771133" : "#3a5577"} />
      <ellipse cx="55" cy="19.5" rx="4" ry="2" fill="rgba(130,210,255,.7)" />
      <ellipse cx="49" cy="19" rx="2.8" ry="1.8" fill="rgba(130,210,255,.45)" />
      <ellipse cx="43" cy="18.8" rx="2" ry="1.5" fill="rgba(130,210,255,.25)" />
      <path d="M23 18.5Q43 18 61 19" stroke="rgba(79,142,247,.55)" strokeWidth=".8" fill="none" />
    </svg>
  );
}

// ─── GRAPH ────────────────────────────────────────────────────────────────
function Graph({ mult, pts, crashed }) {
  const W = 600, H = 300, PL = 48, PB = 28, PR = 22, PT = 22;
  const gW = W - PL - PR, gH = H - PT - PB;
  const maxM = Math.max(1.5, mult * 1.18 + 0.4);
  const tx = p => PL + p * gW;
  const ty = m => PT + gH - Math.min((m - 1) / (maxM - 1), 1) * gH;

  let line = "", fill = "";
  if (pts.length >= 2) {
    const ps = pts.map(p => ({ x: tx(p.pct), y: ty(p.mult) }));
    line = `M ${ps[0].x} ${ps[0].y}`;
    for (let i = 1; i < ps.length; i++) {
      const a = ps[i - 1], b = ps[i];
      const cx = a.x + (b.x - a.x) * 0.5;
      line += ` C ${cx} ${a.y} ${cx} ${b.y} ${b.x} ${b.y}`;
    }
    const last = ps[ps.length - 1];
    fill = line + ` L ${last.x} ${PT + gH} L ${ps[0].x} ${PT + gH} Z`;
  }

  const range = maxM - 1;
  const steps = [0.2, 0.5, 1, 2, 5, 10, 20, 50];
  const step = steps.find(s => s >= range / 5) || 1;
  const ticks = [];
  for (let v = 1; v <= maxM + step * 0.5; v += step) {
    if (v > maxM + 0.1) break;
    ticks.push(+v.toFixed(1));
  }

  const lc = crashed ? "#f74f6e" : "#f5b731";
  const last = pts.length > 0 ? pts[pts.length - 1] : null;
  const tipX = last ? tx(last.pct) : PL;
  const tipY = last ? ty(last.mult) : PT + gH;
  const bx = Math.min(tipX + 8, PL + gW - 58);
  const by = Math.max(PT + 4, Math.min(tipY - 14, PT + gH - 28));

  return (
    <svg className="av-canvas-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={crashed ? "#f74f6e" : "#f5b731"} stopOpacity={crashed ? ".35" : ".28"} />
          <stop offset="100%" stopColor={crashed ? "#f74f6e" : "#ff8800"} stopOpacity="0" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="gc"><rect x={PL} y={PT} width={gW} height={gH} /></clipPath>
        <pattern id="dg" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r=".6" fill="rgba(255,255,255,.035)" />
        </pattern>
      </defs>
      <rect x={PL} y={PT} width={gW} height={gH} fill="url(#dg)" />
      {ticks.map((v, i) => {
        const sy = ty(v);
        if (sy < PT - 2 || sy > PT + gH + 2) return null;
        return (
          <g key={i}>
            <line x1={PL} y1={sy} x2={PL + gW} y2={sy} stroke="rgba(255,255,255,.04)" strokeWidth="1" strokeDasharray="4 8" />
            <text x={PL - 7} y={sy + 4} textAnchor="end" fontSize="9.5" fontFamily="Space Mono,monospace" fill="rgba(98,114,160,.7)" fontWeight="600">
              {v % 1 === 0 ? `${v}×` : `${v.toFixed(1)}×`}
            </text>
          </g>
        );
      })}
      <line x1={PL} y1={PT} x2={PL} y2={PT + gH} stroke="rgba(255,255,255,.07)" strokeWidth="1" />
      <line x1={PL} y1={PT + gH} x2={PL + gW} y2={PT + gH} stroke="rgba(255,255,255,.07)" strokeWidth="1" />
      {fill && <path d={fill} fill="url(#ag)" clipPath="url(#gc)" />}
      {line && <path d={line} fill="none" stroke={crashed ? "rgba(247,79,110,.4)" : "rgba(245,183,49,.25)"} strokeWidth="12" strokeLinecap="round" clipPath="url(#gc)" filter="url(#glow)" />}
      {line && <path d={line} fill="none" stroke={lc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#gc)" />}
      {last && !crashed && tipY >= PT - 12 && (
        <g clipPath="url(#gc)" filter="url(#glow)">
          <circle cx={tipX} cy={tipY} r="5" fill="#f5b731" opacity=".12">
            <animate attributeName="r" values="4;14;4" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".18;0;.18" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={tipX} cy={tipY} r="4" fill="#f5b731" opacity=".8" />
          <circle cx={tipX} cy={tipY} r="2" fill="#fff" />
        </g>
      )}
      {last && (
        <g>
          <rect x={bx} y={by} width="56" height="22" rx="5"
            fill={crashed ? "rgba(247,79,110,.14)" : "rgba(245,183,49,.11)"}
            stroke={crashed ? "rgba(247,79,110,.4)" : "rgba(245,183,49,.35)"} strokeWidth="1" />
          <text x={bx + 28} y={by + 15} textAnchor="middle" fontSize="11.5"
            fontFamily="Space Mono,monospace" fill={crashed ? "#f74f6e" : "#f5b731"} fontWeight="700">
            {Number(mult).toFixed(2)}×
          </text>
        </g>
      )}
      <text x={PL - 7} y={PT + gH + 4} textAnchor="end" fontSize="9.5"
        fontFamily="Space Mono,monospace" fill="rgba(98,114,160,.5)">1×</text>
    </svg>
  );
}

// ─── PLANE OVERLAY ────────────────────────────────────────────────────────
function PlaneOverlay({ pct, mult, maxMult, crashed }) {
  const W = 600, H = 300, PL = 48, PR = 22, PT = 22, PB = 28;
  const gW = W - PL - PR, gH = H - PT - PB;
  const sx = PL + pct * gW;
  const ratio = Math.min((mult - 1) / (Math.max(1.5, maxMult) - 1), 1);
  const sy = PT + gH - ratio * gH;
  return (
    <div style={{
      position: "absolute",
      left: `${(sx / W) * 100}%`,
      bottom: `${((H - sy) / H) * 100}%`,
      transform: "translate(-12%, 45%)",
      pointerEvents: "none", zIndex: 7,
      transition: crashed ? "none" : "left 0.08s linear, bottom 0.08s linear",
      willChange: "left,bottom",
    }}>
      <Plane crashed={crashed} />
    </div>
  );
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────
function Countdown({ cd, total = 5 }) {
  const r = 29, circ = 2 * Math.PI * r;
  return (
    <div className="av-cd">
      <div className="av-cd-ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle className="av-cd-track" cx="36" cy="36" r={r} />
          <circle className="av-cd-fill" cx="36" cy="36" r={r}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - cd / total)} />
        </svg>
        <div className="av-cd-val">{Math.ceil(cd)}</div>
      </div>
      <div className="av-cd-label">Next Round</div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div className="av-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="av-modal">
        <div className="av-modal-pull" />
        {children}
      </div>
    </div>
  );
}

function PhoneField({ value, onChange }) {
  return (
    <div className="av-phone-wrap">
      <div className="av-phone-flag">🇰🇪 +254</div>
      <input className="av-phone-in" placeholder="7XX XXX XXX"
        value={value.replace(/^254/, "")}
        onChange={e => onChange("254" + e.target.value.replace(/^0/, "").replace(/\D/g, ""))} />
    </div>
  );
}

function PwField({ placeholder, value, onChange, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div className="av-pw-wrap">
      <input className="av-input" type={show ? "text" : "password"}
        placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} />
      <button className="av-pw-eye" type="button" onClick={() => setShow(s => !s)}>
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}

function LoginModal({ onClose, onLogin, toReg }) {
  const [phone, setPhone] = useState("254");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (phone.length < 12 || !pass) { setErr("Enter your phone number and password."); return; }
    setBusy(true);
    setTimeout(() => {
      const db = JSON.parse(localStorage.getItem("av_users") || "{}");
      const u = db[phone];
      if (!u || u.pass !== pass) { setErr("Invalid phone number or password."); setBusy(false); return; }
      localStorage.setItem("av_session", JSON.stringify({ phone, name: u.name }));
      onLogin({ phone, name: u.name, balance: u.balance ?? 1000 });
      onClose();
    }, 600);
  };

  return (
    <Modal onClose={onClose}>
      <div className="av-modal-head">
        <div>
          <div className="av-modal-title">Welcome back</div>
          <div className="av-modal-sub">Sign in with your M-Pesa number</div>
        </div>
        <button className="av-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="av-modal-body">
        {err && <div className="av-alert err">{err}</div>}
        <div className="av-fg">
          <label className="av-label">M-Pesa Number</label>
          <PhoneField value={phone} onChange={setPhone} />
        </div>
        <div className="av-fg">
          <label className="av-label">Password</label>
          <PwField placeholder="••••••••" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="av-btn-main" onClick={submit} disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
        <div className="av-ffoot">
          No account?{" "}
          <button className="av-flink" onClick={() => { onClose(); toReg(); }}>Create one free</button>
        </div>
      </div>
    </Modal>
  );
}

function RegisterModal({ onClose, onLogin, toLogin }) {
  const [f, setF] = useState({ fn: "", ln: "", phone: "254", pass: "", confirm: "" });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const clr = k => setErrs(p => ({ ...p, [k]: "" }));

  const validate = () => {
    const e = {};
    if (!f.fn.trim()) e.fn = "Required";
    if (!f.ln.trim()) e.ln = "Required";
    if (f.phone.length < 12) e.phone = "Enter full number";
    if (!f.pass) e.pass = "Required";
    else if (f.pass.length < 6) e.pass = "Min 6 characters";
    if (f.pass !== f.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setBusy(true);
    setTimeout(() => {
      const db = JSON.parse(localStorage.getItem("av_users") || "{}");
      if (db[f.phone]) { setErr("Phone already registered. Sign in instead."); setBusy(false); return; }
      const name = `${f.fn.trim()} ${f.ln.trim()}`;
      db[f.phone] = { name, pass: f.pass, balance: 1000 };
      localStorage.setItem("av_users", JSON.stringify(db));
      localStorage.setItem("av_session", JSON.stringify({ phone: f.phone, name }));
      onLogin({ phone: f.phone, name, balance: 1000 });
      onClose();
    }, 700);
  };

  return (
    <Modal onClose={onClose}>
      <div className="av-modal-head">
        <div>
          <div className="av-modal-title">Create Account</div>
          <div className="av-modal-sub">Join AviPesa · Get KES 1,000 demo balance</div>
        </div>
        <button className="av-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="av-modal-body">
        {err && <div className="av-alert err">{err}</div>}
        <div className="av-frow">
          <div className="av-fg">
            <label className="av-label">First Name</label>
            <input className={`av-input${errs.fn ? " err" : ""}`} placeholder="John"
              value={f.fn} onChange={e => { set("fn")(e.target.value); clr("fn"); }} />
            {errs.fn && <div className="av-ferr">{errs.fn}</div>}
          </div>
          <div className="av-fg">
            <label className="av-label">Last Name</label>
            <input className={`av-input${errs.ln ? " err" : ""}`} placeholder="Kamau"
              value={f.ln} onChange={e => { set("ln")(e.target.value); clr("ln"); }} />
            {errs.ln && <div className="av-ferr">{errs.ln}</div>}
          </div>
        </div>
        <div className="av-fg">
          <label className="av-label">M-Pesa Number</label>
          <PhoneField value={f.phone} onChange={v => { set("phone")(v); clr("phone"); }} />
          {errs.phone && <div className="av-ferr">{errs.phone}</div>}
        </div>
        <div className="av-frow">
          <div className="av-fg">
            <label className="av-label">Password</label>
            <PwField placeholder="Min 6 chars" value={f.pass}
              onChange={e => { set("pass")(e.target.value); clr("pass"); }} />
            {errs.pass && <div className="av-ferr">{errs.pass}</div>}
          </div>
          <div className="av-fg">
            <label className="av-label">Confirm</label>
            <PwField placeholder="Repeat" value={f.confirm}
              onChange={e => { set("confirm")(e.target.value); clr("confirm"); }} />
            {errs.confirm && <div className="av-ferr">{errs.confirm}</div>}
          </div>
        </div>
        <div className="av-fhint" style={{ marginBottom: 14 }}>
          By registering you confirm you are 18+ and agree to our{" "}
          <span style={{ color: "var(--blue)" }}>Terms of Service</span>.
        </div>
        <button className="av-btn-main" onClick={submit} disabled={busy}>
          {busy ? "Creating account…" : "Create Account — Get KES 1,000 Demo"}
        </button>
        <div className="av-ffoot">
          Have an account?{" "}
          <button className="av-flink" onClick={() => { onClose(); toLogin(); }}>Sign in</button>
        </div>
      </div>
    </Modal>
  );
}

function DepositModal({ onClose, onDeposit }) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 10;

  const submit = () => {
    if (!valid) return;
    setStep(1);
    setTimeout(() => { onDeposit(amt); onClose(); }, 2200);
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="av-modal-head">
        <div>
          <div className="av-modal-title">Deposit via M-Pesa</div>
          <div className="av-modal-sub">Demo mode — funds added instantly</div>
        </div>
        {step === 0 && <button className="av-modal-close" onClick={onClose}>✕</button>}
      </div>
      <div className="av-modal-body">
        {step === 0 ? (
          <>
            <div className="av-fg">
              <label className="av-label">Amount (KES)</label>
              <input className="av-input" type="number" placeholder="Minimum KES 10"
                value={amount} onChange={e => setAmount(e.target.value)} />
              <div className="av-presets">
                {[50, 100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} className="av-preset" onClick={() => setAmount(String(v))}>{v}</button>
                ))}
              </div>
            </div>
            <button className="av-btn-mpesa" onClick={submit} disabled={!valid}>
              ↓ Deposit {amount && !isNaN(amt) ? fKES(amt) : ""}
            </button>
          </>
        ) : (
          <div className="av-processing">
            <div className="av-proc-icon green">↓</div>
            <div className="av-proc-title">Processing Deposit</div>
            <div className="av-proc-sub">Adding funds to your account…</div>
            <div className="av-blink">Please wait…</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function WithdrawModal({ onClose, balance, onWithdraw }) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 100 && amt <= balance;

  const next = () => {
    if (!valid) { setErr(amt > balance ? "Exceeds balance" : "Minimum KES 100"); return; }
    setErr(""); setStep(1);
  };
  const confirm = () => {
    setBusy(true);
    setTimeout(() => { onWithdraw(amt); onClose(); }, 1200);
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="av-modal-head">
        <div>
          <div className="av-modal-title">Withdraw Funds</div>
          <div className="av-modal-sub">Demo mode · instant</div>
        </div>
        {step === 0 && <button className="av-modal-close" onClick={onClose}>✕</button>}
      </div>
      <div className="av-modal-body">
        {busy ? (
          <div className="av-processing">
            <div className="av-proc-icon blue">↻</div>
            <div className="av-proc-title">Processing…</div>
            <div className="av-blink" style={{ color: "var(--blue)" }}>Please wait</div>
          </div>
        ) : step === 0 ? (
          <>
            {err && <div className="av-alert err">{err}</div>}
            <div className="av-fg">
              <label className="av-label">Amount (KES)</label>
              <input className="av-input" type="number" placeholder="Min KES 100"
                value={amount} onChange={e => setAmount(e.target.value)} />
              <div className="av-presets">
                {[100, 500, 1000, 2000].map(v => (
                  <button key={v} className="av-preset" onClick={() => setAmount(String(v))} disabled={v > balance}>{v}</button>
                ))}
              </div>
              <div className="av-fhint">Available: <strong style={{ color: "var(--green)" }}>{fKES(balance)}</strong></div>
            </div>
            <button className="av-btn-main" onClick={next}>Review Withdrawal</button>
          </>
        ) : (
          <>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-md)", borderRadius: 11, padding: 15, marginBottom: 14 }}>
              {[["Amount", fKES(amt)], ["You receive", fKES(amt)]].map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingTop: i > 0 ? 9 : 0, borderTop: i > 0 ? "1px solid var(--border)" : "none", marginBottom: i === 0 ? 9 : 0 }}>
                  <span style={{ color: "var(--text2)" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: i > 0 ? "var(--green)" : "var(--text)" }}>{v}</span>
                </div>
              ))}
            </div>
            <button className="av-btn-mpesa" style={{ background: "var(--amber)", color: "#1a0800", marginBottom: 9 }} onClick={confirm}>
              ✓ Confirm Withdrawal
            </button>
            <button className="av-btn-ghost" style={{ width: "100%", textAlign: "center" }} onClick={() => setStep(0)}>Edit</button>
          </>
        )}
      </div>
    </Modal>
  );
}

function Locked({ title, sub, openLogin, openRegister }) {
  return (
    <div className="av-locked">
      <div className="av-locked-icon">🔒</div>
      <div className="av-locked-title">{title}</div>
      <div className="av-locked-sub">{sub}</div>
      <div className="av-locked-btns">
        <button className="av-btn-ghost" onClick={openLogin}>Sign In</button>
        <button className="av-btn-primary" onClick={openRegister}>Register Free</button>
      </div>
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────
function Chat() {
  const [msgs, setMsgs] = useState(
    BOT_CHATS.slice(0, 4).map((m, i) => ({ ...m, id: i, name: BOT_NAMES[i % BOT_NAMES.length] }))
  );
  const [input, setInput] = useState("");
  const feedRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      const m = BOT_CHATS[Math.floor(Math.random() * BOT_CHATS.length)];
      const n = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      setMsgs(p => [...p.slice(-20), { ...m, id: Date.now(), name: n }]);
    }, 3200 + Math.random() * 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p.slice(-20), { name: "You", color: "blue", text: input, id: Date.now() }]);
    setInput("");
  };

  return (
    <div className="av-rcard">
      <div className="av-rhead">
        <span className="av-rtitle">Live Chat</span>
        <div className="av-live"><div className="av-live-dot" />Live</div>
      </div>
      <div className="av-chat-feed" ref={feedRef}>
        {msgs.map(m => (
          <div key={m.id} className="av-chat-msg">
            <span className={`av-chat-name ${m.color || ""}`}>{m.name}:</span>
            <span className="av-chat-text"> {m.text}</span>
          </div>
        ))}
      </div>
      <div className="av-chat-input-row">
        <input className="av-chat-input" placeholder="Say something…"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()} />
        <button className="av-chat-send" onClick={send}>➤</button>
      </div>
    </div>
  );
}

// ─── SINGLE BET PANEL ─────────────────────────────────────────────────────
function SinglePanel({ gs, user, hasBet, cashedOut, betAmt, setBetAmt,
  autoCOOn, setAutoCOOn, autoCO, setAutoCO, onBet, onCashout, onLogin, md, lastBetRef, compact }) {

  const adjust = d => {
    const cur = parseFloat(betAmt) || 0;
    setBetAmt(String(Math.max(10, Math.round((cur + d) * 100) / 100)));
  };

  const canBet = gs === "waiting" && !hasBet;
  const canCashout = gs === "flying" && hasBet && !cashedOut;

  return (
    <div className="av-betpanel" style={compact ? { padding: "8px 10px 12px" } : {}}>
      <div className="av-stepper">
        <button className="av-step-btn" onClick={() => adjust(-10)} disabled={hasBet || gs === "flying"}>−</button>
        <input className="av-step-val" type="number" value={betAmt}
          onChange={e => setBetAmt(e.target.value)} disabled={hasBet || gs === "flying"}
          style={compact ? { fontSize: 14 } : {}} />
        <button className="av-step-btn" onClick={() => adjust(10)} disabled={hasBet || gs === "flying"}>+</button>
      </div>
      <div className="av-qgrid">
        {[100, 200, 500, 1000].map(v => (
          <button key={v} className="av-qbtn" onClick={() => setBetAmt(String(v))}
            disabled={hasBet || gs === "flying"}>
            {v >= 1000 ? `${v / 1000}k` : v}
          </button>
        ))}
      </div>
      <button className="av-repeat" disabled={!lastBetRef.current || hasBet || gs === "flying"}
        onClick={() => lastBetRef.current && setBetAmt(String(lastBetRef.current))}>
        ↺ Repeat {lastBetRef.current ? fKES(lastBetRef.current) : "last"}
      </button>

      {!user ? (
        <button className="av-cta signin" onClick={onLogin}>🔒 Sign In to Play</button>
      ) : canCashout ? (
        <button className="av-cta cashout" onClick={onCashout}>💰 Cash Out ×{md}</button>
      ) : gs === "waiting" ? (
        <button className="av-cta place" onClick={onBet} disabled={hasBet}>
          {hasBet ? "✓ Bet Placed — Waiting…" : `Place Bet · ${fKES(parseFloat(betAmt) || 0)}`}
        </button>
      ) : (
        <button className="av-cta idle" disabled>
          {hasBet && cashedOut ? `✓ Cashed out ×${md}` : gs === "flying" ? "Waiting for next round…" : "Round ended"}
        </button>
      )}

      {!compact && gs === "waiting" && !hasBet && (
        <div className="av-space-hint"><span className="av-kbd">SPACE</span> to place bet</div>
      )}
      {!compact && canCashout && (
        <div className="av-space-hint"><span className="av-kbd">SPACE</span> to cash out</div>
      )}

      <div className="av-auto-row">
        <span className="av-auto-label">Auto Cash Out</span>
        <div className="av-toggle-wrap">
          <label className="av-toggle">
            <input type="checkbox" checked={autoCOOn} onChange={e => setAutoCOOn(e.target.checked)} />
            <div className="av-toggle-track" />
            <div className="av-toggle-thumb" />
          </label>
          {autoCOOn && (
            <input className="av-aco" type="number" value={autoCO} min="1.1" step="0.1"
              onChange={e => setAutoCO(e.target.value)} />
          )}
        </div>
      </div>
    </div>
  );
}

function BetPanel(props) {
  const [dual, setDual] = useState(false);
  const { gs, user, hasBet, cashedOut, betAmt, setBetAmt, autoCOOn, setAutoCOOn, autoCO, setAutoCO,
    onBet, onCashout, onLogin, md, lastBetRef,
    hasBet2, cashedOut2, betAmt2, setBetAmt2, autoCOOn2, setAutoCOOn2, autoCO2, setAutoCO2,
    onBet2, onCashout2, lastBet2Ref } = props;

  return (
    <>
      <div className="av-betpanel-header">
        <span className="av-betpanel-title">Bet Controls</span>
        <div className="av-dual-row">
          <span className="av-dual-label">2 Bets</span>
          <label className="av-toggle">
            <input type="checkbox" checked={dual} onChange={e => setDual(e.target.checked)} />
            <div className="av-toggle-track" />
            <div className="av-toggle-thumb" />
          </label>
        </div>
      </div>
      {!dual ? (
        <SinglePanel gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
          betAmt={betAmt} setBetAmt={setBetAmt} autoCOOn={autoCOOn} setAutoCOOn={setAutoCOOn}
          autoCO={autoCO} setAutoCO={setAutoCO} onBet={onBet} onCashout={onCashout}
          onLogin={onLogin} md={md} lastBetRef={lastBetRef} />
      ) : (
        <div className="av-dual-panels">
          <div className="av-dual-panel">
            <div className="av-dual-panel-label"><div className="dot" /> Bet 1</div>
            <SinglePanel compact gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
              betAmt={betAmt} setBetAmt={setBetAmt} autoCOOn={autoCOOn} setAutoCOOn={setAutoCOOn}
              autoCO={autoCO} setAutoCO={setAutoCO} onBet={onBet} onCashout={onCashout}
              onLogin={onLogin} md={md} lastBetRef={lastBetRef} />
          </div>
          <div className="av-dual-panel">
            <div className="av-dual-panel-label"><div className="dot dot2" /> Bet 2</div>
            <SinglePanel compact gs={gs} user={user} hasBet={hasBet2} cashedOut={cashedOut2}
              betAmt={betAmt2} setBetAmt={setBetAmt2} autoCOOn={autoCOOn2} setAutoCOOn={setAutoCOOn2}
              autoCO={autoCO2} setAutoCO={setAutoCO2} onBet={onBet2} onCashout={onCashout2}
              onLogin={onLogin} md={md} lastBetRef={lastBet2Ref} />
          </div>
        </div>
      )}
    </>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth ──
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [ready, setReady] = useState(false);

  // ── UI ──
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("game");
  const [ddOpen, setDdOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [winBanner, setWinBanner] = useState(null);
  const [floats, setFloats] = useState([]);
  const [bigWin, setBigWin] = useState(null);
  const [walletMode, setWalletMode] = useState("deposit");
  const [txnFilter, setTxnFilter] = useState("all");
  const [txns, setTxns] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // ── Game ──
  const [gs, setGs] = useState("waiting");       // waiting | flying | crashed
  const [mult, setMult] = useState(1.00);
  const [cd, setCd] = useState(5);
  const [crashes, setCrashes] = useState([2.14, 1.32, 8.45, 1.01, 3.78, 1.55, 11.2, 2.9]);
  const [players, setPlayers] = useState([]);
  const [pts, setPts] = useState([]);
  const [planeCrashed, setPlaneCrashed] = useState(false);
  const [roundId, setRoundId] = useState(1);
  const [pfHash, setPfHash] = useState("a3f9c2…e84b1d");

  // ── Bet 1 ──
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [betAmt, setBetAmt] = useState("100");
  const [autoCOOn, setAutoCOOn] = useState(false);
  const [autoCO, setAutoCO] = useState("2.00");
  const lastBetRef = useRef(null);

  // ── Bet 2 ──
  const [hasBet2, setHasBet2] = useState(false);
  const [cashedOut2, setCashedOut2] = useState(false);
  const [betAmt2, setBetAmt2] = useState("100");
  const [autoCOOn2, setAutoCOOn2] = useState(false);
  const [autoCO2, setAutoCO2] = useState("2.00");
  const lastBet2Ref = useRef(null);

  // ── Game engine refs (stable across renders) ──
  const gsRef = useRef("waiting");
  const multRef = useRef(1);
  const crashPtRef = useRef(1);
  const flyStartRef = useRef(0);
  const flyTimer = useRef(null);
  const cdTimer = useRef(null);
  const tickRef = useRef(0);
  const balRef = useRef(0);
  const userRef = useRef(null);
  const betAmtStr = useRef("100");
  const betAmt2Str = useRef("100");
  const betAmtPlaced = useRef(null);    // amount placed on current round, panel 1
  const betAmtPlaced2 = useRef(null);   // amount placed on current round, panel 2
  const cashedRef = useRef(false);
  const cashed2Ref = useRef(false);
  const autoCORef = useRef({ on: false, val: "2.00" });
  const autoCO2Ref = useRef({ on: false, val: "2.00" });
  const seenBigWins = useRef(new Set());

  // Keep refs in sync
  useEffect(() => { balRef.current = balance; }, [balance]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { betAmtStr.current = betAmt; }, [betAmt]);
  useEffect(() => { betAmt2Str.current = betAmt2; }, [betAmt2]);
  useEffect(() => { autoCORef.current = { on: autoCOOn, val: autoCO }; }, [autoCOOn, autoCO]);
  useEffect(() => { autoCO2Ref.current = { on: autoCOOn2, val: autoCO2 }; }, [autoCOOn2, autoCO2]);

  // ── Helpers ──
  const showToast = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const addTxn = useCallback((type, label, amount) => {
    setTxns(p => [{ id: randId(), type, label, amount, time: new Date() }, ...p.slice(0, 99)]);
  }, []);

  const saveBalance = useCallback((nb) => {
    const db = JSON.parse(localStorage.getItem("av_users") || "{}");
    if (userRef.current?.phone && db[userRef.current.phone]) {
      db[userRef.current.phone].balance = nb;
      localStorage.setItem("av_users", JSON.stringify(db));
    }
  }, []);

  const updateBalance = useCallback((nb) => {
    const rounded = Math.round(nb * 100) / 100;
    setBalance(rounded);
    balRef.current = rounded;
    saveBalance(rounded);
  }, [saveBalance]);

  // ── Cash out (called inside interval — uses refs only) ──
  const doCashoutCore = useCallback((panel, m) => {
    if (panel === 1) {
      if (!betAmtPlaced.current || cashedRef.current) return;
      cashedRef.current = true;
      setCashedOut(true);
      const bet = parseFloat(betAmtPlaced.current);
      const payout = Math.round(bet * m * 100) / 100;
      const profit = Math.round((payout - bet) * 100) / 100;
      const nb = Math.round((balRef.current + payout) * 100) / 100;
      balRef.current = nb;
      updateBalance(nb);
      addTxn("win", `Win ×${m.toFixed(2)}`, profit);
      setWinBanner(`×${m.toFixed(2)} — Won ${fKES(payout)}`);
      setTimeout(() => setWinBanner(null), 3200);
      showToast(`Cashed out ×${m.toFixed(2)} — Won ${fKES(payout)}`);
    } else {
      if (!betAmtPlaced2.current || cashed2Ref.current) return;
      cashed2Ref.current = true;
      setCashedOut2(true);
      const bet = parseFloat(betAmtPlaced2.current);
      const payout = Math.round(bet * m * 100) / 100;
      const profit = Math.round((payout - bet) * 100) / 100;
      const nb = Math.round((balRef.current + payout) * 100) / 100;
      balRef.current = nb;
      updateBalance(nb);
      addTxn("win", `Bet 2 Win ×${m.toFixed(2)}`, profit);
      showToast(`Bet 2 cashed ×${m.toFixed(2)} — Won ${fKES(payout)}`);
    }
  }, [updateBalance, addTxn, showToast]);

  // ── Game loop ──
  // We use a single stable ref to hold the "start flight" logic
  // to avoid stale closures in the countdown interval.
  const startFlightRef = useRef(null);
  const triggerCrashRef = useRef(null);

  const startCountdown = useCallback(() => {
    // Clear any running timers
    if (flyTimer.current) { clearInterval(flyTimer.current); flyTimer.current = null; }
    if (cdTimer.current) { clearInterval(cdTimer.current); cdTimer.current = null; }

    gsRef.current = "waiting";
    setGs("waiting");
    setMult(1); multRef.current = 1;
    setPts([]); setPlaneCrashed(false);
    setCashedOut(false); cashedRef.current = false;
    setCashedOut2(false); cashed2Ref.current = false;
    setHasBet(false); betAmtPlaced.current = null;
    setHasBet2(false); betAmtPlaced2.current = null;
    seenBigWins.current.clear();

    const cp = generateCrash();
    crashPtRef.current = cp;
    const h = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setPfHash(h.slice(0, 6) + "…" + h.slice(-6));
    setRoundId(p => p + 1);

    // Generate bots
    const botCount = 4 + Math.floor(Math.random() * 8);
    const bots = Array.from({ length: botCount }, (_, i) => ({
      id: `bot_${i}_${Date.now()}`,
      name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      bet: [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)],
      cashMult: +(1.15 + Math.random() * (cp - 1.15) * 0.88).toFixed(2),
      cashed: false,
    }));
    setPlayers(bots);

    let c = 5;
    setCd(c);
    cdTimer.current = setInterval(() => {
      c -= 0.1;
      setCd(Math.max(0, c));
      if (c <= 0) {
        clearInterval(cdTimer.current);
        cdTimer.current = null;
        if (startFlightRef.current) startFlightRef.current(cp, bots);
      }
    }, 100);
  }, []); // No deps — uses only refs

  // Define startFlight and store in ref
  useEffect(() => {
    startFlightRef.current = (crashPoint, botPlayers) => {
      gsRef.current = "flying";
      setGs("flying");
      flyStartRef.current = performance.now();
      tickRef.current = 0;
      setPts([{ pct: 0, mult: 1 }]);

      const MAX_TICKS = 180;
      const cashedBots = new Set();

      flyTimer.current = setInterval(() => {
        const elapsed = (performance.now() - flyStartRef.current) / 1000;
        // Match server formula: e^(elapsed * 0.35)
        const m = Math.min(+(Math.pow(Math.E, elapsed * 0.35).toFixed(2)), 9999.99);
        multRef.current = m;
        setMult(m);

        tickRef.current += 1;
        const pct = Math.min(tickRef.current / MAX_TICKS, 1);
        setPts(prev => {
          const next = [...prev, { pct, mult: m }];
          return next.length > MAX_TICKS
            ? next.slice(-MAX_TICKS).map((pt, i, a) => ({ pct: i / (a.length - 1), mult: pt.mult }))
            : next;
        });

        // Bot cashouts
        setPlayers(prev => prev.map(p => {
          if (!p.cashed && m >= p.cashMult && !cashedBots.has(p.id)) {
            cashedBots.add(p.id);
            if (p.cashMult >= 10 && !seenBigWins.current.has(p.id)) {
              seenBigWins.current.add(p.id);
              setBigWin({ player: p.name, mult: p.cashMult });
              setTimeout(() => setBigWin(null), 2600);
            }
            return { ...p, cashed: true };
          }
          return p;
        }));

        // Auto cashout panel 1
        if (betAmtPlaced.current && !cashedRef.current) {
          const ac = autoCORef.current;
          if (ac.on) {
            const t = parseFloat(ac.val);
            if (!isNaN(t) && m >= t) doCashoutCore(1, m);
          }
        }
        // Auto cashout panel 2
        if (betAmtPlaced2.current && !cashed2Ref.current) {
          const ac = autoCO2Ref.current;
          if (ac.on) {
            const t = parseFloat(ac.val);
            if (!isNaN(t) && m >= t) doCashoutCore(2, m);
          }
        }

        // Check crash
        if (m >= crashPoint) {
          clearInterval(flyTimer.current);
          flyTimer.current = null;
          if (triggerCrashRef.current) triggerCrashRef.current(m);
        }
      }, 80);
    };
  }, [doCashoutCore]);

  // Define triggerCrash and store in ref
  useEffect(() => {
    triggerCrashRef.current = (cm) => {
      gsRef.current = "crashed";
      setGs("crashed");
      setPlaneCrashed(true);
      setCrashes(p => [cm, ...p].slice(0, 14));

      // Penalise uncashed bets
      if (betAmtPlaced.current && !cashedRef.current) {
        const lost = parseFloat(betAmtPlaced.current);
        addTxn("loss", `Lost ×${cm.toFixed(2)} crash`, -lost);
        showToast(`Crashed ×${cm.toFixed(2)} — Lost ${fKES(lost)}`, "err");
      }
      if (betAmtPlaced2.current && !cashed2Ref.current) {
        const lost = parseFloat(betAmtPlaced2.current);
        addTxn("loss", `Bet 2 crashed ×${cm.toFixed(2)}`, -lost);
      }

      betAmtPlaced.current = null; setHasBet(false);
      betAmtPlaced2.current = null; setHasBet2(false);

      const msg = FLOAT_WINS[Math.floor(Math.random() * FLOAT_WINS.length)];
      const id = Date.now();
      setFloats(p => [...p.slice(-3), { id, msg }]);
      setTimeout(() => setFloats(p => p.filter(n => n.id !== id)), 4500);

      setTimeout(startCountdown, 4000);
    };
  }, [addTxn, showToast, startCountdown]);

  // ── Boot ──
  useEffect(() => {
    const sess = localStorage.getItem("av_session");
    if (sess) {
      try {
        const s = JSON.parse(sess);
        const db = JSON.parse(localStorage.getItem("av_users") || "{}");
        const u = db[s.phone];
        const bal = u ? (u.balance ?? 1000) : 1000;
        const user = { ...s, balance: bal };
        setUser(user); setBalance(bal);
        userRef.current = user; balRef.current = bal;
      } catch {}
    }
    setTimeout(() => setReady(true), 1000);
  }, []);

  useEffect(() => {
    const t = setTimeout(startCountdown, 900);
    return () => {
      clearTimeout(t);
      if (flyTimer.current) clearInterval(flyTimer.current);
      if (cdTimer.current) clearInterval(cdTimer.current);
    };
  }, [startCountdown]);

  // ── Bet actions ──
  const handleBet = useCallback(() => {
    if (!userRef.current) { setModal("login"); return; }
    const a = parseFloat(betAmtStr.current);
    if (isNaN(a) || a < 10) { showToast("Minimum bet is KES 10", "err"); return; }
    if (a > balRef.current) { showToast("Insufficient balance", "err"); return; }
    if (gsRef.current !== "waiting") { showToast("Wait for next round to bet", "err"); return; }
    if (betAmtPlaced.current) { showToast("Bet already placed", "err"); return; }
    const nb = Math.round((balRef.current - a) * 100) / 100;
    balRef.current = nb;
    updateBalance(nb);
    betAmtPlaced.current = String(a);
    lastBetRef.current = a;
    setHasBet(true);
    addTxn("bet", "Bet placed", -a);
    showToast(`Bet placed — ${fKES(a)}`);
  }, [updateBalance, addTxn, showToast]);

  const handleBet2 = useCallback(() => {
    if (!userRef.current) { setModal("login"); return; }
    const a = parseFloat(betAmt2Str.current);
    if (isNaN(a) || a < 10) { showToast("Minimum bet is KES 10", "err"); return; }
    if (a > balRef.current) { showToast("Insufficient balance", "err"); return; }
    if (gsRef.current !== "waiting") { showToast("Wait for next round to bet", "err"); return; }
    if (betAmtPlaced2.current) { showToast("Bet 2 already placed", "err"); return; }
    const nb = Math.round((balRef.current - a) * 100) / 100;
    balRef.current = nb;
    updateBalance(nb);
    betAmtPlaced2.current = String(a);
    lastBet2Ref.current = a;
    setHasBet2(true);
    addTxn("bet", "Bet 2 placed", -a);
    showToast(`Bet 2 placed — ${fKES(a)}`);
  }, [updateBalance, addTxn, showToast]);

  const handleCashout = useCallback(() => {
    if (!betAmtPlaced.current || cashedRef.current || gsRef.current !== "flying") return;
    doCashoutCore(1, multRef.current);
  }, [doCashoutCore]);

  const handleCashout2 = useCallback(() => {
    if (!betAmtPlaced2.current || cashed2Ref.current || gsRef.current !== "flying") return;
    doCashoutCore(2, multRef.current);
  }, [doCashoutCore]);

  // ── Spacebar ──
  useEffect(() => {
    const onKey = e => {
      if (e.code !== "Space") return;
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
      if (gsRef.current === "waiting" && !betAmtPlaced.current) { handleBet(); return; }
      if (gsRef.current === "flying" && betAmtPlaced.current && !cashedRef.current) handleCashout();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleBet, handleCashout]);

  // ── Auth handlers ──
  const handleLogin = useCallback((u) => {
    setUser(u); updateBalance(u.balance);
    userRef.current = u;
    showToast(`Welcome, ${u.name.split(" ")[0]}!`);
  }, [updateBalance, showToast]);

  const handleLogout = () => {
    localStorage.removeItem("av_session");
    setUser(null); setBalance(0); userRef.current = null; balRef.current = 0;
    betAmtPlaced.current = null; setHasBet(false);
    betAmtPlaced2.current = null; setHasBet2(false);
    setDdOpen(false);
    showToast("Signed out");
  };

  const handleDeposit = amt => {
    const nb = Math.round((balRef.current + amt) * 100) / 100;
    updateBalance(nb);
    addTxn("dep", "M-Pesa Deposit", amt);
    showToast(`${fKES(amt)} deposited!`);
  };

  const handleWithdraw = amt => {
    const nb = Math.round((balRef.current - amt) * 100) / 100;
    updateBalance(nb);
    addTxn("wd", "M-Pesa Withdrawal", -amt);
    showToast(`${fKES(amt)} withdrawn`);
  };

  // ── Leaderboard ──
  useEffect(() => {
    if (tab === "leaderboard" && leaderboard.length === 0) {
      setLeaderboard([
        { name: "WanjiM***", total: 42800, bets: 234, best: 15.4 },
        { name: "KipC***",   total: 38200, bets: 198, best: 22.1 },
        { name: "Amina***",  total: 29100, bets: 312, best: 8.7  },
        { name: "OmonB***",  total: 21500, bets: 156, best: 11.3 },
        { name: "JohnK***",  total: 18900, bets: 287, best: 6.4  },
        { name: "FatumA***", total: 14200, bets: 89,  best: 18.8 },
        { name: "MwanM***",  total: 11800, bets: 201, best: 5.2  },
        { name: "NjeriW***", total: 9400,  bets: 145, best: 9.1  },
      ]);
    }
  }, [tab]);

  // ── Computed ──
  const md = mult.toFixed(2);
  const multClass = useMemo(() => {
    const m = parseFloat(md);
    if (m >= 10) return "hi10";
    if (m >= 5) return "hi5";
    return "";
  }, [md]);
  const maxMult = Math.max(1.5, mult * 1.18 + 0.4);
  const lastPt = pts.length > 0 ? pts[pts.length - 1] : null;

  const filteredTxns = useMemo(() => txns.filter(t => {
    if (txnFilter === "deposits") return t.type === "dep";
    if (txnFilter === "wins") return t.type === "win";
    if (txnFilter === "withdrawals") return t.type === "wd";
    return true;
  }), [txns, txnFilter]);

  const stats = useMemo(() => {
    const wins = txns.filter(t => t.type === "win");
    const losses = txns.filter(t => t.type === "loss");
    const totalWon = wins.reduce((s, t) => s + t.amount, 0);
    const totalLost = losses.reduce((s, t) => s + Math.abs(t.amount), 0);
    const bestWin = wins.length ? Math.max(...wins.map(t => t.amount)) : 0;
    return { totalWon, totalLost, totalBets: txns.length, bestWin };
  }, [txns]);

  const TABS = [
    { id: "game",        icon: "⚡", label: "Game"     },
    { id: "wallet",      icon: "💳", label: "Wallet"   },
    { id: "history",     icon: "📋", label: "History"  },
    { id: "leaderboard", icon: "🏆", label: "Leaders"  },
    { id: "stats",       icon: "📊", label: "Stats"    },
  ];

  const rankCls = i => ["gold", "silver", "bronze"][i] || "";
  const rankLabel = i => ["1st", "2nd", "3rd"][i] || `${i + 1}`;
  const fRound = id => `#${String(id).padStart(5, "0")}`;
  const histIcon = type => ({ dep: "↓", win: "★", wd: "↑", loss: "✕", bet: "◆" }[type] || "·");

  if (!ready) {
    return (
      <div className="av-splash">
        <div style={{ color: "var(--blue)", fontSize: 40 }}>⚡</div>
        <div className="av-splash-logo">Avi<em>Pesa</em></div>
        <div className="av-splash-spin" />
      </div>
    );
  }

  return (
    <div className="av-root" onClick={() => ddOpen && setDdOpen(false)}>
      {/* Toast */}
      {toast && (
        <div className={`av-toast ${toast.type}`}>
          {toast.type === "ok" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Float notifs */}
      <div className="av-float">
        {floats.map(n => <div key={n.id} className="av-fnotif">{n.msg}</div>)}
      </div>

      {/* Modals */}
      {modal === "login"    && <LoginModal    onClose={() => setModal(null)} onLogin={handleLogin} toReg={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onLogin={handleLogin} toLogin={() => setModal("login")} />}
      {modal === "deposit"  && <DepositModal  onClose={() => setModal(null)} onDeposit={handleDeposit} />}
      {modal === "withdraw" && <WithdrawModal onClose={() => setModal(null)} balance={balance} onWithdraw={handleWithdraw} />}

      {/* ── NAV ── */}
      <nav className="av-nav">
        <div className="av-nav-inner">
          <div className="av-logo" onClick={() => setTab("game")}>
            <div className="av-logo-mark">⚡</div>
            <div className="av-logo-text">Avi<em>Pesa</em></div>
          </div>
          <div className="av-nav-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`av-nav-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="av-nav-right">
            {user ? (
              <>
                <div className="av-bal">
                  <div className="av-bal-label">Balance</div>
                  <div className="av-bal-value"><AnimBal value={balance} /></div>
                </div>
                <button className="av-btn-dep" onClick={() => setModal("deposit")}>
                  ↓ <span className="av-dep-text">Deposit</span>
                </button>
                <div className="av-avatar-wrap" onClick={e => e.stopPropagation()}>
                  <button className="av-avatar" onClick={() => setDdOpen(o => !o)}>
                    {user.name[0].toUpperCase()}
                  </button>
                  {ddOpen && (
                    <div className="av-dropdown">
                      <div className="av-dd-head">
                        <div className="av-dd-name">{user.name}</div>
                        <div className="av-dd-phone">+{user.phone}</div>
                      </div>
                      {TABS.map(t => (
                        <button key={t.id} className="av-dd-item" onClick={() => { setTab(t.id); setDdOpen(false); }}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                      <div className="av-dd-sep" />
                      <button className="av-dd-item danger" onClick={handleLogout}>↪ Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="av-nav-auth">
                <button className="av-btn-ghost" onClick={() => setModal("login")}>Sign In</button>
                <button className="av-btn-primary" onClick={() => setModal("register")}>Register</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="av-mob-nav">
        {TABS.map(t => (
          <button key={t.id} className={`av-mob-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ GAME TAB ══════════════ */}
      {tab === "game" && (
        <div className="av-layout">
          <div>
            <div className="av-gcard">
              {/* Top bar */}
              <div className="av-topbar">
                <div className="av-live"><div className="av-live-dot" />LIVE</div>
                <div className={`av-state-badge ${gs}`}>
                  {gs === "waiting" ? `Next in ${Math.ceil(cd)}s` : gs === "crashed" ? "CRASHED" : "IN PLAY"}
                </div>
                <span className="av-round-badge">{fRound(roundId)}</span>
                <div className="av-topbar-div" />
                <div className="av-history-strip">
                  {crashes.map((v, i) => (
                    <span key={i} className={`av-cbadge ${cbCls(v)} ${i === 0 ? "new" : ""}`}>
                      {Number(v).toFixed(2)}×
                    </span>
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <div className="av-canvas">
                {/* Big win overlay */}
                {bigWin && (
                  <div className="av-bigwin">
                    <div className="av-bigwin-box">
                      <div style={{ fontSize: 36, marginBottom: 5 }}>🚀</div>
                      <div className="av-bigwin-mult">{Number(bigWin.mult).toFixed(2)}×</div>
                      <div className="av-bigwin-name">{bigWin.player}</div>
                      <div className="av-bigwin-label">Mega Win!</div>
                    </div>
                  </div>
                )}

                {/* Graph */}
                {(gs === "flying" || gs === "crashed") && pts.length >= 2 && (
                  <Graph mult={mult} pts={pts} crashed={planeCrashed} />
                )}

                {/* Countdown */}
                {gs === "waiting" && <Countdown cd={cd} />}

                {/* Plane */}
                {(gs === "flying" || gs === "crashed") && lastPt && (
                  <PlaneOverlay pct={lastPt.pct} mult={lastPt.mult} maxMult={maxMult} crashed={planeCrashed} />
                )}

                {/* Multiplier */}
                {gs !== "waiting" && (
                  <div className="av-mult-overlay">
                    <div className={`av-mult-num ${gs} ${gs === "flying" ? multClass : ""}`}>{md}×</div>
                    <div className={`av-mult-sub ${gs}`}>
                      {gs === "crashed" ? "CRASHED" : "FLYING"}
                    </div>
                  </div>
                )}

                {/* Win banner */}
                {winBanner && <div className="av-win-flash">{winBanner}</div>}
              </div>

              {/* Bet panel */}
              <BetPanel
                gs={gs} user={user}
                hasBet={hasBet} cashedOut={cashedOut} betAmt={betAmt} setBetAmt={setBetAmt}
                autoCOOn={autoCOOn} setAutoCOOn={setAutoCOOn} autoCO={autoCO} setAutoCO={setAutoCO}
                onBet={handleBet} onCashout={handleCashout} onLogin={() => setModal("login")}
                md={md} lastBetRef={lastBetRef}
                hasBet2={hasBet2} cashedOut2={cashedOut2} betAmt2={betAmt2} setBetAmt2={setBetAmt2}
                autoCOOn2={autoCOOn2} setAutoCOOn2={setAutoCOOn2} autoCO2={autoCO2} setAutoCO2={setAutoCO2}
                onBet2={handleBet2} onCashout2={handleCashout2} lastBet2Ref={lastBet2Ref}
              />

              {/* Provably fair */}
              <div className="av-pf">
                <span className="av-pf-label">Provably Fair</span>
                <span className="av-pf-hash">{pfHash}</span>
                <button className="av-pf-btn">🛡 Verified</button>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="av-rcol">
            {/* Players */}
            <div className="av-rcard">
              <div className="av-rhead">
                <span className="av-rtitle">Active Players</span>
                <span className="av-rcnt">{players.length + (hasBet ? 1 : 0) + (hasBet2 ? 1 : 0)}</span>
              </div>
              <div className="av-plist">
                {user && hasBet && (
                  <div className={`av-prow ${cashedOut ? "cashed" : ""}`}>
                    <div>
                      <div className="av-pname" style={{ color: "var(--blue)" }}>{user.name.split(" ")[0]} (You)</div>
                      <div className="av-pbet">KES {betAmt}</div>
                    </div>
                    {gs === "flying" && !cashedOut && <div className="av-pmult">{md}×</div>}
                    {cashedOut && <div className="av-pmult cashed">✓ cashed</div>}
                  </div>
                )}
                {players.map(p => (
                  <div key={p.id} className={`av-prow ${p.cashed ? "cashed" : ""}`}>
                    <div>
                      <div className="av-pname">{p.name}</div>
                      <div className="av-pbet">KES {p.bet}</div>
                    </div>
                    {gs === "flying" && !p.cashed && <div className="av-pmult">{md}×</div>}
                    {p.cashed && <div className="av-pmult cashed">✓ {p.cashMult}×</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick deposit */}
            <div className="av-rcard">
              <div className="av-rhead">
                <span className="av-rtitle">Quick Deposit</span>
                <span style={{ fontSize: 9, fontWeight: 700, background: "var(--mpesa)", color: "#fff", padding: "2px 8px", borderRadius: 5, letterSpacing: .8, boxShadow: "0 0 8px rgba(0,192,87,.3)" }}>M-PESA</span>
              </div>
              <div className="av-rpad">
                {user ? (
                  <>
                    <div className="av-quick-dep">
                      <div className="av-bal-block-label">Balance</div>
                      <div className="av-bal-block-amt"><AnimBal value={balance} /></div>
                      <div className="av-bal-block-sub">AviPesa Wallet</div>
                    </div>
                    <button className="av-btn-mpesa" onClick={() => setModal("deposit")}>
                      ↓ Deposit via M-Pesa
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>Sign in to deposit and play</div>
                    <button className="av-btn-mpesa" onClick={() => setModal("login")}>Sign In to Deposit</button>
                  </div>
                )}
              </div>
            </div>

            <Chat />
          </div>

          {/* Mobile players */}
          <div className="av-mob-players">
            <div className="av-rhead">
              <span className="av-rtitle">Active Players</span>
              <span className="av-rcnt">{players.length}</span>
            </div>
            <div className="av-plist">
              {players.slice(0, 6).map(p => (
                <div key={p.id} className={`av-prow ${p.cashed ? "cashed" : ""}`}>
                  <div>
                    <div className="av-pname">{p.name}</div>
                    <div className="av-pbet">KES {p.bet}</div>
                  </div>
                  {gs === "flying" && !p.cashed && <div className="av-pmult">{md}×</div>}
                  {p.cashed && <div className="av-pmult cashed">✓ {p.cashMult}×</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ WALLET TAB ══════════════ */}
      {tab === "wallet" && (
        <div className="av-page">
          <div className="av-pcard">
            {!user ? (
              <Locked title="Wallet Locked" sub="Sign in to view your balance, deposit or withdraw."
                openLogin={() => setModal("login")} openRegister={() => setModal("register")} />
            ) : (
              <>
                <div className="av-pcard-head">
                  <div className="av-pcard-title">My Wallet</div>
                  <div className="av-pcard-sub">Manage your AviPesa funds</div>
                </div>
                <div className="av-pcard-body">
                  <div className="av-big-bal">
                    <div className="av-bb-label">Available Balance</div>
                    <div className="av-bb-amt"><AnimBal value={balance} /></div>
                    <div className="av-bb-sub">Kenyan Shilling · AviPesa Account</div>
                  </div>
                  <div className="av-tab-row">
                    <button className={`av-tabbtn ${walletMode === "deposit" ? "dep" : ""}`} onClick={() => setWalletMode("deposit")}>
                      ↓ Deposit
                    </button>
                    <button className={`av-tabbtn ${walletMode === "withdraw" ? "wd" : ""}`} onClick={() => setWalletMode("withdraw")}>
                      ↑ Withdraw
                    </button>
                  </div>
                  {walletMode === "deposit" ? (
                    <button className="av-btn-mpesa" onClick={() => setModal("deposit")}>↓ Deposit via M-Pesa</button>
                  ) : (
                    <button className="av-btn-mpesa" style={{ background: "var(--amber)", color: "#1a0800" }} onClick={() => setModal("withdraw")}>
                      ↑ Withdraw Funds
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ HISTORY TAB ══════════════ */}
      {tab === "history" && (
        <div className="av-page wide">
          <div className="av-pcard">
            {!user ? (
              <Locked title="History Locked" sub="Sign in to view your transaction history."
                openLogin={() => setModal("login")} openRegister={() => setModal("register")} />
            ) : (
              <>
                <div className="av-pcard-head">
                  <div className="av-pcard-title">Transaction History</div>
                  <div className="av-pcard-sub">{filteredTxns.length} records</div>
                </div>
                <div className="av-filter-row">
                  {[{ k: "all", l: "All" }, { k: "deposits", l: "Deposits" }, { k: "wins", l: "Wins" }, { k: "withdrawals", l: "Withdrawals" }].map(f => (
                    <button key={f.k} className={`av-fpill ${txnFilter === f.k ? "on" : ""}`} onClick={() => setTxnFilter(f.k)}>{f.l}</button>
                  ))}
                </div>
                {filteredTxns.length === 0 && <div className="av-nodata">No transactions yet. Place a bet to get started!</div>}
                {filteredTxns.map(t => (
                  <div key={t.id} className="av-hist-row">
                    <div className="av-hist-left">
                      <div className={`av-hist-icon ${t.type}`}>{histIcon(t.type)}</div>
                      <div>
                        <div className="av-hist-desc">{t.label}</div>
                        <div className="av-hist-time">{fDate(t.time)} · {fTime(t.time)}</div>
                      </div>
                    </div>
                    <div className={`av-hist-amt ${t.amount >= 0 ? "pos" : "neg"}`}>
                      {t.amount >= 0 ? "+" : ""}{fKES(Math.abs(t.amount))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ LEADERBOARD ══════════════ */}
      {tab === "leaderboard" && (
        <div className="av-page wide">
          <div className="av-pcard">
            <div className="av-pcard-head">
              <div className="av-pcard-title">Leaderboard</div>
              <div className="av-pcard-sub">Top players this month</div>
            </div>
            {leaderboard.map((p, i) => (
              <div key={i} className="av-lb-row">
                <div className={`av-lb-rank ${rankCls(i)}`}>{rankLabel(i)}</div>
                <div className="av-lb-av">{p.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div className="av-lb-name">{p.name}</div>
                  <div className="av-lb-sub">{p.bets} bets · Best ×{Number(p.best).toFixed(2)}</div>
                </div>
                <div className="av-lb-amt">{fKES(p.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ STATS TAB ══════════════ */}
      {tab === "stats" && (
        <div className="av-page">
          <div className="av-pcard">
            {!user ? (
              <Locked title="Stats Locked" sub="Sign in to see your performance statistics."
                openLogin={() => setModal("login")} openRegister={() => setModal("register")} />
            ) : (
              <>
                <div className="av-pcard-head">
                  <div className="av-pcard-title">My Stats</div>
                  <div className="av-pcard-sub">Your performance overview</div>
                </div>
                <div className="av-pcard-body">
                  <div className="av-stats-grid">
                    {[
                      { icon: "◆", val: stats.totalBets, label: "Total Bets", cls: "amber" },
                      { icon: "↑", val: fKES(stats.totalWon), label: "Total Won", cls: "green" },
                      { icon: "↓", val: fKES(stats.totalLost), label: "Total Lost", cls: "red" },
                      { icon: "★", val: stats.bestWin > 0 ? fKES(stats.bestWin) : "—", label: "Best Win", cls: "amber" },
                      { icon: "⊕", val: fKES(balance), label: "Balance", cls: "green" },
                      { icon: "%", val: fKES(stats.totalWon - stats.totalLost), label: "Net Profit", cls: (stats.totalWon - stats.totalLost) >= 0 ? "green" : "red" },
                    ].map((s, i) => (
                      <div key={i} className="av-stat-card">
                        <div className="av-stat-icon">{s.icon}</div>
                        <div className={`av-stat-val ${s.cls}`}>{s.val}</div>
                        <div className="av-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="av-acct">
                    <div className="av-acct-section-label">Account Details</div>
                    {[
                      { k: "Name",    v: user.name,          cls: ""       },
                      { k: "Phone",   v: `+${user.phone}`,   cls: "mono"   },
                      { k: "Balance", v: <AnimBal value={balance} />, cls: "green" },
                    ].map(row => (
                      <div key={row.k} className="av-acct-row">
                        <span className="av-acct-key">{row.k}</span>
                        <span className={`av-acct-val ${row.cls}`}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}