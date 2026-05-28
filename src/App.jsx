import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

(() => {
  if (document.getElementById("av-fonts")) return;
  const l = document.createElement("link");
  l.id = "av-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&family=Sora:wght@700;800&display=swap";
  document.head.appendChild(l);
})();

const API = "https://YOUR-RAILWAY-URL.up.railway.app/api";
const SOCKET_URL = "https://YOUR-RAILWAY-URL.up.railway.app";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#070e1a;--s:#0d1626;--card:#111f33;--card2:#162540;
  --b:rgba(255,255,255,0.06);--b2:rgba(255,255,255,0.1);
  --gold:#f6c347;--gold2:#d4931a;--glow:rgba(246,195,71,0.22);
  --red:#f43f5e;--green:#0ecf9e;--mpesa:#00a651;
  --t:#dde8f5;--t2:#7a90aa;--t3:#3a4f68;
  --blue:#3b82f6;--purple:#a855f7;
}
html,body{width:100%;overflow-x:hidden;background:var(--bg);color:var(--t);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:10px}
.root{min-height:100vh;width:100%;overflow-x:hidden;background:var(--bg);background-image:radial-gradient(ellipse 80% 35% at 50% 0%,rgba(246,195,71,0.055) 0%,transparent 65%),radial-gradient(ellipse 35% 30% at 90% 90%,rgba(14,207,158,0.04) 0%,transparent 55%);padding-bottom:64px;}
.root.light{--bg:#f0f4f8;--s:#e2e8f0;--card:#fff;--card2:#f8fafc;--b:rgba(0,0,0,0.07);--b2:rgba(0,0,0,0.12);--t:#1a2744;--t2:#64748b;--t3:#94a3b8;background:#f0f4f8;background-image:radial-gradient(ellipse 80% 35% at 50% 0%,rgba(246,195,71,0.08) 0%,transparent 65%);}
.nav{position:sticky;top:0;z-index:400;height:52px;background:rgba(7,14,26,0.96);backdrop-filter:blur(20px);border-bottom:1px solid var(--b);width:100%;}
.root.light .nav{background:rgba(240,244,248,0.96)}
.nav-i{width:100%;max-width:1280px;margin:0 auto;height:100%;padding:0 14px;display:flex;align-items:center;gap:8px;}
.logo{display:flex;align-items:center;gap:7px;cursor:pointer;user-select:none;flex-shrink:0;}
.logo-m{width:28px;height:28px;border-radius:7px;flex-shrink:0;background:linear-gradient(135deg,var(--gold),var(--gold2));display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 0 16px var(--glow);}
.logo-t{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.3px;white-space:nowrap;}
.logo-t span{color:var(--gold)}
.ntabs{display:none;gap:2px;margin:0 auto;background:var(--s);border:1px solid var(--b);border-radius:9px;padding:3px;}
.ntab{padding:5px 13px;border-radius:6px;border:none;background:transparent;color:var(--t2);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:5px;white-space:nowrap;}
.ntab:hover{color:var(--t)}
.ntab.on{background:var(--card2);color:var(--gold)}
.nav-r{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:auto}
.bal-pill{display:flex;align-items:center;gap:6px;background:var(--s);border:1px solid var(--b);border-radius:8px;padding:5px 10px;}
.bal-lbl{font-size:9px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--t3)}
.bal-v{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--green)}
.dep-btn{display:flex;align-items:center;gap:5px;padding:7px 10px;border-radius:8px;border:none;background:var(--mpesa);color:#fff;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.18s;white-space:nowrap;flex-shrink:0;}
.dep-btn:hover{background:#00bd5e;box-shadow:0 0 16px rgba(0,166,81,0.3)}
.dep-txt{display:none}
.theme-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--b2);background:var(--s);color:var(--t2);font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s;flex-shrink:0;}
.theme-btn:hover{border-color:var(--gold);color:var(--gold)}
.av-wrap{position:relative;flex-shrink:0}
.av-btn{width:32px;height:32px;border-radius:8px;flex-shrink:0;background:linear-gradient(135deg,var(--gold),var(--gold2));border:2px solid rgba(246,195,71,0.18);display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:12px;font-weight:800;color:#000;cursor:pointer;transition:all 0.18s;}
.av-btn:hover{border-color:var(--gold)}
.dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:190px;z-index:500;background:var(--card2);border:1px solid var(--b2);border-radius:12px;padding:5px;box-shadow:0 20px 60px rgba(0,0,0,0.65);animation:fdDown 0.16s ease;}
@keyframes fdDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.dd-top{padding:9px 10px 10px;border-bottom:1px solid var(--b);margin-bottom:4px}
.dd-name{font-size:13px;font-weight:700}
.dd-email{font-size:10px;color:var(--t2);font-family:'JetBrains Mono',monospace;margin-top:1px;word-break:break-all}
.dd-item{display:flex;align-items:center;gap:7px;width:100%;padding:8px 10px;border-radius:7px;border:none;background:transparent;color:var(--t);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;text-align:left;transition:background 0.12s;}
.dd-item:hover{background:rgba(255,255,255,0.04)}
.dd-item.red{color:var(--red)}
.dd-sep{height:1px;background:var(--b);margin:4px 0}
.nav-auth{display:flex;gap:5px;flex-shrink:0}
.btn-ghost{padding:6px 11px;border-radius:8px;border:1px solid var(--b2);background:transparent;color:var(--t);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s;white-space:nowrap;}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.btn-gold{padding:6px 11px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.18s;white-space:nowrap;}
.btn-gold:hover{box-shadow:0 0 16px var(--glow)}
.mob-tabs{display:flex;background:rgba(7,14,26,0.97);border-top:1px solid var(--b);position:fixed;bottom:0;left:0;right:0;z-index:400;width:100%;}
.root.light .mob-tabs{background:rgba(240,244,248,0.97)}
.mtab{flex:1;padding:10px 0 8px;border:none;background:transparent;color:var(--t2);font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all 0.15s;min-height:52px;}
.mtab .ico{font-size:18px;line-height:1}
.mtab.on{color:var(--gold)}
.overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center;padding:0;animation:ovIn 0.18s ease;}
@keyframes ovIn{from{opacity:0}to{opacity:1}}
.modal{width:100%;max-width:480px;background:var(--card2);border:1px solid var(--b2);border-radius:20px 20px 0 0;max-height:92vh;overflow-y:auto;box-shadow:0 -20px 60px rgba(0,0,0,0.6);animation:mSlide 0.28s cubic-bezier(0.32,0.72,0,1);}
@keyframes mSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
.mhead{padding:16px 18px 14px;border-bottom:1px solid var(--b);display:flex;align-items:flex-start;justify-content:space-between;position:sticky;top:0;background:var(--card2);z-index:1;}
.modal-drag{width:36px;height:4px;border-radius:2px;background:var(--b2);margin:0 auto 14px;}
.mtitle{font-family:'Sora',sans-serif;font-size:17px;font-weight:800}
.msub{font-size:12px;color:var(--t2);margin-top:2px}
.mclose{width:30px;height:30px;border-radius:7px;border:1px solid var(--b2);background:var(--s);color:var(--t2);font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:10px;}
.mclose:hover{color:var(--t);border-color:var(--t)}
.mbody{padding:16px 18px 28px}
.fg{margin-bottom:13px}
.flbl{display:block;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--t2);margin-bottom:5px;}
.finput{width:100%;background:var(--s);border:1px solid var(--b2);border-radius:9px;padding:11px 13px;color:var(--t);font-family:'DM Sans',sans-serif;font-size:15px;outline:none;transition:border-color 0.18s,box-shadow 0.18s;-webkit-appearance:none;}
.finput:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(246,195,71,0.07)}
.finput.err-field{border-color:var(--red);box-shadow:0 0 0 3px rgba(244,63,94,0.07)}
.finput.ok-field{border-color:var(--green)}
.finput::placeholder{color:var(--t3)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fhint{font-size:11px;color:var(--t2);margin-top:5px;line-height:1.55}
.ferr-inline{font-size:10px;color:var(--red);margin-top:4px;display:flex;align-items:center;gap:4px}
.flink{color:var(--gold);font-size:12px;font-weight:700;background:none;border:none;cursor:pointer;padding:0}
.flink:hover{text-decoration:underline}
.ffoot{text-align:center;margin-top:13px;font-size:12px;color:var(--t2)}
.ferr{background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.22);border-radius:8px;padding:9px 12px;font-size:12px;color:var(--red);margin-bottom:13px;}
.fok{background:rgba(14,207,158,0.08);border:1px solid rgba(14,207,158,0.2);border-radius:8px;padding:9px 12px;font-size:12px;color:var(--green);margin-bottom:13px;}
.btn-primary{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.18s;}
.btn-primary:hover{box-shadow:0 4px 18px var(--glow)}
.btn-primary:disabled{opacity:0.5;cursor:not-allowed}
.btn-mpesa{width:100%;padding:13px;border-radius:10px;border:none;background:var(--mpesa);color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;justify-content:center;gap:7px;}
.btn-mpesa:hover{background:#00bd5e;box-shadow:0 4px 18px rgba(0,166,81,0.28)}
.btn-mpesa:disabled{opacity:0.5;cursor:not-allowed}
.presets{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap}
.preset{padding:6px 10px;background:var(--s);border:1px solid var(--b2);border-radius:7px;color:var(--t2);font-family:'JetBrains Mono',monospace;font-size:12px;cursor:pointer;transition:all 0.15s;}
.preset:hover{border-color:var(--mpesa);color:var(--mpesa)}
.preset:disabled{opacity:0.35;cursor:not-allowed}
.phone-wrap{display:flex;gap:0;border:1px solid var(--b2);border-radius:9px;overflow:hidden;background:var(--s);transition:border-color 0.18s}
.phone-wrap:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px rgba(246,195,71,0.07)}
.phone-flag{padding:0 10px;display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--t2);border-right:1px solid var(--b2);background:var(--card);white-space:nowrap;flex-shrink:0}
.phone-input{flex:1;background:transparent;border:none;padding:11px 13px;color:var(--t);font-family:'DM Sans',sans-serif;font-size:15px;outline:none;-webkit-appearance:none;}
.phone-input::placeholder{color:var(--t3)}
.pw-wrap{position:relative}
.pw-wrap .finput{padding-right:44px}
.pw-eye{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--t2);cursor:pointer;font-size:16px;padding:4px;line-height:1;transition:color 0.15s}
.pw-eye:hover{color:var(--t)}
.stk-steps{margin-bottom:14px;display:flex;flex-direction:column;gap:7px}
.stk-step{display:flex;align-items:flex-start;gap:9px;padding:9px 11px;background:rgba(0,166,81,0.06);border:1px solid rgba(0,166,81,0.12);border-radius:9px;}
.stk-n{width:20px;height:20px;border-radius:50%;background:var(--mpesa);color:#fff;font-size:9px;font-weight:700;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.stk-t{font-size:12px;color:var(--t2);line-height:1.5}
.stk-t b{color:var(--t)}
.stk-wait{text-align:center;padding:20px 0}
.stk-ico{font-size:48px;margin-bottom:12px;animation:bob 1.1s ease infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.stk-wt{font-family:'Sora',sans-serif;font-size:17px;font-weight:800;margin-bottom:7px}
.stk-ws{color:var(--t2);font-size:13px;line-height:1.6}
.stk-blink{color:var(--mpesa);font-size:12px;font-weight:700;margin-top:12px;animation:blk 1.1s infinite}
@keyframes blk{0%,100%{opacity:1}50%{opacity:0.3}}
.layout{display:flex;flex-direction:column;gap:10px;padding:10px 12px;width:100%;max-width:1280px;margin:0 auto;}
.gcard{background:var(--card);border:1px solid var(--b);border-radius:14px;overflow:hidden;width:100%;}
.gtopbar{padding:9px 14px;border-bottom:1px solid var(--b);display:flex;align-items:center;justify-content:space-between;}
.live{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--t2)}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:blk 1.4s infinite}
.rbadge{font-family:'JetBrains Mono',monospace;font-size:11px;padding:3px 9px;border-radius:5px;background:var(--s);border:1px solid var(--b);color:var(--t2);}
.rbadge.flying{color:var(--gold);border-color:rgba(246,195,71,0.25);background:rgba(246,195,71,0.06)}
.rbadge.crashed{color:var(--red);border-color:rgba(244,63,94,0.25);background:rgba(244,63,94,0.06)}
.canvas{position:relative;height:210px;background:linear-gradient(180deg,#040a14 0%,#060e1c 100%);overflow:hidden;}
.root.light .canvas{background:linear-gradient(180deg,#1a2744 0%,#1e3058 100%)}
.canvas::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(246,195,71,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(246,195,71,0.025) 1px,transparent 1px);background-size:40px 40px;}
.stars{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.star{position:absolute;border-radius:50%;background:#fff;animation:twinkle var(--d,3s) ease infinite var(--delay,0s)}
@keyframes twinkle{0%,100%{opacity:var(--op,0.3)}50%{opacity:0.9}}
.csvg{position:absolute;inset:0;width:100%;height:100%}
.plane{position:absolute;filter:drop-shadow(0 0 9px rgba(246,195,71,0.7));pointer-events:none;transition:filter 0.2s;}
.plane.crashed-spin{animation:crashSpin 0.6s ease forwards;filter:drop-shadow(0 0 12px rgba(244,63,94,0.9))!important}
@keyframes crashSpin{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(0);opacity:0}}
.crash-explode{position:absolute;pointer-events:none;animation:explode 0.7s ease forwards}
@keyframes explode{0%{opacity:1;transform:scale(0.5)}60%{opacity:0.8;transform:scale(2.5)}100%{opacity:0;transform:scale(3.5)}}
.mult-wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;user-select:none;}
.mult-num{font-family:'Sora',sans-serif;font-size:52px;font-weight:800;line-height:1;transition:color 0.2s,text-shadow 0.2s;}
.mult-num.waiting{color:var(--t2)}
.mult-num.flying{color:var(--gold);text-shadow:0 0 40px rgba(246,195,71,0.38)}
.mult-num.flying.high{color:#ff6b35;text-shadow:0 0 60px rgba(255,107,53,0.6);animation:multPulse 0.4s ease infinite}
.mult-num.flying.extreme{color:var(--purple);text-shadow:0 0 80px rgba(168,85,247,0.7);animation:multPulse 0.25s ease infinite}
@keyframes multPulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.05)}}
.mult-num.crashed{color:var(--red);text-shadow:0 0 40px rgba(244,63,94,0.38);animation:crashShake 0.4s ease}
@keyframes crashShake{0%,100%{transform:translate(-50%,-50%)}20%{transform:translate(calc(-50% - 6px),-50%)}40%{transform:translate(calc(-50% + 6px),-50%)}60%{transform:translate(calc(-50% - 4px),-50%)}80%{transform:translate(calc(-50% + 4px),-50%)}}
.mult-sub{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:5px}
.mult-sub.waiting{color:var(--t3)}
.mult-sub.flying{color:var(--gold)}
.mult-sub.crashed{color:var(--red)}
.cbar{display:flex;align-items:center;gap:5px;padding:7px 14px;border-bottom:1px solid rgba(255,255,255,0.04);overflow-x:auto;-webkit-overflow-scrolling:touch;}
.cbar::-webkit-scrollbar{display:none}
.cbar-lbl{font-size:9px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--t3);flex-shrink:0}
.cbadge{padding:3px 7px;border-radius:5px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;}
.cbadge.lo{background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.2)}
.cbadge.mi{background:rgba(220,220,220,0.08);color:#c8d0dc;border:1px solid rgba(200,200,200,0.12)}
.cbadge.hi{background:rgba(168,85,247,0.1);color:#a855f7;border:1px solid rgba(168,85,247,0.2)}
.cbadge.new{animation:badgePop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)}
@keyframes badgePop{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
.bpanel{padding:12px 14px 16px}
.bptabs{display:flex;background:var(--s);border:1px solid var(--b);border-radius:10px;padding:3px;margin-bottom:14px}
.bptab{flex:1;padding:8px;border-radius:7px;border:none;background:transparent;color:var(--t2);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.18s}
.bptab.on{background:var(--card2);color:var(--t);box-shadow:0 2px 8px rgba(0,0,0,0.3)}
.stepper-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.step-btn{width:44px;height:44px;border-radius:9px;border:1px solid var(--b2);background:var(--s);color:var(--t);font-size:22px;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;-webkit-tap-highlight-color:transparent;}
.step-btn:hover{border-color:var(--gold);color:var(--gold)}
.step-btn:active{transform:scale(0.92);background:var(--card2)}
.step-btn:disabled{opacity:0.35;cursor:not-allowed}
.step-val{flex:1;background:var(--s);border:1px solid var(--b2);border-radius:9px;padding:10px 12px;color:var(--t);font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;text-align:center;outline:none;-webkit-appearance:none;transition:border-color 0.18s}
.step-val:focus{border-color:var(--gold)}
.step-val:disabled{opacity:0.4}
.step-val.bounce{animation:stepBounce 0.2s ease}
@keyframes stepBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.qgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px}
.qgbtn{padding:9px 0;background:var(--s);border:1px solid var(--b);border-radius:8px;color:var(--t2);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;text-align:center;-webkit-tap-highlight-color:transparent;}
.qgbtn:hover:not(:disabled){border-color:var(--gold);color:var(--gold)}
.qgbtn:active:not(:disabled){transform:scale(0.95)}
.qgbtn:disabled{opacity:0.35;cursor:not-allowed}
.bet-big{width:100%;padding:16px;border-radius:12px;border:none;background:#22c55e;color:#fff;font-family:'Sora',sans-serif;font-size:18px;font-weight:800;cursor:pointer;transition:all 0.18s;letter-spacing:0.2px;line-height:1.3;margin-bottom:12px;-webkit-tap-highlight-color:transparent;}
.bet-big:hover:not(:disabled){background:#16a34a;box-shadow:0 4px 20px rgba(34,197,94,0.35)}
.bet-big:active:not(:disabled){transform:scale(0.97)}
.bet-big:disabled{opacity:0.5;cursor:not-allowed}
.bet-big.cashout{background:linear-gradient(135deg,var(--green),#07b886);animation:cashp 0.85s infinite}
@keyframes cashp{0%,100%{box-shadow:0 4px 16px rgba(14,207,158,0.2)}50%{box-shadow:0 4px 30px rgba(14,207,158,0.5)}}
.bet-big.crashed-btn{background:var(--s);border:1px solid var(--b);color:var(--t2);font-size:14px}
.bet-big.login-btn{background:var(--s);border:1px solid rgba(246,195,71,0.3);color:var(--gold);font-size:15px}
.auto-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.auto-item{display:flex;align-items:center;gap:8px}
.auto-lbl{font-size:12px;font-weight:600;color:var(--t2)}
.toggle{position:relative;width:38px;height:22px;flex-shrink:0;cursor:pointer}
.toggle input{opacity:0;width:0;height:0;position:absolute}
.toggle-track{position:absolute;inset:0;border-radius:11px;background:var(--s);border:1px solid var(--b2);transition:all 0.2s}
.toggle input:checked+.toggle-track{background:var(--green);border-color:var(--green)}
.toggle-thumb{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:all 0.2s;pointer-events:none}
.toggle input:checked~.toggle-thumb{left:19px}
.aco-wrap{display:flex;align-items:center;gap:6px}
.aco-input{width:58px;background:var(--s);border:1px solid var(--b2);border-radius:7px;padding:5px 7px;color:var(--t);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;text-align:center;outline:none;-webkit-appearance:none}
.aco-input:focus{border-color:var(--gold)}
.aco-x{background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;padding:2px 4px;line-height:1}
.aco-x:hover{color:var(--red)}
.auto-panel{background:var(--s);border:1px solid var(--b);border-radius:10px;padding:12px;margin-bottom:14px}
.auto-field{margin-bottom:10px}
.auto-field:last-child{margin-bottom:0}
.auto-flbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--t2);margin-bottom:5px;display:block}
.auto-finput{width:100%;background:var(--card);border:1px solid var(--b2);border-radius:8px;padding:8px 10px;color:var(--t);font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;outline:none;-webkit-appearance:none}
.auto-finput:focus{border-color:var(--gold)}
.cd-wrap{display:flex;flex-direction:column;align-items:center;gap:6px}
.cd-ring{position:relative;width:64px;height:64px}
.cd-ring svg{transform:rotate(-90deg)}
.cd-ring-track{fill:none;stroke:var(--b2);stroke-width:3}
.cd-ring-fill{fill:none;stroke:var(--gold);stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset 0.9s linear}
.cd-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--gold)}
.cd-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--t3)}
.particle{position:absolute;border-radius:50%;pointer-events:none;animation:particleFade 0.7s ease forwards}
@keyframes particleFade{0%{opacity:0.9;transform:scale(1) translate(0,0)}100%{opacity:0;transform:scale(0.1) translate(-12px,4px)}}
.win-banner{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:10;background:rgba(14,207,158,0.15);border:1px solid rgba(14,207,158,0.3);border-radius:10px;padding:6px 16px;font-family:'Sora',sans-serif;font-size:13px;font-weight:800;color:var(--green);white-space:nowrap;animation:bannerPop 0.3s ease}
@keyframes bannerPop{from{opacity:0;transform:translateX(-50%) scale(0.8)}to{opacity:1;transform:translateX(-50%) scale(1)}}
.float-notif{position:fixed;bottom:80px;left:16px;z-index:800;pointer-events:none;display:flex;flex-direction:column;gap:6px;max-width:220px;}
.fnotif{background:rgba(14,207,158,0.12);border:1px solid rgba(14,207,158,0.25);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:600;color:var(--green);animation:floatUp 4s ease forwards;}
@keyframes floatUp{0%{opacity:0;transform:translateY(20px)}10%{opacity:1;transform:translateY(0)}80%{opacity:1;transform:translateY(-10px)}100%{opacity:0;transform:translateY(-30px)}}
.rcol{display:none;flex-direction:column;gap:10px}
.rcard{background:var(--card);border:1px solid var(--b);border-radius:14px;overflow:hidden}
.rhead{padding:10px 14px;border-bottom:1px solid var(--b);display:flex;align-items:center;justify-content:space-between;}
.rtitle{font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:var(--t)}
.rbg{background:var(--s);border:1px solid var(--b);border-radius:5px;padding:2px 7px;font-size:10px;color:var(--t2);font-family:'JetBrains Mono',monospace}
.mpesa-tag{background:var(--mpesa);color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;letter-spacing:1px}
.plist{padding:3px}
.prow{display:flex;align-items:center;justify-content:space-between;padding:7px 11px;border-radius:8px;transition:background 0.12s;}
.prow:hover{background:rgba(255,255,255,0.02)}
.prow.new-player{animation:slideIn 0.4s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.prow.cashed{background:rgba(14,207,158,0.06);animation:flashGreen 0.6s ease}
@keyframes flashGreen{0%{background:rgba(14,207,158,0.25)}100%{background:rgba(14,207,158,0.06)}}
.pname{font-size:12px;font-weight:600}
.pbet{font-size:10px;color:var(--t2);font-family:'JetBrains Mono',monospace;margin-top:1px}
.pmult{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--gold)}
.pmult.cashed{color:var(--green)}
.wmini{padding:12px}
.wm-bal{background:linear-gradient(135deg,#0a1828,#0f2040);border:1px solid var(--b);border-radius:11px;padding:12px;margin-bottom:10px;position:relative;overflow:hidden;}
.wm-bal::after{content:'';position:absolute;top:-12px;right:-12px;width:68px;height:68px;background:radial-gradient(circle,rgba(246,195,71,0.1),transparent 65%)}
.wm-lbl{font-size:9px;color:var(--t2);letter-spacing:1px;text-transform:uppercase}
.wm-amt{font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--green);margin:4px 0 2px}
.wm-sub{font-size:10px;color:var(--t2)}
.mob-players{background:var(--card);border:1px solid var(--b);border-radius:14px;overflow:hidden;width:100%;}
.chat-card{background:var(--card);border:1px solid var(--b);border-radius:14px;overflow:hidden;width:100%;}
.chat-feed{height:140px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px;}
.chat-feed::-webkit-scrollbar{display:none}
.chat-msg{font-size:11px;line-height:1.45;animation:msgIn 0.3s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.chat-name{font-weight:700;margin-right:4px}
.chat-name.gold{color:var(--gold)}
.chat-name.green{color:var(--green)}
.chat-name.blue{color:#3b82f6}
.chat-text{color:var(--t2)}
.chat-input-row{display:flex;gap:6px;padding:8px;border-top:1px solid var(--b)}
.chat-input{flex:1;background:var(--s);border:1px solid var(--b);border-radius:8px;padding:7px 10px;color:var(--t);font-family:'DM Sans',sans-serif;font-size:12px;outline:none;}
.chat-input::placeholder{color:var(--t3)}
.chat-send{padding:7px 12px;border-radius:8px;border:none;background:var(--gold);color:#000;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;}
.page{width:100%;max-width:520px;margin:14px auto;padding:0 12px}
.page.wide{max-width:680px}
.pcard{background:var(--card);border:1px solid var(--b);border-radius:14px;overflow:hidden}
.pcard-head{padding:16px 18px;border-bottom:1px solid var(--b)}
.pcard-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:800}
.pcard-sub{font-size:12px;color:var(--t2);margin-top:2px}
.pcard-body{padding:16px 18px}
.big-bal{background:linear-gradient(135deg,#091624,#0e1e38);border:1px solid var(--b);border-radius:12px;padding:16px;margin-bottom:16px;position:relative;overflow:hidden;}
.big-bal::before{content:'✈';position:absolute;right:12px;bottom:4px;font-size:44px;opacity:0.05}
.bb-lbl{font-size:10px;color:var(--t2);letter-spacing:1.2px;text-transform:uppercase}
.bb-amt{font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;color:var(--green);margin:5px 0 3px}
.bb-sub{font-size:11px;color:var(--t2)}
.tab-row{display:flex;gap:6px;margin-bottom:16px}
.tabbtn{flex:1;padding:10px 8px;border-radius:9px;border:1px solid var(--b);background:var(--s);color:var(--t2);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.15s;}
.tabbtn.on{background:rgba(0,166,81,0.09);border-color:var(--mpesa);color:var(--mpesa)}
.tabbtn.on2{background:rgba(246,195,71,0.09);border-color:var(--gold);color:var(--gold)}
.hist-row{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.12s;}
.hist-row:hover{background:rgba(255,255,255,0.012)}
.hist-row:last-child{border-bottom:none}
.hist-l{display:flex;align-items:center;gap:9px;min-width:0}
.hist-ico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.hist-ico.dep{background:rgba(0,166,81,0.12)}
.hist-ico.win{background:rgba(14,207,158,0.12)}
.hist-ico.loss{background:rgba(244,63,94,0.12)}
.hist-ico.wd{background:rgba(246,195,71,0.12)}
.hist-desc{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-time{font-size:10px;color:var(--t2);font-family:'JetBrains Mono',monospace;margin-top:1px}
.hist-amt{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;flex-shrink:0;padding-left:10px}
.hist-amt.pos{color:var(--green)}
.hist-amt.neg{color:var(--red)}
.locked{display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 20px}
.locked-ico{font-size:44px;margin-bottom:12px}
.locked-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;margin-bottom:7px}
.locked-sub{color:var(--t2);font-size:13px;line-height:1.65;margin-bottom:20px;max-width:260px}
.locked-btns{display:flex;gap:9px}
.filter-row{display:flex;gap:6px;padding:10px 14px;border-bottom:1px solid var(--b);overflow-x:auto}
.filter-row::-webkit-scrollbar{display:none}
.fpill{padding:5px 12px;border-radius:20px;border:1px solid var(--b);background:transparent;color:var(--t2);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all 0.15s}
.fpill:hover{border-color:var(--t2);color:var(--t)}
.fpill.on{background:rgba(246,195,71,0.1);border-color:var(--gold);color:var(--gold)}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.stat-card{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:14px}
.stat-ico{font-size:20px;margin-bottom:6px}
.stat-val{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:var(--t)}
.stat-val.green{color:var(--green)}
.stat-val.gold{color:var(--gold)}
.stat-val.red{color:var(--red)}
.stat-lbl{font-size:10px;color:var(--t2);margin-top:3px;font-weight:600}
.streak-bar{display:flex;align-items:center;gap:8px;background:var(--s);border:1px solid var(--b);border-radius:10px;padding:12px 14px;margin-bottom:10px}
.streak-ico{font-size:22px}
.streak-val{font-family:'Sora',sans-serif;font-size:18px;font-weight:800}
.streak-val.win-s{color:var(--green)}
.streak-val.loss-s{color:var(--red)}
.streak-lbl{font-size:11px;color:var(--t2);margin-top:2px}
.lb-row{display:flex;align-items:center;gap:10px;padding:11px 16px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.12s}
.lb-row:hover{background:rgba(255,255,255,0.012)}
.lb-row:last-child{border-bottom:none}
.lb-rank{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;width:24px;flex-shrink:0;text-align:center}
.lb-rank.gold{color:var(--gold)}
.lb-rank.silver{color:#9ca3af}
.lb-rank.bronze{color:#b45309}
.lb-av{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--gold),var(--gold2));display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-size:12px;font-weight:800;color:#000;flex-shrink:0}
.lb-name{flex:1;font-size:13px;font-weight:600}
.lb-sub{font-size:10px;color:var(--t2);margin-top:1px}
.lb-amt{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green)}
.confirm-box{background:rgba(246,195,71,0.06);border:1px solid rgba(246,195,71,0.2);border-radius:10px;padding:14px;margin-bottom:14px}
.confirm-row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px}
.confirm-row:last-child{margin-bottom:0;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);font-weight:700}
.confirm-lbl{color:var(--t2)}
.confirm-val{font-family:'JetBrains Mono',monospace;color:var(--t)}
.toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);z-index:900;width:calc(100% - 32px);max-width:320px;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:600;text-align:center;animation:tUp 0.22s ease;}
@keyframes tUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.toast.ok{background:rgba(14,207,158,0.12);border:1px solid rgba(14,207,158,0.25);color:var(--green)}
.toast.err{background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.25);color:var(--red)}
.nodata{text-align:center;padding:28px;color:var(--t2);font-size:13px}
.splash{position:fixed;inset:0;z-index:1000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;}
.splash-logo{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.5px;}
.splash-logo span{color:var(--gold)}
.splash-ring{width:56px;height:56px;border-radius:50%;border:3px solid var(--b2);border-top-color:var(--gold);animation:spin 0.9s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
@media(min-width:600px){
  .dep-txt{display:inline}
  .canvas{height:250px}
  .mult-num{font-size:62px}
  .float-notif{bottom:20px}
  .toast{bottom:20px;left:auto;right:16px;transform:none;width:auto;max-width:300px;text-align:left}
  @keyframes tUp{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
}
@media(min-width:768px){
  .ntabs{display:flex}
  .mob-tabs{display:none}
  .root{padding-bottom:0}
  .toast{bottom:20px}
  .float-notif{bottom:20px;left:20px}
}
@media(min-width:960px){
  .layout{display:grid;grid-template-columns:1fr 300px;gap:12px;padding:12px 18px;}
  .rcol{display:flex}
  .mob-players{display:none}
  .canvas{height:280px}
  .mult-num{font-size:68px}
}
`;

(() => {
  if (document.getElementById("av-css")) return;
  const s = document.createElement("style");
  s.id = "av-css"; s.textContent = CSS;
  document.head.appendChild(s);
})();

const fKES = n => `KES ${Number(n).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fTime = d => d.toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"});
const fDate = d => d.toLocaleDateString("en-KE",{day:"numeric",month:"short"});
const cbCls = v => v < 2 ? "lo" : v >= 10 ? "hi" : "mi";

const CHAT_MSGS = [
  {name:"KipC***",color:"gold",text:"WOW 52x last round 🔥"},
  {name:"WanjiM***",color:"green",text:"cashed at 3.2x nice"},
  {name:"AviBot",color:"blue",text:"🎉 Big win alert!"},
  {name:"OmonB***",color:"",text:"let's gooo"},
  {name:"Amina***",color:"gold",text:"who else got 8x?"},
  {name:"JohnK***",color:"",text:"deposited, ready 💪"},
  {name:"FatumA***",color:"green",text:"auto cashout saved me"},
  {name:"MwanM***",color:"",text:"gg everyone"},
];

const FLOAT_WINS = [
  "🏆 WanjiM*** won KES 1,240!",
  "🚀 KipC*** cashed ×8.4!",
  "💰 Amina*** won KES 3,500!",
  "🔥 OmonB*** cashed ×5.2!",
  "🎉 JohnK*** won KES 840!",
  "⚡ FatumA*** cashed ×12.1!",
];

function PlaneSVG({size=38}){
  return(
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M2 20 L38 8 L30 20 L38 32 Z" fill="#f6c347" opacity="0.95"/>
      <path d="M16 20 L25 15 L25 25 Z" fill="#fff" opacity="0.4"/>
      <path d="M30 20 L25 15 L29 20 L25 25 Z" fill="#f6c347"/>
      <circle cx="10" cy="20" r="2" fill="#fff" opacity="0.25"/>
    </svg>
  );
}

function Modal({onClose,children}){
  return(
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal">
        <div className="modal-drag"/>
        {children}
      </div>
    </div>
  );
}

function PhoneInput({value,onChange}){
  return(
    <div className="phone-wrap">
      <div className="phone-flag">🇰🇪 +254</div>
      <input className="phone-input" placeholder="7XX XXX XXX"
        value={value.replace(/^254/,"")}
        onChange={e=>onChange("254"+e.target.value.replace(/^0/,"").replace(/\D/g,""))}/>
    </div>
  );
}

function PwInput({placeholder,value,onChange,onKeyDown}){
  const [show,setShow]=useState(false);
  return(
    <div className="pw-wrap">
      <input className="finput" type={show?"text":"password"}
        placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown}/>
      <button className="pw-eye" onClick={()=>setShow(s=>!s)} type="button">{show?"🙈":"👁️"}</button>
    </div>
  );
}

function validateEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}

// ─── AUTH MODALS ──────────────────────────────────────────────────────────────

function LoginModal({onClose,onLogin,goRegister,goRecover}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [emailErr,setEmailErr]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const checkEmail=()=>{if(email&&!validateEmail(email))setEmailErr("Invalid email address");else setEmailErr("");}
  const submit=async()=>{
    if(!email||!pass){setErr("Please fill in all fields.");return;}
    if(!validateEmail(email)){setErr("Enter a valid email.");return;}
    setLoading(true);setErr("");
    try{
      const res=await fetch(`${API}/auth/login`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password:pass}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Login failed");setLoading(false);return;}
      localStorage.setItem("avipesa_token",data.token);
      onLogin(data.user);
      onClose();
    }catch{
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  };
  return(
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">Welcome back ✈</div><div className="msub">Sign in to your AviPesa account</div></div>
        <button className="mclose" onClick={onClose}>×</button>
      </div>
      <div className="mbody">
        {err&&<div className="ferr">{err}</div>}
        <div className="fg">
          <label className="flbl">Email Address</label>
          <input className={`finput ${emailErr?"err-field":email&&validateEmail(email)?"ok-field":""}`}
            placeholder="you@email.com" value={email}
            onChange={e=>{setEmail(e.target.value);setEmailErr("");}}
            onBlur={checkEmail}/>
          {emailErr&&<div className="ferr-inline">⚠ {emailErr}</div>}
        </div>
        <div className="fg">
          <label className="flbl">Password</label>
          <PwInput placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <div style={{textAlign:"right",marginBottom:14}}>
          <button className="flink" onClick={()=>{onClose();goRecover();}}>Forgot password?</button>
        </div>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading?"Signing in...":"Sign In"}</button>
        <div className="ffoot">No account?{" "}<button className="flink" onClick={()=>{onClose();goRegister();}}>Create one free</button></div>
      </div>
    </Modal>
  );
}

function RegisterModal({onClose,onLogin,goLogin}){
  const [f,setF]=useState({fn:"",ln:"",email:"",phone:"254",pass:"",confirm:""});
  const [errs,setErrs]=useState({});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const validate=()=>{
    const e={};
    if(!f.fn)e.fn="Required";
    if(!f.ln)e.ln="Required";
    if(!f.email)e.email="Required";
    else if(!validateEmail(f.email))e.email="Invalid email";
    if(f.phone.length<12)e.phone="Enter full number";
    if(!f.pass)e.pass="Required";
    else if(f.pass.length<6)e.pass="Min 6 characters";
    if(f.pass!==f.confirm)e.confirm="Passwords don't match";
    return e;
  };
  const submit=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrs(e);return;}
    setLoading(true);setErr("");
    try{
      const res=await fetch(`${API}/auth/register`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({firstName:f.fn,lastName:f.ln,email:f.email,phone:f.phone,password:f.pass}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Registration failed");setLoading(false);return;}
      localStorage.setItem("avipesa_token",data.token);
      onLogin(data.user);
      onClose();
    }catch{
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  };
  const fi=(k,ph)=>(
    <div className="fg">
      <input className={`finput ${errs[k]?"err-field":""}`} placeholder={ph} value={f[k]} onChange={e=>{set(k)(e);setErrs(p=>({...p,[k]:""}))}}/> 
      {errs[k]&&<div className="ferr-inline">⚠ {errs[k]}</div>}
    </div>
  );
  return(
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">Create Account 🚀</div><div className="msub">Join thousands of AviPesa players</div></div>
        <button className="mclose" onClick={onClose}>×</button>
      </div>
      <div className="mbody">
        {err&&<div className="ferr">{err}</div>}
        <div className="frow">
          <div><label className="flbl">First Name</label>{fi("fn","John")}</div>
          <div><label className="flbl">Last Name</label>{fi("ln","Kamau")}</div>
        </div>
        <div className="fg">
          <label className="flbl">Email</label>
          <input className={`finput ${errs.email?"err-field":f.email&&validateEmail(f.email)?"ok-field":""}`}
            placeholder="you@email.com" value={f.email}
            onChange={e=>{setF(p=>({...p,email:e.target.value}));setErrs(p=>({...p,email:""}))}}/>
          {errs.email&&<div className="ferr-inline">⚠ {errs.email}</div>}
        </div>
        <div className="fg">
          <label className="flbl">M-Pesa Number</label>
          <PhoneInput value={f.phone} onChange={v=>setF(p=>({...p,phone:v}))}/>
          {errs.phone&&<div className="ferr-inline">⚠ {errs.phone}</div>}
        </div>
        <div className="frow">
          <div className="fg">
            <label className="flbl">Password</label>
            <PwInput placeholder="Min 6 chars" value={f.pass} onChange={e=>{setF(p=>({...p,pass:e.target.value}));setErrs(p=>({...p,pass:""}))}}/>
            {errs.pass&&<div className="ferr-inline">⚠ {errs.pass}</div>}
          </div>
          <div className="fg">
            <label className="flbl">Confirm</label>
            <PwInput placeholder="Repeat" value={f.confirm} onChange={e=>{setF(p=>({...p,confirm:e.target.value}));setErrs(p=>({...p,confirm:""}))}}/>
            {errs.confirm&&<div className="ferr-inline">⚠ {errs.confirm}</div>}
          </div>
        </div>
        <div className="fhint" style={{marginBottom:13}}>By registering you confirm you are 18+ and agree to our <span style={{color:"var(--gold)"}}>Terms of Service</span>.</div>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading?"Creating account...":"Create My Account"}</button>
        <div className="ffoot">Have an account?{" "}<button className="flink" onClick={()=>{onClose();goLogin();}}>Sign in</button></div>
      </div>
    </Modal>
  );
}

function RecoverModal({onClose,goLogin}){
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const submit=async()=>{
    if(!email||!validateEmail(email)){setErr("Enter a valid email address.");return;}
    setLoading(true);setErr("");
    try{
      const res=await fetch(`${API}/auth/forgot-password`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Failed to send reset link");setLoading(false);return;}
      setSent(true);
    }catch{
      setErr("Network error. Please try again.");
    }
    setLoading(false);
  };
  return(
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">Reset Password 🔑</div><div className="msub">We'll send a reset link to your email</div></div>
        <button className="mclose" onClick={onClose}>×</button>
      </div>
      <div className="mbody">
        {sent?(<>
          <div className="fok">✓ Reset link sent! Check your inbox and spam folder.</div>
          <button className="btn-primary" onClick={()=>{onClose();goLogin();}}>Back to Sign In</button>
        </>):(<>
          {err&&<div className="ferr">{err}</div>}
          <div className="fg"><label className="flbl">Registered Email</label>
            <input className="finput" placeholder="you@email.com" value={email}
              onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          <div className="fhint" style={{marginBottom:14}}>Enter the email you used when registering.</div>
          <button className="btn-primary" onClick={submit} disabled={!email||loading}>{loading?"Sending...":"Send Reset Link"}</button>
          <div className="ffoot"><button className="flink" onClick={()=>{onClose();goLogin();}}>Back to Sign In</button></div>
        </>)}
      </div>
    </Modal>
  );
}

function ResetPasswordModal({token,onClose,onLogin,goRecover}){
  const [validating,setValidating]=useState(true);
  const [tokenValid,setTokenValid]=useState(false);
  const [pass,setPass]=useState("");
  const [confirm,setConfirm]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    const validate=async()=>{
      try{
        const res=await fetch(`${API}/auth/reset-password/${token}`);
        const data=await res.json();
        if(res.ok&&data.valid){setTokenValid(true);}
        else{setErr("This reset link has expired or is invalid.");}
      }catch{
        setErr("Network error. Could not validate link.");
      }
      setValidating(false);
    };
    validate();
  },[token]);

  const submit=async()=>{
    if(!pass||pass.length<6){setErr("Password must be at least 6 characters.");return;}
    if(pass!==confirm){setErr("Passwords don't match.");return;}
    setLoading(true);setErr("");
    try{
      const res=await fetch(`${API}/auth/reset-password`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token,password:pass}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Reset failed");setLoading(false);return;}
      localStorage.setItem("avipesa_token",data.token);
      window.history.replaceState({},"",window.location.pathname);
      onLogin(data.user,"Password reset! Welcome back 🎮");
      onClose();
    }catch{
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  };

  return(
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">New Password 🔐</div><div className="msub">Choose a strong password</div></div>
        <button className="mclose" onClick={onClose}>×</button>
      </div>
      <div className="mbody">
        {validating?(
          <div style={{textAlign:"center",padding:"28px 0"}}>
            <div className="splash-ring" style={{margin:"0 auto 12px"}}/>
            <div style={{fontSize:13,color:"var(--t2)"}}>Validating link...</div>
          </div>
        ):!tokenValid?(
          <>
            <div className="ferr">{err}</div>
            <button className="btn-primary" onClick={()=>{onClose();goRecover();}}>Request New Link</button>
          </>
        ):(
          <>
            {err&&<div className="ferr">{err}</div>}
            <div className="fg">
              <label className="flbl">New Password</label>
              <PwInput placeholder="Min 6 characters" value={pass} onChange={e=>setPass(e.target.value)}/>
            </div>
            <div className="fg">
              <label className="flbl">Confirm Password</label>
              <PwInput placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
            <button className="btn-primary" onClick={submit} disabled={loading}>{loading?"Resetting...":"Reset Password"}</button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── WALLET MODALS ────────────────────────────────────────────────────────────

function DepositModal({onClose,onDeposit}){
  const [phone,setPhone]=useState("254");
  const [amount,setAmount]=useState("");
  const [step,setStep]=useState(0);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const amt=parseFloat(amount);
  const valid=!isNaN(amt)&&amt>=10&&phone.length>=12;

  const submit=async()=>{
    if(!valid)return;
    setLoading(true);setErr("");
    try{
      const res=await fetch(`${API}/wallet/deposit`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${localStorage.getItem("avipesa_token")}`},
        body:JSON.stringify({amount:amt,phone}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Deposit failed");setLoading(false);return;}
      setStep(1);
      // Poll or wait — backend confirms via webhook; we show STK waiting screen
      setTimeout(()=>{onDeposit(data.balance,amt);onClose();},4000);
    }catch{
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  };

  return(
    <Modal onClose={step===0?onClose:()=>{}}>
      <div className="mhead">
        <div><div className="mtitle">Deposit via M-Pesa</div><div className="msub">Instant STK push • Safaricom</div></div>
        {step===0&&<button className="mclose" onClick={onClose}>×</button>}
      </div>
      <div className="mbody">
        {step===0?(<>
          {err&&<div className="ferr">{err}</div>}
          <div className="fg"><label className="flbl">M-Pesa Number</label>
            <PhoneInput value={phone} onChange={setPhone}/></div>
          <div className="fg"><label className="flbl">Amount (KES)</label>
            <input className="finput" type="number" placeholder="Minimum KES 10" value={amount} onChange={e=>setAmount(e.target.value)}/>
            <div className="presets">{[50,100,500,1000,2000,5000].map(v=>(
              <button key={v} className="preset" onClick={()=>setAmount(String(v))}>{v}</button>))}</div></div>
          <div className="stk-steps">
            <div className="stk-step"><div className="stk-n">1</div><div className="stk-t">Enter your <b>M-Pesa number</b> and deposit amount.</div></div>
            <div className="stk-step"><div className="stk-n">2</div><div className="stk-t">Tap Deposit — a <b>push notification</b> will appear on your phone.</div></div>
            <div className="stk-step"><div className="stk-n">3</div><div className="stk-t">Enter your <b>M-Pesa PIN</b>. Funds land instantly.</div></div>
          </div>
          <button className="btn-mpesa" onClick={submit} disabled={!valid||loading}>
            <span>📲</span>{loading?"Sending STK...":"Deposit "}{!loading&&amount&&!isNaN(amt)?fKES(amt):""}
          </button>
        </>):(
          <div className="stk-wait">
            <div className="stk-ico">📲</div>
            <div className="stk-wt">STK Push Sent!</div>
            <div className="stk-ws">Check your phone<br/>Enter your M-Pesa PIN to complete.</div>
            <div className="stk-blink">⏳ Waiting for confirmation...</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function WithdrawModal({onClose,balance,onWithdraw}){
  const [phone,setPhone]=useState("254");
  const [amount,setAmount]=useState("");
  const [step,setStep]=useState(0);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const amt=parseFloat(amount);
  const valid=!isNaN(amt)&&amt>=100&&amt<=balance&&phone.length>=12;

  const toConfirm=()=>{
    if(!valid){
      if(isNaN(amt)||amt<100)setErr("Minimum withdrawal is KES 100");
      else if(amt>balance)setErr("Amount exceeds your balance");
      else setErr("Enter a valid M-Pesa number");
      return;
    }
    setErr("");setStep(1);
  };

  const confirm=async()=>{
    setLoading(true);setErr("");
    try{
      const res=await fetch(`${API}/wallet/withdraw`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${localStorage.getItem("avipesa_token")}`},
        body:JSON.stringify({amount:amt,phone}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Withdrawal failed");setLoading(false);setStep(0);return;}
      onWithdraw(data.balance,amt);
      onClose();
    }catch{
      setErr("Network error. Please try again.");
      setLoading(false);setStep(0);
    }
  };

  return(
    <Modal onClose={step===0?onClose:()=>{}}>
      <div className="mhead">
        <div><div className="mtitle">Withdraw Funds ⬆</div><div className="msub">Send to M-Pesa • 2 minutes</div></div>
        {step===0&&<button className="mclose" onClick={onClose}>×</button>}
      </div>
      <div className="mbody">
        {step===0?(<>
          {err&&<div className="ferr">{err}</div>}
          <div className="fg"><label className="flbl">M-Pesa Number</label>
            <PhoneInput value={phone} onChange={setPhone}/></div>
          <div className="fg"><label className="flbl">Amount (KES)</label>
            <input className="finput" type="number" placeholder="Min KES 100" value={amount} onChange={e=>setAmount(e.target.value)}/>
            <div className="presets">{[100,500,1000,2000,5000].map(v=>(
              <button key={v} className="preset" onClick={()=>setAmount(String(v))} disabled={v>balance}>{v}</button>))}</div>
            <div className="fhint">Available: <strong style={{color:"var(--green)"}}>{fKES(balance)}</strong> • Min: KES 100</div>
          </div>
          <button className="btn-primary" onClick={toConfirm} disabled={!amount}>Review Withdrawal</button>
        </>):loading?(
          <div className="stk-wait">
            <div className="stk-ico">💸</div>
            <div className="stk-wt">Processing...</div>
            <div className="stk-ws">Sending <strong>{fKES(amt)}</strong></div>
            <div className="stk-blink">⏳ Please wait...</div>
          </div>
        ):(<>
          <div className="confirm-box">
            <div className="confirm-row"><span className="confirm-lbl">M-Pesa Number</span><span className="confirm-val">+{phone}</span></div>
            <div className="confirm-row"><span className="confirm-lbl">Amount</span><span className="confirm-val">{fKES(amt)}</span></div>
            <div className="confirm-row"><span className="confirm-lbl">Fee</span><span className="confirm-val">FREE</span></div>
            <div className="confirm-row"><span className="confirm-lbl">You receive</span><span className="confirm-val" style={{color:"var(--green)"}}>{fKES(amt)}</span></div>
          </div>
          <button className="btn-mpesa" style={{background:"var(--gold)",color:"#000",marginBottom:10}} onClick={confirm}>✓ Confirm Withdrawal</button>
          <button className="btn-ghost" style={{width:"100%"}} onClick={()=>setStep(0)}>← Edit Details</button>
        </>)}
      </div>
    </Modal>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Locked({title,sub,openLogin,openRegister}){
  return(
    <div className="locked">
      <div className="locked-ico">🔒</div>
      <div className="locked-title">{title}</div>
      <div className="locked-sub">{sub}</div>
      <div className="locked-btns">
        <button className="btn-ghost" onClick={openLogin}>Sign In</button>
        <button className="btn-gold" onClick={openRegister}>Register</button>
      </div>
    </div>
  );
}

function CountdownRing({cd,total=5}){
  const r=28;const circ=2*Math.PI*r;
  const offset=circ*(1-(cd/total));
  return(
    <div className="cd-wrap">
      <div className="cd-ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle className="cd-ring-track" cx="32" cy="32" r={r}/>
          <circle className="cd-ring-fill" cx="32" cy="32" r={r}
            strokeDasharray={circ} strokeDashoffset={offset}/>
        </svg>
        <div className="cd-num">{cd}</div>
      </div>
      <div className="cd-lbl">Next Round</div>
    </div>
  );
}

function BetPanel({gs,user,hasBet,cashedOut,betAmt,setBetAmt,autoCO,setAutoCO,onBet,onCashout,onLogin,multRef,md}){
  const [bpTab,setBpTab]=useState("bet");
  const [autoBet,setAutoBet]=useState(false);
  const [autoCOOn,setAutoCOOn]=useState(false);
  const [autoRounds,setAutoRounds]=useState("10");
  const [bounce,setBounce]=useState(false);
  const amt=parseFloat(betAmt)||0;
  const adjust=delta=>{
    const cur=parseFloat(betAmt)||0;
    setBetAmt(String(Math.max(10,cur+delta)));
    setBounce(true);
    setTimeout(()=>setBounce(false),200);
  };
  const multClass=()=>{
    const m=parseFloat(md);
    if(m>=20)return "extreme";
    if(m>=5)return "high";
    return "";
  };
  const BigBtn=()=>{
    if(!user)return<button className="bet-big login-btn" onClick={onLogin}>🔒 Sign In to Play</button>;
    if(gs==="flying"&&hasBet&&!cashedOut)return(
      <button className="bet-big cashout" onClick={()=>onCashout()}>
        CASH OUT ×{md}
      </button>
    );
    if(gs==="waiting")return(
      <button className="bet-big" onClick={onBet} disabled={hasBet}>
        {hasBet?`✓ BET PLACED`:`Bet ${amt.toFixed(2)} KES`}
      </button>
    );
    return<button className="bet-big crashed-btn" disabled>{gs==="crashed"?"Crashed — Next round...":"Waiting..."}</button>;
  };
  return(
    <div className="bpanel">
      <div className="bptabs">
        <button className={`bptab ${bpTab==="bet"?"on":""}`} onClick={()=>setBpTab("bet")}>Bet</button>
        <button className={`bptab ${bpTab==="auto"?"on":""}`} onClick={()=>setBpTab("auto")}>Auto</button>
      </div>
      {bpTab==="bet"&&(<>
        <div className="stepper-row">
          <button className="step-btn" onClick={()=>adjust(-10)} disabled={hasBet}>−</button>
          <input className={`step-val ${bounce?"bounce":""}`} type="number" value={betAmt}
            onChange={e=>setBetAmt(e.target.value)} disabled={hasBet}/>
          <button className="step-btn" onClick={()=>adjust(10)} disabled={hasBet}>+</button>
        </div>
        <div className="qgrid">
          {[100,200,500,10000].map(v=>(
            <button key={v} className="qgbtn" onClick={()=>setBetAmt(String(v))} disabled={hasBet}>
              {v.toLocaleString()}
            </button>
          ))}
        </div>
        <BigBtn/>
        <div className="auto-row">
          <div className="auto-item">
            <span className="auto-lbl">Auto bet</span>
            <label className="toggle">
              <input type="checkbox" checked={autoBet} onChange={e=>setAutoBet(e.target.checked)}/>
              <div className="toggle-track"/><div className="toggle-thumb"/>
            </label>
          </div>
          <div className="auto-item">
            <span className="auto-lbl">Auto Cash Out</span>
            <label className="toggle">
              <input type="checkbox" checked={autoCOOn} onChange={e=>setAutoCOOn(e.target.checked)}/>
              <div className="toggle-track"/><div className="toggle-thumb"/>
            </label>
            {autoCOOn&&(
              <div className="aco-wrap">
                <input className="aco-input" type="number" value={autoCO} onChange={e=>setAutoCO(e.target.value)} min="1.1" step="0.1"/>
                <button className="aco-x" onClick={()=>setAutoCOOn(false)}>×</button>
              </div>
            )}
          </div>
        </div>
      </>)}
      {bpTab==="auto"&&(<>
        <div className="auto-panel">
          <div className="auto-field">
            <span className="auto-flbl">Bet Amount (KES)</span>
            <input className="auto-finput" type="number" value={betAmt} onChange={e=>setBetAmt(e.target.value)}/>
          </div>
          <div className="auto-field">
            <span className="auto-flbl">Number of Rounds</span>
            <input className="auto-finput" type="number" value={autoRounds} onChange={e=>setAutoRounds(e.target.value)} min="1"/>
          </div>
          <div className="auto-field">
            <span className="auto-flbl">Auto Cash Out ×</span>
            <input className="auto-finput" type="number" value={autoCO} onChange={e=>setAutoCO(e.target.value)} min="1.1" step="0.1"/>
          </div>
        </div>
        <button className="bet-big" onClick={onBet} disabled={!user||hasBet||gs!=="waiting"}>
          {!user?"🔒 Sign In to Play":hasBet?"✓ Auto Running...":"Start Auto Bet"}
        </button>
      </>)}
    </div>
  );
}

function LiveChat(){
  const [msgs,setMsgs]=useState(CHAT_MSGS.slice(0,4));
  const [input,setInput]=useState("");
  const feedRef=useRef(null);
  useEffect(()=>{
    const t=setInterval(()=>{
      const m=CHAT_MSGS[Math.floor(Math.random()*CHAT_MSGS.length)];
      setMsgs(p=>[...p.slice(-20),{...m,id:Date.now()}]);
    },3500);
    return()=>clearInterval(t);
  },[]);
  useEffect(()=>{
    if(feedRef.current)feedRef.current.scrollTop=feedRef.current.scrollHeight;
  },[msgs]);
  const send=()=>{
    if(!input.trim())return;
    setMsgs(p=>[...p.slice(-20),{name:"You",color:"gold",text:input,id:Date.now()}]);
    setInput("");
  };
  return(
    <div className="chat-card">
      <div className="rhead">
        <span className="rtitle">💬 Live Chat</span>
        <span className="live"><div className="live-dot"/>Live</span>
      </div>
      <div className="chat-feed" ref={feedRef}>
        {msgs.map((m,i)=>(
          <div key={m.id||i} className="chat-msg">
            <span className={`chat-name ${m.color||""}`}>{m.name}:</span>
            <span className="chat-text">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Say something..." value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button className="chat-send" onClick={send}>Send</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App(){
  const [user,setUser]=useState(null);
  const [appReady,setAppReady]=useState(false);
  const [lightMode,setLightMode]=useState(false);
  const [modal,setModal]=useState(null);
  const [tab,setTab]=useState("game");
  const [ddOpen,setDdOpen]=useState(false);
  const [balance,setBalance]=useState(0);
  const [txns,setTxns]=useState([]);
  const [walletMode,setWalletMode]=useState("deposit");
  const [txnFilter,setTxnFilter]=useState("all");
  const [leaderboard,setLeaderboard]=useState([]);
  const [stats,setStats]=useState({totalWon:0,totalBets:0,biggestWin:0,totalWagered:0,totalLost:0,streak:0,streakType:"win",avgCashout:0,cashoutCount:0});

  // Game state
  const [gs,setGs]=useState("waiting");
  const [mult,setMult]=useState(1);
  const [hasBet,setHasBet]=useState(false);
  const [cashedOut,setCashedOut]=useState(false);
  const [betAmt,setBetAmt]=useState("50");
  const [autoCO,setAutoCO]=useState("2.00");
  const [planePos,setPlanePos]=useState({x:8,y:18});
  const [planeCrashed,setPlaneCrashed]=useState(false);
  const [explodePos,setExplodePos]=useState(null);
  const [cd,setCd]=useState(5);
  const [crashes,setCrashes]=useState([]);
  const [toast,setToast]=useState(null);
  const [pathPts,setPathPts]=useState([]);
  const [players,setPlayers]=useState([]);
  const [winBanner,setWinBanner]=useState(null);
  const [particles,setParticles]=useState([]);
  const [floatNotifs,setFloatNotifs]=useState([]);

  const mRef=useRef(1);
  const gsRef=useRef("waiting");
  const betRef=useRef(false);
  const coRef=useRef(false);
  const autoCORef=useRef("2.00");
  const socketRef=useRef(null);
  const planePosRef=useRef({x:8,y:18});
  autoCORef.current=autoCO;

  // ── SPLASH / AUTO-LOGIN ────────────────────────────────────────────────────
  useEffect(()=>{
    const token=localStorage.getItem("avipesa_token");
    if(!token){setAppReady(true);return;}
    const timer=setTimeout(()=>setAppReady(true),2000);
    fetch(`${API}/auth/me`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.ok?r.json():Promise.reject(r.status))
      .then(data=>{
        setUser(data.user);
        setBalance(data.user.balance||0);
        clearTimeout(timer);
        setAppReady(true);
      })
      .catch(status=>{
        if(status===401)localStorage.removeItem("avipesa_token");
        clearTimeout(timer);
        setAppReady(true);
      });
    return()=>clearTimeout(timer);
  },[]);

  // ── CHECK URL FOR RESET TOKEN ──────────────────────────────────────────────
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const resetToken=params.get("token");
    if(resetToken){setModal({type:"reset",token:resetToken});}
  },[]);

  // ── SOCKET.IO ──────────────────────────────────────────────────────────────
  const connectSocket=useCallback((token)=>{
    if(socketRef.current){socketRef.current.disconnect();}
    const socket=io(SOCKET_URL,{auth:{token:token||""},transports:["websocket"]});
    socketRef.current=socket;

    socket.on("game:state",(data)=>{
      setGs(data.state);
      setMult(data.multiplier||1);
      mRef.current=data.multiplier||1;
      setCd(data.countdown||5);
      setCrashes(data.history||[]);
      setPlayers(data.bets||[]);
      gsRef.current=data.state;
    });

    socket.on("game:waiting",(data)=>{
      gsRef.current="waiting";
      setGs("waiting");
      setMult(1);mRef.current=1;
      setPlanePos({x:8,y:18});
      planePosRef.current={x:8,y:18};
      setPlaneCrashed(false);
      setPathPts([]);
      setCashedOut(false);
      setHasBet(false);
      betRef.current=false;
      coRef.current=false;
      setCrashes(data.history||[]);
      setPlayers(data.bets||[]);
    });

    socket.on("game:countdown",(data)=>{
      setCd(data.countdown);
    });

    socket.on("game:flying",(data)=>{
      gsRef.current="flying";
      setGs("flying");
      setPlaneCrashed(false);
      setPathPts([{x:8,y:82}]);
      setPlayers(data.bets||[]);
    });

    socket.on("game:tick",(data)=>{
      const m=data.multiplier;
      setMult(m);mRef.current=m;
      const elapsed=Math.log(m)/0.35;
      const px=Math.min(8+elapsed*12,78);
      const py=Math.max(82-elapsed*14,6);
      planePosRef.current={x:px,y:py};
      setPlanePos({x:px,y:py});
      setPathPts(p=>[...p.slice(-80),{x:px,y:py}]);
      if(Math.random()<0.3)spawnParticles(px,py);
      setPlayers(data.bets||[]);
    });

    socket.on("game:crashed",(data)=>{
      gsRef.current="crashed";
      setGs("crashed");
      setPlaneCrashed(true);
      setExplodePos({...planePosRef.current});
      setTimeout(()=>setExplodePos(null),800);
      setCrashes(p=>[data.multiplier,...p].slice(0,12));
      setPlayers(data.bets||[]);
      if(betRef.current&&!coRef.current){
        const lost=parseFloat(betRef.current);
        addTxn("loss",`Loss ×${data.multiplier.toFixed(2)}`,-lost);
        setStats(s=>({
          ...s,
          totalLost:s.totalLost+lost,
          streak:s.streakType==="loss"?s.streak+1:1,
          streakType:"loss",
        }));
        toast_(`Crashed ×${data.multiplier.toFixed(2)} — Lost ${fKES(lost)}`,"err");
      }
      betRef.current=false;
      setHasBet(false);
    });

    socket.on("game:bets",(bets)=>{
      setPlayers(bets||[]);
    });

    return socket;
  },[]);

  useEffect(()=>{
    const token=localStorage.getItem("avipesa_token")||"";
    connectSocket(token);
    return()=>{if(socketRef.current)socketRef.current.disconnect();};
  },[connectSocket]);

  // ── FLOAT WIN NOTIFICATIONS ────────────────────────────────────────────────
  useEffect(()=>{
    const t=setInterval(()=>{
      if(gsRef.current==="flying"&&Math.random()<0.3){
        const msg=FLOAT_WINS[Math.floor(Math.random()*FLOAT_WINS.length)];
        const id=Date.now();
        setFloatNotifs(p=>[...p.slice(-3),{id,msg}]);
        setTimeout(()=>setFloatNotifs(p=>p.filter(n=>n.id!==id)),4000);
      }
    },4000);
    return()=>clearInterval(t);
  },[]);

  // ── HELPERS ────────────────────────────────────────────────────────────────
  const toast_=useCallback((msg,type="ok")=>{
    setToast({msg,type});
    setTimeout(()=>setToast(null),3200);
  },[]);

  const addTxn=useCallback((type,label,amount)=>{
    setTxns(p=>[{id:Date.now(),type,label,amount,time:new Date()},...p]);
  },[]);

  const spawnParticles=useCallback((x,y)=>{
    const newP=Array.from({length:4},(_,i)=>({
      id:Date.now()+i,x:x-1,y:y+1,
      size:Math.random()*4+2,
      color:Math.random()>0.5?"#f6c347":"rgba(255,255,255,0.7)",
    }));
    setParticles(p=>[...p.slice(-30),...newP]);
    setTimeout(()=>setParticles(p=>p.filter(pt=>!newP.find(n=>n.id===pt.id))),700);
  },[]);

  // ── BET & CASHOUT ──────────────────────────────────────────────────────────
  const handleBet=()=>{
    if(!user){setModal("login");return;}
    const a=parseFloat(betAmt);
    if(isNaN(a)||a<10){toast_("Minimum bet is KES 10","err");return;}
    if(a>balance){toast_("Insufficient balance — deposit first","err");return;}
    socketRef.current.emit("bet:place",{amount:a});
    socketRef.current.once("bet:result",(result)=>{
      if(result.ok){
        setBalance(result.balance);
        setHasBet(true);
        betRef.current=String(a);
        setStats(s=>({...s,totalBets:s.totalBets+1,totalWagered:s.totalWagered+a}));
        toast_(`Bet placed — KES ${a}`);
      }else{
        toast_(result.error,"err");
      }
    });
  };

  const doCashout=useCallback(()=>{
    if(!betRef.current||coRef.current)return;
    socketRef.current.emit("bet:cashout");
    socketRef.current.once("cashout:result",(result)=>{
      if(result.ok){
        coRef.current=true;
        setCashedOut(true);
        setBalance(result.balance);
        addTxn("win",`Win ×${result.mult.toFixed(2)}`,result.profit);
        setWinBanner(`🏆 ×${result.mult.toFixed(2)} — Won ${fKES(result.payout)}!`);
        setTimeout(()=>setWinBanner(null),3000);
        setStats(s=>{
          const newCount=s.cashoutCount+1;
          const newAvg=parseFloat(((s.avgCashout*s.cashoutCount+result.mult)/newCount).toFixed(2));
          return{...s,totalWon:s.totalWon+result.profit,biggestWin:Math.max(s.biggestWin,result.mult),streak:s.streakType==="win"?s.streak+1:1,streakType:"win",cashoutCount:newCount,avgCashout:newAvg};
        });
        toast_(`🏆 Cashed out ×${result.mult.toFixed(2)} — Won ${fKES(result.payout)}!`);
      }else{
        toast_(result.error,"err");
      }
    });
  },[addTxn,toast_]);

  // ── PAGE DATA FETCHING ─────────────────────────────────────────────────────
  useEffect(()=>{
    if(tab==="history"&&user){
      fetch(`${API}/wallet/transactions`,{headers:{Authorization:`Bearer ${localStorage.getItem("avipesa_token")}`}})
        .then(r=>r.ok?r.json():null)
        .then(data=>{
          if(data)setTxns(data.map(t=>({...t,time:new Date(t.created_at)})));
        }).catch(()=>{});
    }
  },[tab,user]);

  useEffect(()=>{
    if(tab==="leaderboard"){
      fetch(`${API}/game/leaderboard`)
        .then(r=>r.ok?r.json():null)
        .then(data=>{
          if(data)setLeaderboard(data.map(p=>({name:p.name,total:p.total_won,bets:p.total_bets,best:p.best_cashout})));
        }).catch(()=>{});
    }
  },[tab]);

  useEffect(()=>{
    if(tab==="stats"&&user){
      fetch(`${API}/game/stats`,{headers:{Authorization:`Bearer ${localStorage.getItem("avipesa_token")}`}})
        .then(r=>r.ok?r.json():null)
        .then(data=>{
          if(data)setStats(data);
        }).catch(()=>{});
    }
  },[tab,user]);

  // ── AUTH HANDLERS ──────────────────────────────────────────────────────────
  const handleLogin=useCallback((u,customMsg)=>{
    setUser(u);
    setBalance(u.balance||0);
    toast_(customMsg||`Welcome, ${u.name.split(" ")[0]}! 🎮`);
    // Reconnect socket with new token
    const token=localStorage.getItem("avipesa_token")||"";
    connectSocket(token);
  },[connectSocket,toast_]);

  const handleLogout=()=>{
    localStorage.removeItem("avipesa_token");
    if(socketRef.current)socketRef.current.disconnect();
    connectSocket("");
    setUser(null);setBalance(0);setDdOpen(false);
    setHasBet(false);betRef.current=false;
    toast_("Signed out");
  };

  const handleDeposit=(newBalance,amt)=>{
    setBalance(newBalance);
    addTxn("dep","M-Pesa Deposit",amt);
    toast_(`${fKES(amt)} deposited ✓`);
  };

  const handleWithdraw=(newBalance,amt)=>{
    setBalance(newBalance);
    addTxn("wd","M-Pesa Withdrawal",-amt);
    toast_(`${fKES(amt)} sent to M-Pesa ✓`);
  };

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const md=mult.toFixed(2);
  const multClass=()=>{const m=parseFloat(md);if(m>=20)return "extreme";if(m>=5)return "high";return "";};

  const svgPath=pathPts.length>1
    ?"M "+pathPts.map(p=>`${(p.x/100)*420} ${(p.y/100)*280}`).join(" L ")
    :"";

  const filteredTxns=txns.filter(t=>{
    if(txnFilter==="all")return true;
    if(txnFilter==="deposits")return t.type==="dep";
    if(txnFilter==="wins")return t.type==="win";
    if(txnFilter==="losses")return t.type==="loss";
    if(txnFilter==="withdrawals")return t.type==="wd";
    return true;
  });

  const openLogin=()=>setModal("login");
  const openRegister=()=>setModal("register");
  const rankCls=i=>i===0?"gold":i===1?"silver":i===2?"bronze":"";
  const rankLabel=i=>i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`;

  const stars=useRef(Array.from({length:18},(_,i)=>({
    id:i,x:Math.random()*100,y:Math.random()*100,
    size:Math.random()*1.5+0.5,op:Math.random()*0.4+0.2,
    d:(Math.random()*3+2)+"s",delay:(Math.random()*3)+"s",
  }))).current;

  const PlayerList=({limit})=>(
    <div className="plist">
      {players.slice(0,limit||players.length).map((p,i)=>(
        <div key={p.id||i} className={`prow ${p.cashed?"cashed":""}`}>
          <div><div className="pname">{p.name}</div><div className="pbet">KES {p.bet}</div></div>
          {gs==="flying"&&!p.cashed&&<div className="pmult">{md}×</div>}
          {p.cashed&&<div className="pmult cashed">✓ {p.cashMult}×</div>}
          {gs!=="flying"&&!p.cashed&&<div style={{fontSize:11,color:"var(--t3)"}}>—</div>}
        </div>
      ))}
    </div>
  );

  // ── SPLASH SCREEN ──────────────────────────────────────────────────────────
  if(!appReady){
    return(
      <div className="splash">
        <div style={{fontSize:44,marginBottom:4}}>✈</div>
        <div className="splash-logo">Avi<span>Pesa</span></div>
        <div className="splash-ring"/>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return(
    <div className={`root ${lightMode?"light":""}`} onClick={()=>ddOpen&&setDdOpen(false)}>
      {toast&&<div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="float-notif">
        {floatNotifs.map(n=><div key={n.id} className="fnotif">{n.msg}</div>)}
      </div>

      <nav className="nav">
        <div className="nav-i">
          <div className="logo" onClick={()=>setTab("game")}>
            <div className="logo-m">✈</div>
            <div className="logo-t">Avi<span>Pesa</span></div>
          </div>
          <div className="ntabs">
            {[{id:"game",icon:"🎮",label:"Game"},{id:"wallet",icon:"💳",label:"Wallet"},{id:"history",icon:"📋",label:"History"},{id:"leaderboard",icon:"🏆",label:"Leaders"},{id:"stats",icon:"📊",label:"My Stats"}].map(t=>(
              <button key={t.id} className={`ntab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <div className="nav-r">
            <button className="theme-btn" onClick={()=>setLightMode(l=>!l)}>{lightMode?"🌙":"☀️"}</button>
            {user?(<>
              <div className="bal-pill">
                <div><div className="bal-lbl">Balance</div><div className="bal-v">{fKES(balance)}</div></div>
              </div>
              <button className="dep-btn" onClick={()=>setModal("deposit")}>
                <span>📲</span><span className="dep-txt">Deposit</span>
              </button>
              <div className="av-wrap" onClick={e=>e.stopPropagation()}>
                <div className="av-btn" onClick={()=>setDdOpen(o=>!o)}>{user.name[0].toUpperCase()}</div>
                {ddOpen&&(
                  <div className="dropdown">
                    <div className="dd-top">
                      <div className="dd-name">{user.name}</div>
                      <div className="dd-email">{user.email}</div>
                    </div>
                    {[{id:"game",icon:"🎮",label:"Game"},{id:"wallet",icon:"💳",label:"Wallet"},{id:"history",icon:"📋",label:"History"},{id:"leaderboard",icon:"🏆",label:"Leaderboard"},{id:"stats",icon:"📊",label:"My Stats"}].map(t=>(
                      <button key={t.id} className="dd-item" onClick={()=>{setTab(t.id);setDdOpen(false);}}>{t.icon} {t.label}</button>
                    ))}
                    <button className="dd-item" onClick={()=>{setModal("deposit");setDdOpen(false);}}>📲 Deposit</button>
                    <div className="dd-sep"/>
                    <button className="dd-item red" onClick={handleLogout}>🚪 Sign Out</button>
                  </div>
                )}
              </div>
            </>):(
              <div className="nav-auth">
                <button className="btn-ghost" onClick={openLogin}>Sign In</button>
                <button className="btn-gold" onClick={openRegister}>Register</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="mob-tabs">
        {[{id:"game",icon:"🎮",label:"Game"},{id:"wallet",icon:"💳",label:"Wallet"},{id:"history",icon:"📋",label:"History"},{id:"leaderboard",icon:"🏆",label:"Leaders"},{id:"stats",icon:"📊",label:"Stats"}].map(t=>(
          <button key={t.id} className={`mtab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
            <span className="ico">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* MODALS */}
      {modal==="login"&&<LoginModal onClose={()=>setModal(null)} onLogin={handleLogin} goRegister={()=>setModal("register")} goRecover={()=>setModal("recover")}/>}
      {modal==="register"&&<RegisterModal onClose={()=>setModal(null)} onLogin={handleLogin} goLogin={()=>setModal("login")}/>}
      {modal==="recover"&&<RecoverModal onClose={()=>setModal(null)} goLogin={()=>setModal("login")}/>}
      {modal==="deposit"&&<DepositModal onClose={()=>setModal(null)} onDeposit={handleDeposit}/>}
      {modal==="withdraw"&&<WithdrawModal onClose={()=>setModal(null)} balance={balance} onWithdraw={handleWithdraw}/>}
      {modal&&modal.type==="reset"&&(
        <ResetPasswordModal
          token={modal.token}
          onClose={()=>setModal(null)}
          onLogin={handleLogin}
          goRecover={()=>setModal("recover")}
        />
      )}

      {/* GAME TAB */}
      {tab==="game"&&(
        <div className="layout">
          <div>
            <div className="gcard">
              <div className="gtopbar">
                <div className="live"><div className="live-dot"/>Live Round</div>
                <div className={`rbadge ${gs}`}>
                  {gs==="waiting"?`Next in ${cd}s`:gs==="crashed"?"CRASHED":"IN PLAY"}
                </div>
              </div>

              <div className="canvas">
                <div className="stars">
                  {stars.map(s=>(
                    <div key={s.id} className="star" style={{
                      left:`${s.x}%`,top:`${s.y}%`,
                      width:s.size,height:s.size,opacity:s.op,
                      "--d":s.d,"--delay":s.delay,"--op":s.op,
                    }}/>
                  ))}
                </div>

                {gs==="flying"&&particles.map(p=>(
                  <div key={p.id} className="particle" style={{
                    left:`${p.x}%`,bottom:`${p.y}%`,
                    width:p.size,height:p.size,
                    background:p.color,
                    boxShadow:`0 0 ${p.size*2}px ${p.color}`,
                  }}/>
                ))}

                {explodePos&&(
                  <div className="crash-explode" style={{left:`${explodePos.x}%`,bottom:`${explodePos.y}%`,fontSize:32}}>💥</div>
                )}

                <svg className="csvg" viewBox="0 0 420 280" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="flGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f6c347" stopOpacity="0.14"/>
                      <stop offset="100%" stopColor="#f6c347" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="crGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.12"/>
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {gs==="flying"&&svgPath&&(<>
                    <path d={svgPath+` L ${(planePos.x/100)*420} 280 L ${(8/100)*420} 280 Z`} fill="url(#flGrad)"/>
                    <path d={svgPath} fill="none" stroke="rgba(246,195,71,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </>)}
                  {gs==="crashed"&&svgPath&&(<>
                    <path d={svgPath+` L ${(planePos.x/100)*420} 280 L ${(8/100)*420} 280 Z`} fill="url(#crGrad)"/>
                    <path d={svgPath} fill="none" stroke="rgba(244,63,94,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </>)}
                </svg>

                {gs==="waiting"&&(
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <CountdownRing cd={cd} total={5}/>
                  </div>
                )}

                {(gs==="flying"||(gs==="crashed"&&!planeCrashed))&&(
                  <div className={`plane ${planeCrashed?"crashed-spin":""}`}
                    style={{left:`${planePos.x}%`,bottom:`${planePos.y}%`}}>
                    <PlaneSVG size={40}/>
                  </div>
                )}

                {gs!=="waiting"&&(
                  <div className="mult-wrap">
                    <div className={`mult-num ${gs} ${gs==="flying"?multClass():""}`}>{`${md}×`}</div>
                    <div className={`mult-sub ${gs}`}>{gs==="crashed"?"CRASHED!":"FLYING"}</div>
                  </div>
                )}

                {winBanner&&<div className="win-banner">{winBanner}</div>}
              </div>

              <div className="cbar">
                <span className="cbar-lbl">Recent</span>
                {crashes.map((v,i)=>(
                  <span key={i} className={`cbadge ${cbCls(v)} ${i===0?"new":""}`}>{Number(v).toFixed(2)}×</span>
                ))}
              </div>

              <BetPanel
                gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
                betAmt={betAmt} setBetAmt={setBetAmt}
                autoCO={autoCO} setAutoCO={setAutoCO}
                onBet={handleBet} onCashout={doCashout}
                onLogin={()=>setModal("login")}
                multRef={mRef} md={md}
              />
            </div>
          </div>

          <div className="rcol">
            <div className="rcard">
              <div className="rhead">
                <span className="rtitle">Active Players</span>
                <span className="rbg">{players.length}</span>
              </div>
              <PlayerList/>
            </div>
            <div className="rcard">
              <div className="rhead"><span className="rtitle">Quick Deposit</span><span className="mpesa-tag">M-PESA</span></div>
              <div className="wmini">
                {user?(<>
                  <div className="wm-bal">
                    <div className="wm-lbl">Your Balance</div>
                    <div className="wm-amt">{fKES(balance)}</div>
                    <div className="wm-sub">AviPesa Wallet</div>
                  </div>
                  <button className="btn-mpesa" onClick={()=>setModal("deposit")}><span>📲</span>Deposit via M-Pesa</button>
                </>):(
                  <div style={{textAlign:"center",padding:"12px 0"}}>
                    <div style={{fontSize:26,marginBottom:8}}>💳</div>
                    <div style={{fontSize:12,color:"var(--t2)",marginBottom:12,lineHeight:1.6}}>Sign in to deposit and start playing</div>
                    <button className="btn-mpesa" onClick={openLogin}>Sign In to Deposit</button>
                  </div>
                )}
              </div>
            </div>
            <LiveChat/>
          </div>

          <div className="mob-players">
            <div className="rhead"><span className="rtitle">Active Players</span><span className="rbg">{players.length}</span></div>
            <PlayerList limit={5}/>
          </div>
        </div>
      )}

      {/* WALLET TAB */}
      {tab==="wallet"&&(
        <div className="page">
          <div className="pcard">
            {!user?(<Locked title="Wallet Locked" sub="Sign in to view your balance, deposit or withdraw." openLogin={openLogin} openRegister={openRegister}/>):(<>
              <div className="pcard-head"><div className="pcard-title">My Wallet</div><div className="pcard-sub">Manage your AviPesa funds</div></div>
              <div className="pcard-body">
                <div className="big-bal">
                  <div className="bb-lbl">Available Balance</div>
                  <div className="bb-amt">{fKES(balance)}</div>
                  <div className="bb-sub">Kenyan Shilling • AviPesa Account</div>
                </div>
                <div className="tab-row">
                  <button className={`tabbtn ${walletMode==="deposit"?"on":""}`} onClick={()=>setWalletMode("deposit")}>⬇ Deposit</button>
                  <button className={`tabbtn ${walletMode==="withdraw"?"on2":""}`} onClick={()=>setWalletMode("withdraw")}>⬆ Withdraw</button>
                </div>
                {walletMode==="deposit"?(
                  <div>
                    <div className="fg"><label className="flbl">M-Pesa Number</label><PhoneInput value="254" onChange={()=>{}}/></div>
                    <div className="fg"><label className="flbl">Amount (KES)</label>
                      <input className="finput" type="number" placeholder="Minimum KES 10"/>
                      <div className="presets">{[100,500,1000,2000,5000].map(v=>(<button key={v} className="preset">{v}</button>))}</div>
                    </div>
                    <button className="btn-mpesa" onClick={()=>setModal("deposit")}><span>📲</span>Proceed to Deposit</button>
                    <div className="fhint" style={{textAlign:"center",marginTop:9}}>STK push will be sent to your Safaricom line</div>
                  </div>
                ):(
                  <div>
                    <div style={{background:"rgba(246,195,71,0.06)",border:"1px solid rgba(246,195,71,0.15)",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                      <div style={{fontSize:11,color:"var(--t2)",marginBottom:4}}>Available to withdraw</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:"var(--green)"}}>{fKES(balance)}</div>
                    </div>
                    <button className="btn-mpesa" style={{background:"var(--gold)",color:"#000"}} onClick={()=>setModal("withdraw")}>⬆ Withdraw Funds</button>
                    <div className="fhint" style={{textAlign:"center",marginTop:9}}>Funds sent to M-Pesa within 2 minutes • Min KES 100</div>
                  </div>
                )}
              </div>
            </>)}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab==="history"&&(
        <div className="page wide">
          <div className="pcard">
            {!user?(<Locked title="History Locked" sub="Sign in to view your full betting and transaction history." openLogin={openLogin} openRegister={openRegister}/>):(<>
              <div className="pcard-head"><div className="pcard-title">Transaction History</div><div className="pcard-sub">{filteredTxns.length} records</div></div>
              <div className="filter-row">
                {[{k:"all",l:"All"},{k:"deposits",l:"Deposits"},{k:"wins",l:"Wins"},{k:"losses",l:"Losses"},{k:"withdrawals",l:"Withdrawals"}].map(f=>(
                  <button key={f.k} className={`fpill ${txnFilter===f.k?"on":""}`} onClick={()=>setTxnFilter(f.k)}>{f.l}</button>
                ))}
              </div>
              {filteredTxns.length===0&&<div className="nodata">No {txnFilter} yet.</div>}
              {filteredTxns.map(t=>(
                <div key={t.id} className="hist-row">
                  <div className="hist-l">
                    <div className={`hist-ico ${t.type}`}>{t.type==="dep"?"⬇":t.type==="win"?"🏆":t.type==="wd"?"⬆":"✈"}</div>
                    <div>
                      <div className="hist-desc">{t.label}</div>
                      <div className="hist-time">{fDate(t.time)} • {fTime(t.time)}</div>
                    </div>
                  </div>
                  <div className={`hist-amt ${t.amount>=0?"pos":"neg"}`}>{t.amount>=0?"+":""}{fKES(Math.abs(t.amount))}</div>
                </div>
              ))}
            </>)}
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {tab==="leaderboard"&&(
        <div className="page wide">
          <div className="pcard">
            <div className="pcard-head"><div className="pcard-title">🏆 Leaderboard</div><div className="pcard-sub">Top players this month</div></div>
            {leaderboard.length===0&&<div className="nodata">Loading leaderboard...</div>}
            {leaderboard.map((p,i)=>(
              <div key={i} className="lb-row">
                <div className={`lb-rank ${rankCls(i)}`}>{rankLabel(i)}</div>
                <div className="lb-av">{p.name[0]}</div>
                <div style={{flex:1}}><div className="lb-name">{p.name}</div><div className="lb-sub">{p.bets} bets • Best ×{Number(p.best).toFixed(2)}</div></div>
                <div className="lb-amt">{fKES(p.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {tab==="stats"&&(
        <div className="page">
          <div className="pcard">
            {!user?(<Locked title="Stats Locked" sub="Sign in to see your personal statistics and performance." openLogin={openLogin} openRegister={openRegister}/>):(<>
              <div className="pcard-head"><div className="pcard-title">📊 My Stats</div><div className="pcard-sub">Your performance overview</div></div>
              <div className="pcard-body">
                <div className="streak-bar">
                  <div className="streak-ico">{stats.streakType==="win"?"🔥":"❄️"}</div>
                  <div>
                    <div className={`streak-val ${stats.streakType==="win"?"win-s":"loss-s"}`}>{stats.streak} {stats.streakType==="win"?"Win":"Loss"} Streak</div>
                    <div className="streak-lbl">Current streak</div>
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-ico">🎮</div><div className="stat-val gold">{stats.totalBets}</div><div className="stat-lbl">Total Bets</div></div>
                  <div className="stat-card"><div className="stat-ico">🏆</div><div className="stat-val green">{fKES(stats.totalWon)}</div><div className="stat-lbl">Total Won</div></div>
                  <div className="stat-card"><div className="stat-ico">💸</div><div className="stat-val red">{fKES(stats.totalLost||0)}</div><div className="stat-lbl">Total Lost</div></div>
                  <div className="stat-card"><div className="stat-ico">🚀</div><div className="stat-val gold">{stats.biggestWin>0?`×${Number(stats.biggestWin).toFixed(2)}`:"—"}</div><div className="stat-lbl">Best Cashout</div></div>
                  <div className="stat-card"><div className="stat-ico">📊</div><div className="stat-val">{stats.avgCashout>0?`×${Number(stats.avgCashout).toFixed(2)}`:"—"}</div><div className="stat-lbl">Avg Cashout</div></div>
                  <div className="stat-card"><div className="stat-ico">💰</div><div className="stat-val">{fKES(stats.totalWagered||0)}</div><div className="stat-lbl">Total Wagered</div></div>
                  <div className="stat-card"><div className="stat-ico">🎯</div><div className="stat-val">{stats.totalBets>0?`${Math.round((stats.cashoutCount/stats.totalBets)*100)}%`:"—"}</div><div className="stat-lbl">Win Rate</div></div>
                  <div className="stat-card"><div className="stat-ico">📈</div><div className={`stat-val ${(stats.totalWon-(stats.totalLost||0))>=0?"green":"red"}`}>{fKES(stats.totalWon-(stats.totalLost||0))}</div><div className="stat-lbl">Net Profit</div></div>
                </div>
                <div style={{background:"var(--s)",border:"1px solid var(--b)",borderRadius:12,padding:14}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--t2)",marginBottom:10}}>Account</div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}><span style={{color:"var(--t2)"}}>Name</span><span style={{fontWeight:600}}>{user.name}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}><span style={{color:"var(--t2)"}}>Email</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{user.email}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"var(--t2)"}}>Balance</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"var(--green)",fontWeight:700}}>{fKES(balance)}</span></div>
                </div>
              </div>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}