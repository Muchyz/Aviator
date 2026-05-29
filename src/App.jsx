import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Zap, Wallet, History, Trophy, BarChart2, LogOut,
  Eye, EyeOff, X, Plus, Minus, ArrowDownCircle,
  ArrowUpCircle, Send, Activity, TrendingUp, DollarSign,
  Award, Sun, Moon, Users, Lock, Target, Percent,
  Check, RefreshCw
} from "lucide-react";

(() => {
  if (document.getElementById("av-fonts")) return;
  const l = document.createElement("link");
  l.id = "av-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
  document.head.appendChild(l);
})();

const API = "https://aviator-backend-production-1de1.up.railway.app/api";
const SOCKET_URL = "https://aviator-backend-production-1de1.up.railway.app";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07090f;--surface:#0d1017;--card:#111520;--card2:#171d2e;
  --border:rgba(255,255,255,0.06);--border-md:rgba(255,255,255,0.11);--border-strong:rgba(255,255,255,0.18);
  --blue:#3b82f6;--blue-dim:rgba(59,130,246,0.1);--blue-border:rgba(59,130,246,0.3);
  --green:#22c55e;--green-dim:rgba(34,197,94,0.1);--green-border:rgba(34,197,94,0.28);
  --red:#f43f5e;--red-dim:rgba(244,63,94,0.1);--red-border:rgba(244,63,94,0.28);
  --amber:#f59e0b;--amber-dim:rgba(245,158,11,0.1);--amber-border:rgba(245,158,11,0.28);
  --purple:#a855f7;--mpesa:#16a34a;--mpesa-h:#15803d;
  --text:#e2e8f0;--text2:#64748b;--text3:#334155;
}
html,body{width:100%;overflow-x:hidden;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--border-md);border-radius:4px}
.root{min-height:100vh;width:100%;overflow-x:hidden;padding-bottom:60px;}

/* NAV */
.nav{position:sticky;top:0;z-index:400;height:54px;background:rgba(7,9,15,0.96);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);}
.nav-i{max-width:1280px;margin:0 auto;height:100%;padding:0 14px;display:flex;align-items:center;gap:6px;}
.logo{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;flex-shrink:0;}
.logo-icon{width:30px;height:30px;border-radius:8px;background:var(--blue);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.logo-text{font-size:16px;font-weight:800;letter-spacing:-0.4px;}
.logo-text span{color:var(--blue)}
.ntabs{display:none;gap:1px;margin:0 10px;flex:1;}
.ntab{padding:6px 12px;border-radius:7px;border:none;background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.14s;display:flex;align-items:center;gap:5px;white-space:nowrap;}
.ntab:hover{color:var(--text);background:rgba(255,255,255,0.04)}
.ntab.on{background:var(--blue-dim);color:var(--blue);}
.nav-r{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:auto}
.bal-chip{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:5px 10px;}
.bal-lbl{font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text2)}
.bal-val{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--green)}
.btn-dep{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:none;background:var(--mpesa);color:#fff;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.14s;white-space:nowrap;}
.btn-dep:hover{background:var(--mpesa-h)}
.dep-lbl{display:none}
.icon-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.14s;flex-shrink:0;}
.icon-btn:hover{color:var(--text);border-color:var(--border-strong)}
.av-wrap{position:relative}
.av-btn{width:34px;height:34px;border-radius:8px;background:var(--blue);border:none;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;cursor:pointer;transition:background 0.14s;}
.av-btn:hover{background:#2563eb}
.dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:196px;z-index:500;background:var(--card2);border:1px solid var(--border-md);border-radius:12px;padding:5px;box-shadow:0 16px 48px rgba(0,0,0,0.6);animation:fdDown 0.14s ease;}
@keyframes fdDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.dd-top{padding:9px 11px 11px;border-bottom:1px solid var(--border);margin-bottom:4px}
.dd-name{font-size:13px;font-weight:700}.dd-phone{font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:2px}
.dd-item{display:flex;align-items:center;gap:7px;width:100%;padding:8px 11px;border-radius:7px;border:none;background:transparent;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;text-align:left;transition:background 0.1s;}
.dd-item:hover{background:rgba(255,255,255,0.04)}.dd-item.danger{color:var(--red)}.dd-sep{height:1px;background:var(--border);margin:4px 0}
.nav-auth{display:flex;gap:5px}
.btn-ghost{padding:6px 12px;border-radius:8px;border:1px solid var(--border-md);background:transparent;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.14s;white-space:nowrap;}
.btn-ghost:hover{border-color:var(--border-strong)}
.btn-primary{padding:6px 12px;border-radius:8px;border:none;background:var(--blue);color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.14s;white-space:nowrap;}
.btn-primary:hover{background:#2563eb}

/* MOBILE BOTTOM NAV */
.mob-tabs{display:flex;background:rgba(7,9,15,0.97);border-top:1px solid var(--border);position:fixed;bottom:0;left:0;right:0;z-index:400;}
.mtab{flex:1;padding:8px 0 6px;border:none;background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:10px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all 0.14s;min-height:50px;}
.mtab.on{color:var(--blue)}

/* MODAL */
.overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;animation:ovIn 0.15s ease;}
@keyframes ovIn{from{opacity:0}to{opacity:1}}
.modal{width:100%;max-width:480px;background:var(--card2);border:1px solid var(--border-md);border-radius:20px 20px 0 0;max-height:92vh;overflow-y:auto;box-shadow:0 -16px 48px rgba(0,0,0,0.6);animation:mSlide 0.26s cubic-bezier(0.32,0.72,0,1);}
@keyframes mSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-drag{width:36px;height:4px;border-radius:2px;background:var(--border-md);margin:12px auto 0;}
.mhead{padding:14px 18px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;}
.mtitle{font-size:17px;font-weight:800;letter-spacing:-0.3px}.msub{font-size:12px;color:var(--text2);margin-top:2px}
.mclose{width:30px;height:30px;border-radius:7px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.14s;flex-shrink:0;margin-left:10px;}
.mclose:hover{color:var(--text);border-color:var(--border-strong)}.mbody{padding:18px 18px 30px}

/* FORMS */
.fg{margin-bottom:13px}.flbl{display:block;font-size:10px;font-weight:700;letter-spacing:0.7px;text-transform:uppercase;color:var(--text2);margin-bottom:5px;}
.finput{width:100%;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:10px 13px;color:var(--text);font-family:'Inter',sans-serif;font-size:14px;outline:none;transition:border-color 0.14s,box-shadow 0.14s;-webkit-appearance:none;}
.finput:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,0.1)}.finput.err-f{border-color:var(--red)}.finput::placeholder{color:var(--text3)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fhint{font-size:11px;color:var(--text2);margin-top:4px;line-height:1.5}
.ferr-i{font-size:11px;color:var(--red);margin-top:3px}
.flink{color:var(--blue);font-size:12px;font-weight:600;background:none;border:none;cursor:pointer;padding:0}.flink:hover{text-decoration:underline}
.ffoot{text-align:center;margin-top:12px;font-size:13px;color:var(--text2)}
.ferr{background:var(--red-dim);border:1px solid var(--red-border);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--red);margin-bottom:12px;}
.btn-form{width:100%;padding:12px;border-radius:9px;border:none;background:var(--blue);color:#fff;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:background 0.14s;}
.btn-form:hover{background:#2563eb}.btn-form:disabled{opacity:0.4;cursor:not-allowed}
.btn-mpesa-f{width:100%;padding:12px;border-radius:9px;border:none;background:var(--mpesa);color:#fff;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:background 0.14s;display:flex;align-items:center;justify-content:center;gap:7px;}
.btn-mpesa-f:hover{background:var(--mpesa-h)}.btn-mpesa-f:disabled{opacity:0.4;cursor:not-allowed}
.presets{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap}
.preset{padding:5px 10px;background:var(--surface);border:1px solid var(--border-md);border-radius:6px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:12px;cursor:pointer;transition:all 0.12s;}
.preset:hover{border-color:var(--mpesa);color:var(--mpesa)}
.phone-wrap{display:flex;border:1px solid var(--border-md);border-radius:8px;overflow:hidden;background:var(--surface);transition:border-color 0.14s}
.phone-wrap:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
.phone-flag{padding:0 11px;display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--text2);border-right:1px solid var(--border);background:var(--card);white-space:nowrap;flex-shrink:0}
.phone-inp{flex:1;background:transparent;border:none;padding:10px 12px;color:var(--text);font-family:'Inter',sans-serif;font-size:14px;outline:none;min-width:0;}
.phone-inp::placeholder{color:var(--text3)}
.pw-wrap{position:relative}.pw-wrap .finput{padding-right:42px}
.pw-eye{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text2);cursor:pointer;display:flex;align-items:center;padding:4px;}
.pw-eye:hover{color:var(--text)}
.stk-wait{text-align:center;padding:24px 0}
.stk-ico{width:52px;height:52px;border-radius:14px;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--green)}
.stk-title{font-size:17px;font-weight:700;margin-bottom:6px}.stk-sub{color:var(--text2);font-size:13px;line-height:1.6}
.stk-blink{color:var(--mpesa);font-size:12px;font-weight:700;margin-top:12px;animation:blk 1.1s infinite}
@keyframes blk{0%,100%{opacity:1}50%{opacity:0.3}}

/* LAYOUT */
.layout{display:flex;flex-direction:column;gap:10px;padding:10px 10px;width:100%;max-width:1280px;margin:0 auto;}

/* GAME CARD */
.gcard{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;width:100%;}
.gtopbar{padding:9px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.live-ind{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text2)}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:blk 1.4s infinite}
.rbadge{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:5px;background:var(--surface);border:1px solid var(--border-md);color:var(--text2);}
.rbadge.flying{color:var(--amber);border-color:var(--amber-border);background:var(--amber-dim)}
.rbadge.crashed{color:var(--red);border-color:var(--red-border);background:var(--red-dim)}

/* CANVAS WRAPPER */
.canvas-wrap{position:relative;height:220px;background:#040710;overflow:hidden;}
.av-canvas{position:absolute;inset:0;width:100%;height:100%;}
.plane-el{position:absolute;pointer-events:none;transform:translate(-50%,-50%);filter:drop-shadow(0 0 8px rgba(245,158,11,0.8));transition:filter 0.2s;z-index:2;}
.plane-el.crashed{filter:drop-shadow(0 0 10px rgba(244,63,94,0.9));animation:crashSpin 0.55s ease forwards;}
@keyframes crashSpin{0%{transform:translate(-50%,-50%) rotate(0deg) scale(1)}60%{transform:translate(-50%,-50%) rotate(210deg) scale(1.2)}100%{transform:translate(-50%,-50%) rotate(380deg) scale(0);opacity:0}}
.mult-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;user-select:none;z-index:3;}
.mult-num{font-family:'JetBrains Mono',monospace;font-size:52px;font-weight:700;line-height:1;letter-spacing:-2px;}
.mult-num.waiting{color:var(--text3)}
.mult-num.flying{color:var(--amber)}
.mult-num.flying.hi5{color:#f97316}
.mult-num.flying.hi10{color:var(--purple);animation:bigPulse 0.28s ease infinite}
.mult-num.crashed{color:var(--red);animation:shakeAnim 0.35s ease}
@keyframes bigPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes shakeAnim{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.mult-lbl{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:5px;color:var(--text2)}
.mult-lbl.flying{color:var(--amber)}.mult-lbl.crashed{color:var(--red)}
.win-flash{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:10;background:var(--green-dim);border:1px solid var(--green-border);border-radius:8px;padding:5px 16px;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green);white-space:nowrap;animation:popIn 0.22s ease}
@keyframes popIn{from{opacity:0;transform:translateX(-50%) scale(0.85)}to{opacity:1;transform:translateX(-50%) scale(1)}}
.cd-outer{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:7px;z-index:3;}
.cd-ring{position:relative;width:70px;height:70px}
.cd-ring svg{transform:rotate(-90deg)}
.cd-track{fill:none;stroke:var(--border-md);stroke-width:3}
.cd-fill{fill:none;stroke:var(--blue);stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset 0.9s linear}
.cd-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--blue)}
.cd-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2)}

/* CRASH HISTORY */
.cbar{display:flex;align-items:center;gap:5px;padding:7px 14px;border-bottom:1px solid var(--border);overflow-x:auto;min-height:36px;}
.cbar::-webkit-scrollbar{display:none}
.cbar-lbl{font-size:9px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text3);flex-shrink:0;margin-right:3px}
.cbadge{padding:2px 7px;border-radius:4px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;border:1px solid transparent;}
.cbadge.lo{background:var(--blue-dim);color:var(--blue);border-color:var(--blue-border)}
.cbadge.mi{background:rgba(100,116,139,0.1);color:#94a3b8;border-color:rgba(100,116,139,0.18)}
.cbadge.hi{background:rgba(168,85,247,0.1);color:var(--purple);border-color:rgba(168,85,247,0.22)}
.cbadge.new{animation:badgePop 0.32s cubic-bezier(0.175,0.885,0.32,1.275)}
@keyframes badgePop{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}

/* BET PANEL */
.bpanel{padding:12px 14px 16px}
.bptabs{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:3px;margin-bottom:14px;gap:2px}
.bptab{flex:1;padding:7px;border-radius:6px;border:none;background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.14s}
.bptab.on{background:var(--card2);color:var(--text);}

/* STEPPER FIX */
.stepper-row{display:flex;align-items:center;gap:6px;margin-bottom:10px;width:100%;}
.step-btn{width:40px;height:42px;min-width:40px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.12s;}
.step-btn:hover:not(:disabled){border-color:var(--border-strong);background:var(--card2)}
.step-btn:disabled{opacity:0.3;cursor:not-allowed}
.step-val{flex:1;min-width:0;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:9px 6px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;text-align:center;outline:none;-webkit-appearance:none;width:100%;transition:border-color 0.14s;}
.step-val:focus{border-color:var(--blue)}
.step-val:disabled{opacity:0.35}

.qgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:12px}
.qgbtn{padding:8px 4px;background:var(--surface);border:1px solid var(--border);border-radius:7px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.12s;text-align:center;}
.qgbtn:hover:not(:disabled){border-color:var(--border-strong);color:var(--text)}
.qgbtn:disabled{opacity:0.3;cursor:not-allowed}
.bet-cta{width:100%;padding:14px;border-radius:10px;border:none;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.14s;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:7px;}
.bet-cta.place{background:var(--green);color:#fff;}
.bet-cta.place:hover:not(:disabled){background:#16a34a}
.bet-cta.place:disabled{opacity:0.4;cursor:not-allowed}
.bet-cta.cashout{background:var(--green);color:#fff;animation:cashPulse 0.85s ease infinite}
@keyframes cashPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}50%{box-shadow:0 0 0 7px rgba(34,197,94,0)}}
.bet-cta.wait-btn{background:var(--surface);border:1px solid var(--border-md);color:var(--text2);font-size:13px;cursor:default}
.bet-cta.login-btn{background:var(--blue-dim);border:1px solid var(--blue-border);color:var(--blue);font-size:14px}
.auto-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.auto-lbl{font-size:12px;font-weight:600;color:var(--text2)}
.toggle{position:relative;width:38px;height:21px;flex-shrink:0;cursor:pointer}
.toggle input{opacity:0;width:0;height:0;position:absolute}
.toggle-track{position:absolute;inset:0;border-radius:11px;background:var(--surface);border:1px solid var(--border-md);transition:all 0.18s}
.toggle input:checked+.toggle-track{background:var(--blue);border-color:var(--blue)}
.toggle-thumb{position:absolute;top:3px;left:3px;width:13px;height:13px;border-radius:50%;background:#fff;transition:all 0.18s;pointer-events:none}
.toggle input:checked~.toggle-thumb{left:20px}
.aco-input{width:60px;background:var(--surface);border:1px solid var(--border-md);border-radius:6px;padding:4px 7px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;text-align:center;outline:none;}
.aco-input:focus{border-color:var(--blue)}

/* SIDEBAR */
.rcol{display:none;flex-direction:column;gap:10px}
.rcard{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.rhead{padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.rtitle{font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:var(--text)}
.rcnt{background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:1px 7px;font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace}
.plist{padding:3px}
.prow{display:flex;align-items:center;justify-content:space-between;padding:7px 11px;border-radius:7px;transition:background 0.1s;}
.prow:hover{background:rgba(255,255,255,0.02)}.prow.cashed{background:rgba(34,197,94,0.04)}
.pname{font-size:12px;font-weight:600}.pbet{font-size:10px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:1px}
.pmult{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--text2)}.pmult.cashed{color:var(--green)}
.wmini{padding:12px}
.wm-bal{background:linear-gradient(135deg,rgba(59,130,246,0.07),transparent);border:1px solid var(--blue-border);border-radius:10px;padding:12px;margin-bottom:10px;}
.wm-lbl{font-size:9px;color:var(--text2);letter-spacing:1px;text-transform:uppercase}.wm-amt{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:var(--green);margin:4px 0 2px}.wm-sub{font-size:11px;color:var(--text2)}
.chat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;}
.chat-feed{height:140px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px;}
.chat-feed::-webkit-scrollbar{display:none}
.chat-msg{font-size:11px;line-height:1.45;}.chat-name{font-weight:700;margin-right:3px;font-size:11px}
.chat-name.blue{color:var(--blue)}.chat-name.green{color:var(--green)}.chat-name.amber{color:var(--amber)}.chat-text{color:var(--text2)}
.chat-input-row{display:flex;gap:5px;padding:8px;border-top:1px solid var(--border)}
.chat-input{flex:1;background:var(--surface);border:1px solid var(--border-md);border-radius:7px;padding:7px 10px;color:var(--text);font-family:'Inter',sans-serif;font-size:12px;outline:none;transition:border-color 0.14s;min-width:0;}
.chat-input:focus{border-color:var(--blue)}
.chat-send{width:34px;height:34px;border-radius:7px;border:none;background:var(--blue);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.14s}
.chat-send:hover{background:#2563eb}
.mob-players{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;width:100%;}

/* PAGES */
.page{width:100%;max-width:520px;margin:14px auto;padding:0 10px}
.page.wide{max-width:680px}
.pcard{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.pcard-head{padding:16px 18px;border-bottom:1px solid var(--border)}
.pcard-title{font-size:16px;font-weight:800;letter-spacing:-0.3px}.pcard-sub{font-size:12px;color:var(--text2);margin-top:2px}
.pcard-body{padding:16px 18px}
.big-bal{background:linear-gradient(135deg,rgba(59,130,246,0.07),transparent);border:1px solid var(--blue-border);border-radius:11px;padding:16px;margin-bottom:16px;}
.bb-lbl{font-size:9px;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase}
.bb-amt{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:var(--green);margin:5px 0 3px}
.bb-sub{font-size:11px;color:var(--text2)}
.tab-row{display:flex;gap:7px;margin-bottom:16px}
.tabbtn{flex:1;padding:9px 8px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.12s;}
.tabbtn.on-dep{background:var(--green-dim);border-color:var(--green-border);color:var(--green)}
.tabbtn.on-wd{background:var(--amber-dim);border-color:var(--amber-border);color:var(--amber)}
.filter-row{display:flex;gap:5px;padding:9px 14px;border-bottom:1px solid var(--border);overflow-x:auto}
.filter-row::-webkit-scrollbar{display:none}
.fpill{padding:4px 11px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.12s}
.fpill.on{background:var(--blue-dim);border-color:var(--blue-border);color:var(--blue)}
.hist-row{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.03);}
.hist-l{display:flex;align-items:center;gap:9px;min-width:0}
.hist-ico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hist-ico.dep{background:var(--green-dim);color:var(--green)}.hist-ico.win{background:var(--amber-dim);color:var(--amber)}
.hist-ico.wd{background:var(--blue-dim);color:var(--blue)}.hist-ico.bet{background:rgba(168,85,247,0.1);color:var(--purple)}
.hist-desc{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-time{font-size:10px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:1px}
.hist-amt{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;flex-shrink:0;padding-left:10px}
.hist-amt.pos{color:var(--green)}.hist-amt.neg{color:var(--red)}
.locked{display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 20px}
.locked-ico{width:52px;height:52px;border-radius:14px;background:var(--surface);border:1px solid var(--border-md);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--text2)}
.locked-title{font-size:17px;font-weight:800;margin-bottom:7px}
.locked-sub{color:var(--text2);font-size:13px;line-height:1.65;margin-bottom:20px;max-width:260px}
.locked-btns{display:flex;gap:8px}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:16px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:14px}
.stat-icon{margin-bottom:7px;color:var(--text2)}
.stat-val{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:var(--text)}
.stat-val.green{color:var(--green)}.stat-val.amber{color:var(--amber)}.stat-val.red{color:var(--red)}
.stat-lbl{font-size:10px;color:var(--text2);margin-top:3px;font-weight:500}
.acct-info{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:14px}
.acct-section-lbl{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text2);margin-bottom:10px}
.acct-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:5px 0}
.acct-row+.acct-row{border-top:1px solid var(--border)}
.acct-key{color:var(--text2)}.acct-val{font-weight:600}.acct-val.mono{font-family:'JetBrains Mono',monospace;font-size:11px}.acct-val.green{color:var(--green)}
.lb-row{display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid rgba(255,255,255,0.03);}
.lb-rank{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;width:26px;flex-shrink:0;text-align:center}
.lb-rank.gold{color:var(--amber)}.lb-rank.silver{color:#94a3b8}.lb-rank.bronze{color:#a16207}
.lb-av{width:30px;height:30px;border-radius:7px;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
.lb-name{flex:1;font-size:13px;font-weight:600}.lb-sub{font-size:10px;color:var(--text2);margin-top:1px;font-family:'JetBrains Mono',monospace}
.lb-amt{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green)}
.toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);z-index:900;width:calc(100% - 28px);max-width:300px;padding:10px 14px;border-radius:9px;font-size:13px;font-weight:600;text-align:center;display:flex;align-items:center;justify-content:center;gap:7px;animation:tUp 0.18s ease;}
@keyframes tUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.toast.ok{background:var(--green-dim);border:1px solid var(--green-border);color:var(--green)}
.toast.err{background:var(--red-dim);border:1px solid var(--red-border);color:var(--red)}
.nodata{text-align:center;padding:28px;color:var(--text2);font-size:13px}
.float-notif{position:fixed;bottom:78px;left:14px;z-index:800;pointer-events:none;display:flex;flex-direction:column;gap:5px;max-width:210px;}
.fnotif{background:var(--green-dim);border:1px solid var(--green-border);border-radius:9px;padding:7px 11px;font-size:12px;font-weight:600;color:var(--green);animation:floatUp 4s ease forwards;}
@keyframes floatUp{0%{opacity:0;transform:translateY(14px)}10%{opacity:1;transform:translateY(0)}80%{opacity:1;transform:translateY(-6px)}100%{opacity:0;transform:translateY(-22px)}}
.splash{position:fixed;inset:0;z-index:1000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;}
.splash-logo{font-size:24px;font-weight:800;letter-spacing:-0.5px}.splash-logo span{color:var(--blue)}
.splash-ring{width:44px;height:44px;border-radius:50%;border:3px solid var(--border-md);border-top-color:var(--blue);animation:spin 0.9s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
@media(min-width:540px){.dep-lbl{display:inline}.canvas-wrap{height:260px}.mult-num{font-size:60px}.float-notif{bottom:18px}.toast{bottom:18px;left:auto;right:14px;transform:none;width:auto}}
@media(min-width:768px){.ntabs{display:flex}.mob-tabs{display:none}.root{padding-bottom:0}}
@media(min-width:960px){.layout{display:grid;grid-template-columns:1fr 290px;gap:12px;padding:12px 18px;}.rcol{display:flex}.mob-players{display:none}.canvas-wrap{height:280px}.mult-num{font-size:66px}}
`;

(() => {
  if (document.getElementById("av-css")) return;
  const s = document.createElement("style");
  s.id = "av-css"; s.textContent = CSS;
  document.head.appendChild(s);
})();

const fKES = n => `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fTime = d => d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
const fDate = d => d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
const cbCls = v => v < 2 ? "lo" : v >= 10 ? "hi" : "mi";

const BOT_CHAT = [
  { name: "KipC***", color: "amber", text: "That 8x was insane" },
  { name: "WanjiM***", color: "green", text: "cashed at 3.2x nice" },
  { name: "AviBot", color: "blue", text: "Big win alert!" },
  { name: "OmonB***", color: "", text: "let's go!" },
  { name: "Amina***", color: "amber", text: "riding to 20x 🚀" },
  { name: "JohnK***", color: "", text: "just deposited, ready" },
  { name: "FatumA***", color: "green", text: "auto cashout saved me" },
  { name: "MwanM***", color: "", text: "gg everyone" },
];

const FLOAT_WINS = [
  "WanjiM*** won KES 1,240", "KipC*** cashed ×8.4",
  "Amina*** won KES 3,500", "OmonB*** cashed ×5.2",
  "JohnK*** won KES 840", "FatumA*** cashed ×12.1",
];

/* ── PLANE SVG ── */
function PlaneSVG({ size = 36, color = "#f59e0b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M2 20 L38 8 L30 20 L38 32 Z" fill={color} opacity="0.95" />
      <path d="M16 20 L25 15 L25 25 Z" fill="#fff" opacity="0.3" />
      <path d="M30 20 L25 15 L29 20 L25 25 Z" fill="#fbbf24" />
    </svg>
  );
}

/* ── CANVAS GRAPH ── */
function AviatorGraph({ pathPts, gs, mult, planeX, planeY, planeCrashed, winBanner, cd }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { l: 46, r: 14, t: 16, b: 28 };
    const gW = W - PAD.l - PAD.r;
    const gH = H - PAD.t - PAD.b;

    ctx.clearRect(0, 0, W, H);

    // Grid
    const gridColor = "rgba(255,255,255,0.04)";
    const labelColor = "rgba(100,116,139,0.8)";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";

    const yLabels = [1, 2, 3, 5, 10, 20];
    yLabels.forEach(v => {
      const ratio = Math.log(v) / Math.log(Math.max(mult * 1.3, 3));
      const y = PAD.t + gH - ratio * gH;
      if (y < PAD.t || y > PAD.t + gH) return;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.l, y);
      ctx.lineTo(W - PAD.r, y);
      ctx.stroke();
      ctx.fillStyle = labelColor;
      ctx.fillText(`${v}×`, PAD.l - 4, y + 3.5);
    });

    // x-axis grid lines
    for (let i = 1; i <= 5; i++) {
      const x = PAD.l + (i / 5) * gW;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, PAD.t);
      ctx.lineTo(x, PAD.t + gH);
      ctx.stroke();
    }

    if (pathPts.length < 2) return;

    const maxMult = Math.max(mult * 1.3, 3);
    const maxElapsed = Math.max((Math.log(maxMult) / 0.35) * 1.1, 4);

    const toCanvas = (pt) => {
      const elapsed = Math.log(Math.max(pt.m, 1.0)) / 0.35;
      const cx = PAD.l + (elapsed / maxElapsed) * gW;
      const ratio = Math.log(Math.max(pt.m, 1.0)) / Math.log(maxMult);
      const cy = PAD.t + gH - ratio * gH;
      return { cx, cy };
    };

    const lineColor = gs === "crashed" ? "#f43f5e" : "#f59e0b";
    const fillTop = gs === "crashed" ? "rgba(244,63,94,0.18)" : "rgba(245,158,11,0.18)";
    const fillBot = "rgba(0,0,0,0)";

    // Fill
    const grad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + gH);
    grad.addColorStop(0, fillTop);
    grad.addColorStop(1, fillBot);

    ctx.beginPath();
    const first = toCanvas(pathPts[0]);
    ctx.moveTo(first.cx, PAD.t + gH);
    ctx.lineTo(first.cx, first.cy);
    for (let i = 1; i < pathPts.length; i++) {
      const p = toCanvas(pathPts[i]);
      const prev = toCanvas(pathPts[i - 1]);
      const cpx = (prev.cx + p.cx) / 2;
      ctx.bezierCurveTo(cpx, prev.cy, cpx, p.cy, p.cx, p.cy);
    }
    const last = toCanvas(pathPts[pathPts.length - 1]);
    ctx.lineTo(last.cx, PAD.t + gH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(first.cx, first.cy);
    for (let i = 1; i < pathPts.length; i++) {
      const p = toCanvas(pathPts[i]);
      const prev = toCanvas(pathPts[i - 1]);
      const cpx = (prev.cx + p.cx) / 2;
      ctx.bezierCurveTo(cpx, prev.cy, cpx, p.cy, p.cx, p.cy);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow dot at tip
    if (gs !== "crashed") {
      ctx.beginPath();
      ctx.arc(last.cx, last.cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [pathPts, gs, mult]);

  const multClass = () => {
    const m = parseFloat(mult);
    if (m >= 10) return "hi10";
    if (m >= 5) return "hi5";
    return "";
  };

  return (
    <div className="canvas-wrap">
      <canvas
        ref={canvasRef}
        className="av-canvas"
        width={840}
        height={560}
        style={{ imageRendering: "crisp-edges" }}
      />

      {/* Plane */}
      {(gs === "flying" || gs === "crashed") && (
        <div
          className={`plane-el ${planeCrashed ? "crashed" : ""}`}
          style={{ left: `${planeX}%`, top: `${planeY}%` }}
        >
          <PlaneSVG size={38} color={gs === "crashed" ? "#f43f5e" : "#f59e0b"} />
        </div>
      )}

      {/* Multiplier */}
      {gs !== "waiting" && (
        <div className="mult-overlay">
          <div className={`mult-num ${gs} ${gs === "flying" ? multClass() : ""}`}>
            {parseFloat(mult).toFixed(2)}×
          </div>
          <div className={`mult-lbl ${gs}`}>
            {gs === "crashed" ? "CRASHED" : "FLYING"}
          </div>
        </div>
      )}

      {/* Countdown */}
      {gs === "waiting" && (
        <div className="cd-outer">
          <div className="cd-ring">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <circle className="cd-track" cx="35" cy="35" r="30" />
              <circle
                className="cd-fill" cx="35" cy="35" r="30"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 * (1 - cd / 5)}
              />
            </svg>
            <div className="cd-val">{cd}</div>
          </div>
          <div className="cd-label">Next Round</div>
        </div>
      )}

      {winBanner && <div className="win-flash">{winBanner}</div>}
    </div>
  );
}

/* ── MODALS ── */
function Modal({ onClose, children }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal"><div className="modal-drag" />{children}</div>
    </div>
  );
}

function PhoneInput({ value, onChange }) {
  return (
    <div className="phone-wrap">
      <div className="phone-flag">🇰🇪 +254</div>
      <input className="phone-inp" placeholder="7XX XXX XXX"
        value={value.replace(/^254/, "")}
        onChange={e => onChange("254" + e.target.value.replace(/^0/, "").replace(/\D/g, ""))} />
    </div>
  );
}

function PwInput({ placeholder, value, onChange, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input className="finput" type={show ? "text" : "password"}
        placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} />
      <button className="pw-eye" onClick={() => setShow(s => !s)} type="button">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function LoginModal({ onClose, onLogin, goRegister }) {
  const [phone, setPhone] = useState("254");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (phone.length < 12 || !pass) { setErr("Enter your phone number and password."); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Login failed"); setLoading(false); return; }
      localStorage.setItem("avipesa_token", data.token);
      onLogin(data.user); onClose();
    } catch { setErr("Network error."); setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">Welcome back</div><div className="msub">Sign in with your phone number</div></div>
        <button className="mclose" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="mbody">
        {err && <div className="ferr">{err}</div>}
        <div className="fg"><label className="flbl">M-Pesa Number</label><PhoneInput value={phone} onChange={setPhone} /></div>
        <div className="fg"><label className="flbl">Password</label>
          <PwInput placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="btn-form" onClick={submit} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="ffoot">No account?{" "}<button className="flink" onClick={() => { onClose(); goRegister(); }}>Create one free</button></div>
      </div>
    </Modal>
  );
}

function RegisterModal({ onClose, onLogin, goLogin }) {
  const [f, setF] = useState({ fn: "", ln: "", phone: "254", pass: "", confirm: "" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!f.fn) e.fn = "Required"; if (!f.ln) e.ln = "Required";
    if (f.phone.length < 12) e.phone = "Enter full number";
    if (!f.pass) e.pass = "Required"; else if (f.pass.length < 6) e.pass = "Min 6 chars";
    if (f.pass !== f.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: f.fn, lastName: f.ln, phone: f.phone, password: f.pass }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Registration failed"); setLoading(false); return; }
      localStorage.setItem("avipesa_token", data.token);
      onLogin(data.user); onClose();
    } catch { setErr("Network error."); setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">Create Account</div><div className="msub">Join thousands of AviPesa players</div></div>
        <button className="mclose" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="mbody">
        {err && <div className="ferr">{err}</div>}
        <div className="frow">
          <div className="fg">
            <label className="flbl">First Name</label>
            <input className={`finput ${errs.fn ? "err-f" : ""}`} placeholder="John" value={f.fn}
              onChange={e => { set("fn")(e.target.value); setErrs(p => ({ ...p, fn: "" })); }} />
            {errs.fn && <div className="ferr-i">{errs.fn}</div>}
          </div>
          <div className="fg">
            <label className="flbl">Last Name</label>
            <input className={`finput ${errs.ln ? "err-f" : ""}`} placeholder="Kamau" value={f.ln}
              onChange={e => { set("ln")(e.target.value); setErrs(p => ({ ...p, ln: "" })); }} />
            {errs.ln && <div className="ferr-i">{errs.ln}</div>}
          </div>
        </div>
        <div className="fg">
          <label className="flbl">M-Pesa Number</label>
          <PhoneInput value={f.phone} onChange={v => { set("phone")(v); setErrs(p => ({ ...p, phone: "" })); }} />
          {errs.phone && <div className="ferr-i">{errs.phone}</div>}
        </div>
        <div className="frow">
          <div className="fg">
            <label className="flbl">Password</label>
            <PwInput placeholder="Min 6 chars" value={f.pass} onChange={e => { set("pass")(e.target.value); setErrs(p => ({ ...p, pass: "" })); }} />
            {errs.pass && <div className="ferr-i">{errs.pass}</div>}
          </div>
          <div className="fg">
            <label className="flbl">Confirm</label>
            <PwInput placeholder="Repeat" value={f.confirm} onChange={e => { set("confirm")(e.target.value); setErrs(p => ({ ...p, confirm: "" })); }} />
            {errs.confirm && <div className="ferr-i">{errs.confirm}</div>}
          </div>
        </div>
        <div className="fhint" style={{ marginBottom: 12 }}>
          By registering you confirm you are 18+ and agree to our <span style={{ color: "var(--blue)" }}>Terms of Service</span>.
        </div>
        <button className="btn-form" onClick={submit} disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
        <div className="ffoot">Have an account?{" "}<button className="flink" onClick={() => { onClose(); goLogin(); }}>Sign in</button></div>
      </div>
    </Modal>
  );
}

function DepositModal({ onClose, onDeposit }) {
  const [phone, setPhone] = useState("254");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 10 && phone.length >= 12;

  const submit = async () => {
    if (!valid) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/wallet/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("avipesa_token")}` },
        body: JSON.stringify({ amount: amt, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Deposit failed"); setLoading(false); return; }
      setStep(1);
      setTimeout(() => { onDeposit(data.balance, amt); onClose(); }, 3000);
    } catch { setErr("Network error."); setLoading(false); }
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="mhead">
        <div><div className="mtitle">Deposit via M-Pesa</div><div className="msub">Instant STK push · Safaricom</div></div>
        {step === 0 && <button className="mclose" onClick={onClose}><X size={15} /></button>}
      </div>
      <div className="mbody">
        {step === 0 ? (<>
          {err && <div className="ferr">{err}</div>}
          <div className="fg"><label className="flbl">M-Pesa Number</label><PhoneInput value={phone} onChange={setPhone} /></div>
          <div className="fg">
            <label className="flbl">Amount (KES)</label>
            <input className="finput" type="number" placeholder="Minimum KES 10" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="presets">{[50, 100, 500, 1000, 2000, 5000].map(v => (
              <button key={v} className="preset" onClick={() => setAmount(String(v))}>{v}</button>
            ))}</div>
          </div>
          <button className="btn-mpesa-f" onClick={submit} disabled={!valid || loading}>
            <ArrowDownCircle size={16} />
            {loading ? "Sending STK..." : `Deposit ${amount && !isNaN(amt) ? fKES(amt) : ""}`}
          </button>
        </>) : (
          <div className="stk-wait">
            <div className="stk-ico"><ArrowDownCircle size={26} /></div>
            <div className="stk-title">STK Push Sent</div>
            <div className="stk-sub">Check your phone and enter your M-Pesa PIN to complete.</div>
            <div className="stk-blink">Waiting for confirmation...</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function WithdrawModal({ onClose, balance, onWithdraw }) {
  const [phone, setPhone] = useState("254");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 100 && amt <= balance && phone.length >= 12;

  const toConfirm = () => {
    if (!valid) {
      if (isNaN(amt) || amt < 100) setErr("Minimum withdrawal is KES 100");
      else if (amt > balance) setErr("Exceeds your balance");
      else setErr("Enter a valid M-Pesa number");
      return;
    }
    setErr(""); setStep(1);
  };

  const confirm = async () => {
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/wallet/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("avipesa_token")}` },
        body: JSON.stringify({ amount: amt, phone }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Withdrawal failed"); setLoading(false); setStep(0); return; }
      onWithdraw(data.balance, amt); onClose();
    } catch { setErr("Network error."); setLoading(false); setStep(0); }
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="mhead">
        <div><div className="mtitle">Withdraw Funds</div><div className="msub">Send to M-Pesa · ~2 minutes</div></div>
        {step === 0 && <button className="mclose" onClick={onClose}><X size={15} /></button>}
      </div>
      <div className="mbody">
        {step === 0 ? (<>
          {err && <div className="ferr">{err}</div>}
          <div className="fg"><label className="flbl">M-Pesa Number</label><PhoneInput value={phone} onChange={setPhone} /></div>
          <div className="fg">
            <label className="flbl">Amount (KES)</label>
            <input className="finput" type="number" placeholder="Min KES 100" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="presets">{[100, 500, 1000, 2000, 5000].map(v => (
              <button key={v} className="preset" onClick={() => setAmount(String(v))} disabled={v > balance}>{v}</button>
            ))}</div>
            <div className="fhint">Available: <strong style={{ color: "var(--green)" }}>{fKES(balance)}</strong></div>
          </div>
          <button className="btn-form" onClick={toConfirm} disabled={!amount}>Review Withdrawal</button>
        </>) : loading ? (
          <div className="stk-wait">
            <div className="stk-ico" style={{ background: "var(--blue-dim)", borderColor: "var(--blue-border)", color: "var(--blue)" }}>
              <RefreshCw size={26} />
            </div>
            <div className="stk-title">Processing...</div>
            <div className="stk-blink">Please wait...</div>
          </div>
        ) : (<>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-md)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 9 }}>
              <span style={{ color: "var(--text2)" }}>M-Pesa Number</span><span style={{ fontFamily: "monospace" }}>+{phone}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 9 }}>
              <span style={{ color: "var(--text2)" }}>Amount</span><span>{fKES(amt)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: "1px solid var(--border)", paddingTop: 9, fontWeight: 700 }}>
              <span style={{ color: "var(--text2)" }}>You receive</span><span style={{ color: "var(--green)" }}>{fKES(amt)}</span>
            </div>
          </div>
          <button className="btn-mpesa-f" style={{ background: "var(--amber)", color: "#000", marginBottom: 8 }} onClick={confirm}>
            <Check size={16} /> Confirm Withdrawal
          </button>
          <button className="btn-ghost" style={{ width: "100%", textAlign: "center", padding: "10px" }} onClick={() => setStep(0)}>
            Edit Details
          </button>
        </>)}
      </div>
    </Modal>
  );
}

function Locked({ title, sub, openLogin, openRegister }) {
  return (
    <div className="locked">
      <div className="locked-ico"><Lock size={22} /></div>
      <div className="locked-title">{title}</div>
      <div className="locked-sub">{sub}</div>
      <div className="locked-btns">
        <button className="btn-ghost" onClick={openLogin}>Sign In</button>
        <button className="btn-primary" onClick={openRegister}>Register Free</button>
      </div>
    </div>
  );
}

function BetPanel({ gs, user, hasBet, cashedOut, betAmt, setBetAmt, autoCO, setAutoCO, onBet, onCashout, onLogin, md }) {
  const [bpTab, setBpTab] = useState("bet");
  const [autoCOOn, setAutoCOOn] = useState(false);
  const amt = parseFloat(betAmt) || 0;
  const adjust = delta => setBetAmt(String(Math.max(10, (parseFloat(betAmt) || 0) + delta)));

  const BigBtn = () => {
    if (!user) return <button className="bet-cta login-btn" onClick={onLogin}><Lock size={15} /> Sign In to Play</button>;
    if (gs === "flying" && hasBet && !cashedOut) return <button className="bet-cta cashout" onClick={onCashout}>Cash Out ×{md}</button>;
    if (gs === "waiting") return (
      <button className="bet-cta place" onClick={onBet} disabled={hasBet}>
        {hasBet ? <><Check size={15} /> Bet Placed</> : `Place Bet · ${fKES(amt)}`}
      </button>
    );
    return <button className="bet-cta wait-btn" disabled>Waiting for next round...</button>;
  };

  return (
    <div className="bpanel">
      <div className="bptabs">
        <button className={`bptab ${bpTab === "bet" ? "on" : ""}`} onClick={() => setBpTab("bet")}>Bet</button>
        <button className={`bptab ${bpTab === "auto" ? "on" : ""}`} onClick={() => setBpTab("auto")}>Auto</button>
      </div>
      {bpTab === "bet" && (<>
        <div className="stepper-row">
          <button className="step-btn" onClick={() => adjust(-10)} disabled={hasBet}><Minus size={16} /></button>
          <input className="step-val" type="number" value={betAmt}
            onChange={e => setBetAmt(e.target.value)} disabled={hasBet} />
          <button className="step-btn" onClick={() => adjust(10)} disabled={hasBet}><Plus size={16} /></button>
        </div>
        <div className="qgrid">
          {[100, 200, 500, 1000].map(v => (
            <button key={v} className="qgbtn" onClick={() => setBetAmt(String(v))} disabled={hasBet}>{v.toLocaleString()}</button>
          ))}
        </div>
        <BigBtn />
        <div className="auto-row">
          <span className="auto-lbl">Auto Cash Out</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <label className="toggle">
              <input type="checkbox" checked={autoCOOn} onChange={e => setAutoCOOn(e.target.checked)} />
              <div className="toggle-track" /><div className="toggle-thumb" />
            </label>
            {autoCOOn && <input className="aco-input" type="number" value={autoCO} onChange={e => setAutoCO(e.target.value)} min="1.1" step="0.1" />}
          </div>
        </div>
      </>)}
      {bpTab === "auto" && (<>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: 13, marginBottom: 13 }}>
          <div style={{ marginBottom: 11 }}>
            <label className="flbl">Bet Amount (KES)</label>
            <input style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border-md)", borderRadius: 7, padding: "8px 10px", color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, outline: "none" }}
              type="number" value={betAmt} onChange={e => setBetAmt(e.target.value)} />
          </div>
          <div>
            <label className="flbl">Auto Cash Out ×</label>
            <input style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border-md)", borderRadius: 7, padding: "8px 10px", color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, outline: "none" }}
              type="number" value={autoCO} onChange={e => setAutoCO(e.target.value)} min="1.1" step="0.1" />
          </div>
        </div>
        <button className="bet-cta place" onClick={onBet} disabled={!user || hasBet || gs !== "waiting"}>
          {!user ? "Sign In to Play" : hasBet ? "Auto Running..." : "Start Auto Bet"}
        </button>
      </>)}
    </div>
  );
}

function LiveChat() {
  const [msgs, setMsgs] = useState(BOT_CHAT.slice(0, 4));
  const [input, setInput] = useState("");
  const feedRef = useRef(null);
  useEffect(() => {
    const t = setInterval(() => {
      const m = BOT_CHAT[Math.floor(Math.random() * BOT_CHAT.length)];
      setMsgs(p => [...p.slice(-20), { ...m, id: Date.now() }]);
    }, 3800);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [msgs]);
  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p.slice(-20), { name: "You", color: "blue", text: input, id: Date.now() }]);
    setInput("");
  };
  return (
    <div className="chat-card">
      <div className="rhead"><span className="rtitle">Live Chat</span><div className="live-ind"><div className="live-dot" />Live</div></div>
      <div className="chat-feed" ref={feedRef}>
        {msgs.map((m, i) => (
          <div key={m.id || i} className="chat-msg">
            <span className={`chat-name ${m.color || ""}`}>{m.name}:</span>
            <span className="chat-text"> {m.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Say something..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
        <button className="chat-send" onClick={send}><Send size={14} /></button>
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
export default function App() {
  const [user, setUser] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("game");
  const [ddOpen, setDdOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState([]);
  const [walletMode, setWalletMode] = useState("deposit");
  const [txnFilter, setTxnFilter] = useState("all");
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalWon: 0, totalBets: 0, biggestWin: 0, totalWagered: 0, totalLost: 0, avgCashout: 0, cashoutCount: 0 });
  const [gs, setGs] = useState("waiting");
  const [mult, setMult] = useState(1);
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [betAmt, setBetAmt] = useState("50");
  const [autoCO, setAutoCO] = useState("2.00");
  const [planeCrashed, setPlaneCrashed] = useState(false);
  const [cd, setCd] = useState(5);
  const [crashes, setCrashes] = useState([]);
  const [toast, setToast] = useState(null);
  const [pathPts, setPathPts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [winBanner, setWinBanner] = useState(null);
  const [floatNotifs, setFloatNotifs] = useState([]);
  const [planeX, setPlaneX] = useState(5);
  const [planeY, setPlaneY] = useState(90);

  const gsRef = useRef("waiting");
  const betRef = useRef(false);
  const coRef = useRef(false);
  const socketRef = useRef(null);
  const startTimeRef = useRef(null);

  // Plane position calculation matching canvas coords
  const calcPlanePos = useCallback((m) => {
    const PAD = { l: 46, r: 14, t: 16, b: 28 };
    const maxMult = Math.max(m * 1.3, 3);
    const maxElapsed = Math.max((Math.log(maxMult) / 0.35) * 1.1, 4);
    const elapsed = Math.log(Math.max(m, 1.0)) / 0.35;
    const gWratio = (1 - (PAD.l + PAD.r) / 840);
    const gHratio = (1 - (PAD.t + PAD.b) / 560);
    const cx = PAD.l / 840 + (elapsed / maxElapsed) * gWratio;
    const ratio = Math.log(Math.max(m, 1.0)) / Math.log(maxMult);
    const cy = (PAD.t / 560) + gHratio - ratio * gHratio;
    return { x: cx * 100, y: cy * 100 };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("avipesa_token");
    if (!token) { setAppReady(true); return; }
    const timer = setTimeout(() => setAppReady(true), 2000);
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setUser(data.user); setBalance(data.user.balance || 0); clearTimeout(timer); setAppReady(true); })
      .catch(() => { localStorage.removeItem("avipesa_token"); clearTimeout(timer); setAppReady(true); });
    return () => clearTimeout(timer);
  }, []);

  const connectSocket = useCallback((token) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_URL, { auth: { token: token || "" }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("game:state", data => {
      setGs(data.state); setMult(data.multiplier || 1); gsRef.current = data.state;
      setCd(data.countdown || 5); setCrashes(data.history || []); setPlayers(data.bets || []);
    });
    socket.on("game:waiting", data => {
      gsRef.current = "waiting"; setGs("waiting"); setMult(1);
      setPlaneCrashed(false); setPathPts([]);
      setCashedOut(false); setHasBet(false); betRef.current = false; coRef.current = false;
      setCrashes(data.history || []); setPlayers(data.bets || []);
      setPlaneX(5); setPlaneY(90);
    });
    socket.on("game:countdown", data => setCd(data.countdown));
    socket.on("game:flying", data => {
      gsRef.current = "flying"; setGs("flying"); setPlaneCrashed(false);
      startTimeRef.current = Date.now();
      setPathPts([{ m: 1.0 }]);
      setPlayers(data.bets || []);
    });
    socket.on("game:tick", data => {
      const m = data.multiplier;
      setMult(m);
      setPathPts(p => [...p.slice(-120), { m }]);
      const pos = calcPlanePos(m);
      setPlaneX(pos.x); setPlaneY(pos.y);
      setPlayers(data.bets || []);
    });
    socket.on("game:crashed", data => {
      gsRef.current = "crashed"; setGs("crashed"); setPlaneCrashed(true);
      setCrashes(p => [data.multiplier, ...p].slice(0, 12));
      setPlayers(data.bets || []);
      if (betRef.current && !coRef.current) {
        toast_(`Crashed ×${data.multiplier.toFixed(2)} — Lost ${fKES(parseFloat(betRef.current))}`, "err");
      }
      betRef.current = false; setHasBet(false);
    });
    socket.on("game:bets", bets => setPlayers(bets || []));
    return socket;
  }, [calcPlanePos]);

  useEffect(() => {
    const token = localStorage.getItem("avipesa_token") || "";
    connectSocket(token);
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [connectSocket]);

  useEffect(() => {
    const t = setInterval(() => {
      if (gsRef.current === "flying" && Math.random() < 0.3) {
        const msg = FLOAT_WINS[Math.floor(Math.random() * FLOAT_WINS.length)];
        const id = Date.now();
        setFloatNotifs(p => [...p.slice(-3), { id, msg }]);
        setTimeout(() => setFloatNotifs(p => p.filter(n => n.id !== id)), 4000);
      }
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const toast_ = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addTxn = useCallback((type, label, amount) => {
    setTxns(p => [{ id: Date.now(), type, label, amount, time: new Date() }, ...p]);
  }, []);

  const handleBet = () => {
    if (!user) { setModal("login"); return; }
    const a = parseFloat(betAmt);
    if (isNaN(a) || a < 10) { toast_("Minimum bet is KES 10", "err"); return; }
    if (a > balance) { toast_("Insufficient balance", "err"); return; }
    socketRef.current.emit("bet:place", { amount: a });
    socketRef.current.once("bet:result", result => {
      if (result.ok) { setBalance(result.balance); setHasBet(true); betRef.current = String(a); toast_(`Bet placed — KES ${a}`); }
      else toast_(result.error, "err");
    });
  };

  const doCashout = useCallback(() => {
    if (!betRef.current || coRef.current) return;
    socketRef.current.emit("bet:cashout");
    socketRef.current.once("cashout:result", result => {
      if (result.ok) {
        coRef.current = true; setCashedOut(true); setBalance(result.balance);
        addTxn("win", `Win ×${result.mult.toFixed(2)}`, result.profit);
        setWinBanner(`×${result.mult.toFixed(2)} — Won ${fKES(result.payout)}`);
        setTimeout(() => setWinBanner(null), 3000);
        toast_(`Cashed out ×${result.mult.toFixed(2)} — Won ${fKES(result.payout)}`);
      } else toast_(result.error, "err");
    });
  }, [addTxn, toast_]);

  useEffect(() => {
    if (tab === "history" && user) {
      fetch(`${API}/wallet/transactions`, { headers: { Authorization: `Bearer ${localStorage.getItem("avipesa_token")}` } })
        .then(r => r.ok ? r.json() : null).then(data => { if (data) setTxns(data.map(t => ({ ...t, time: new Date(t.created_at) }))); }).catch(() => {});
    }
  }, [tab, user]);

  useEffect(() => {
    if (tab === "leaderboard") {
      fetch(`${API}/game/leaderboard`).then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setLeaderboard(data.map(p => ({ name: p.name, total: p.total_won, bets: p.total_bets, best: p.best_cashout }))); }).catch(() => {});
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "stats" && user) {
      fetch(`${API}/game/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem("avipesa_token")}` } })
        .then(r => r.ok ? r.json() : null).then(data => { if (data) setStats(data); }).catch(() => {});
    }
  }, [tab, user]);

  const handleLogin = useCallback((u, msg) => {
    setUser(u); setBalance(u.balance || 0);
    toast_(msg || `Welcome, ${u.name.split(" ")[0]}`);
    connectSocket(localStorage.getItem("avipesa_token") || "");
  }, [connectSocket, toast_]);

  const handleLogout = () => {
    localStorage.removeItem("avipesa_token");
    if (socketRef.current) socketRef.current.disconnect();
    connectSocket("");
    setUser(null); setBalance(0); setDdOpen(false);
    setHasBet(false); betRef.current = false;
    toast_("Signed out");
  };

  const handleDeposit = (nb, amt) => { setBalance(nb); addTxn("dep", "M-Pesa Deposit", amt); toast_(`${fKES(amt)} deposited`); };
  const handleWithdraw = (nb, amt) => { setBalance(nb); addTxn("wd", "M-Pesa Withdrawal", -amt); toast_(`${fKES(amt)} sent to M-Pesa`); };
  const md = parseFloat(mult).toFixed(2);
  const filteredTxns = txns.filter(t => {
    if (txnFilter === "all") return true;
    if (txnFilter === "deposits") return t.type === "dep";
    if (txnFilter === "wins") return t.type === "win";
    if (txnFilter === "withdrawals") return t.type === "wd";
    return true;
  });

  const NAV_TABS = [
    { id: "game", icon: <Zap size={14} />, label: "Game" },
    { id: "wallet", icon: <Wallet size={14} />, label: "Wallet" },
    { id: "history", icon: <History size={14} />, label: "History" },
    { id: "leaderboard", icon: <Trophy size={14} />, label: "Leaders" },
    { id: "stats", icon: <BarChart2 size={14} />, label: "My Stats" },
  ];

  const histIcon = type => {
    if (type === "dep") return <ArrowDownCircle size={16} />;
    if (type === "win") return <Award size={16} />;
    if (type === "wd") return <ArrowUpCircle size={16} />;
    return <Activity size={16} />;
  };

  const rankCls = i => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const rankLabel = i => i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}`;

  if (!appReady) return (
    <div className="splash">
      <div style={{ color: "var(--blue)" }}><Zap size={38} /></div>
      <div className="splash-logo">Avi<span>Pesa</span></div>
      <div className="splash-ring" />
    </div>
  );

  return (
    <div className="root" onClick={() => ddOpen && setDdOpen(false)}>
      {toast && <div className={`toast ${toast.type}`}>{toast.type === "ok" ? <Check size={14} /> : <Activity size={14} />}{toast.msg}</div>}
      <div className="float-notif">{floatNotifs.map(n => <div key={n.id} className="fnotif">{n.msg}</div>)}</div>

      <nav className="nav">
        <div className="nav-i">
          <div className="logo" onClick={() => setTab("game")}>
            <div className="logo-icon"><Zap size={16} color="#fff" /></div>
            <div className="logo-text">Avi<span>Pesa</span></div>
          </div>
          <div className="ntabs">
            {NAV_TABS.map(t => (
              <button key={t.id} className={`ntab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="nav-r">
            {user ? (<>
              <div className="bal-chip">
                <div className="bal-lbl">Balance</div>
                <div className="bal-val">{fKES(balance)}</div>
              </div>
              <button className="btn-dep" onClick={() => setModal("deposit")}>
                <ArrowDownCircle size={14} /><span className="dep-lbl">Deposit</span>
              </button>
              <div className="av-wrap" onClick={e => e.stopPropagation()}>
                <button className="av-btn" onClick={() => setDdOpen(o => !o)}>{user.name[0].toUpperCase()}</button>
                {ddOpen && (
                  <div className="dropdown">
                    <div className="dd-top"><div className="dd-name">{user.name}</div><div className="dd-phone">+{user.phone}</div></div>
                    {NAV_TABS.map(t => (
                      <button key={t.id} className="dd-item" onClick={() => { setTab(t.id); setDdOpen(false); }}>{t.icon} {t.label}</button>
                    ))}
                    <button className="dd-item" onClick={() => { setModal("deposit"); setDdOpen(false); }}><ArrowDownCircle size={14} /> Deposit</button>
                    <div className="dd-sep" />
                    <button className="dd-item danger" onClick={handleLogout}><LogOut size={14} /> Sign Out</button>
                  </div>
                )}
              </div>
            </>) : (
              <div className="nav-auth">
                <button className="btn-ghost" onClick={() => setModal("login")}>Sign In</button>
                <button className="btn-primary" onClick={() => setModal("register")}>Register</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="mob-tabs">
        {NAV_TABS.map(t => (
          <button key={t.id} className={`mtab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {modal === "login" && <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} goRegister={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onLogin={handleLogin} goLogin={() => setModal("login")} />}
      {modal === "deposit" && <DepositModal onClose={() => setModal(null)} onDeposit={handleDeposit} />}
      {modal === "withdraw" && <WithdrawModal onClose={() => setModal(null)} balance={balance} onWithdraw={handleWithdraw} />}

      {tab === "game" && (
        <div className="layout">
          <div>
            <div className="gcard">
              <div className="gtopbar">
                <div className="live-ind"><div className="live-dot" />Live Round</div>
                <div className={`rbadge ${gs}`}>
                  {gs === "waiting" ? `Next in ${cd}s` : gs === "crashed" ? "Crashed" : "In Play"}
                </div>
              </div>

              <AviatorGraph
                pathPts={pathPts} gs={gs} mult={mult}
                planeX={planeX} planeY={planeY}
                planeCrashed={planeCrashed}
                winBanner={winBanner} cd={cd}
              />

              <div className="cbar">
                <span className="cbar-lbl">Recent</span>
                {crashes.map((v, i) => (
                  <span key={i} className={`cbadge ${cbCls(v)} ${i === 0 ? "new" : ""}`}>{Number(v).toFixed(2)}×</span>
                ))}
              </div>

              <BetPanel
                gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
                betAmt={betAmt} setBetAmt={setBetAmt} autoCO={autoCO} setAutoCO={setAutoCO}
                onBet={handleBet} onCashout={doCashout} onLogin={() => setModal("login")} md={md}
              />
            </div>
          </div>

          <div className="rcol">
            <div className="rcard">
              <div className="rhead"><span className="rtitle">Active Players</span><span className="rcnt">{players.length}</span></div>
              <div className="plist">
                {players.map((p, i) => (
                  <div key={p.id || i} className={`prow ${p.cashed ? "cashed" : ""}`}>
                    <div><div className="pname">{p.name}</div><div className="pbet">KES {p.bet}</div></div>
                    {gs === "flying" && !p.cashed && <div className="pmult">{md}×</div>}
                    {p.cashed && <div className="pmult cashed">✓ {p.cashMult}×</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="rcard">
              <div className="rhead"><span className="rtitle">Quick Deposit</span><span style={{ fontSize: 10, fontWeight: 700, background: "var(--mpesa)", color: "#fff", padding: "2px 7px", borderRadius: 4, letterSpacing: 1 }}>M-PESA</span></div>
              <div className="wmini">
                {user ? (<>
                  <div className="wm-bal"><div className="wm-lbl">Balance</div><div className="wm-amt">{fKES(balance)}</div><div className="wm-sub">AviPesa Wallet</div></div>
                  <button className="btn-mpesa-f" onClick={() => setModal("deposit")}><ArrowDownCircle size={15} /> Deposit via M-Pesa</button>
                </>) : (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>Sign in to deposit and play</div>
                    <button className="btn-mpesa-f" onClick={() => setModal("login")}>Sign In to Deposit</button>
                  </div>
                )}
              </div>
            </div>
            <LiveChat />
          </div>

          <div className="mob-players">
            <div className="rhead"><span className="rtitle">Active Players</span><span className="rcnt">{players.length}</span></div>
            <div className="plist">
              {players.slice(0, 5).map((p, i) => (
                <div key={p.id || i} className={`prow ${p.cashed ? "cashed" : ""}`}>
                  <div><div className="pname">{p.name}</div><div className="pbet">KES {p.bet}</div></div>
                  {gs === "flying" && !p.cashed && <div className="pmult">{md}×</div>}
                  {p.cashed && <div className="pmult cashed">✓ {p.cashMult}×</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "wallet" && (
        <div className="page">
          <div className="pcard">
            {!user ? <Locked title="Wallet Locked" sub="Sign in to view your balance, deposit or withdraw." openLogin={() => setModal("login")} openRegister={() => setModal("register")} /> : (<>
              <div className="pcard-head"><div className="pcard-title">My Wallet</div><div className="pcard-sub">Manage your AviPesa funds</div></div>
              <div className="pcard-body">
                <div className="big-bal">
                  <div className="bb-lbl">Available Balance</div>
                  <div className="bb-amt">{fKES(balance)}</div>
                  <div className="bb-sub">Kenyan Shilling · AviPesa Account</div>
                </div>
                <div className="tab-row">
                  <button className={`tabbtn ${walletMode === "deposit" ? "on-dep" : ""}`} onClick={() => setWalletMode("deposit")}><ArrowDownCircle size={15} /> Deposit</button>
                  <button className={`tabbtn ${walletMode === "withdraw" ? "on-wd" : ""}`} onClick={() => setWalletMode("withdraw")}><ArrowUpCircle size={15} /> Withdraw</button>
                </div>
                {walletMode === "deposit"
                  ? <button className="btn-mpesa-f" onClick={() => setModal("deposit")}><ArrowDownCircle size={15} /> Deposit via M-Pesa</button>
                  : <button className="btn-mpesa-f" style={{ background: "var(--amber)", color: "#000" }} onClick={() => setModal("withdraw")}><ArrowUpCircle size={15} /> Withdraw Funds</button>
                }
              </div>
            </>)}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="page wide">
          <div className="pcard">
            {!user ? <Locked title="History Locked" sub="Sign in to view your transaction history." openLogin={() => setModal("login")} openRegister={() => setModal("register")} /> : (<>
              <div className="pcard-head"><div className="pcard-title">Transaction History</div><div className="pcard-sub">{filteredTxns.length} records</div></div>
              <div className="filter-row">
                {[{ k: "all", l: "All" }, { k: "deposits", l: "Deposits" }, { k: "wins", l: "Wins" }, { k: "withdrawals", l: "Withdrawals" }].map(f => (
                  <button key={f.k} className={`fpill ${txnFilter === f.k ? "on" : ""}`} onClick={() => setTxnFilter(f.k)}>{f.l}</button>
                ))}
              </div>
              {filteredTxns.length === 0 && <div className="nodata">No transactions found.</div>}
              {filteredTxns.map(t => (
                <div key={t.id} className="hist-row">
                  <div className="hist-l">
                    <div className={`hist-ico ${t.type}`}>{histIcon(t.type)}</div>
                    <div><div className="hist-desc">{t.label}</div><div className="hist-time">{fDate(t.time)} · {fTime(t.time)}</div></div>
                  </div>
                  <div className={`hist-amt ${t.amount >= 0 ? "pos" : "neg"}`}>
                    {t.amount >= 0 ? "+" : ""}{fKES(Math.abs(t.amount))}
                  </div>
                </div>
              ))}
            </>)}
          </div>
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="page wide">
          <div className="pcard">
            <div className="pcard-head"><div className="pcard-title">Leaderboard</div><div className="pcard-sub">Top players this month</div></div>
            {leaderboard.length === 0 && <div className="nodata">Loading leaderboard...</div>}
            {leaderboard.map((p, i) => (
              <div key={i} className="lb-row">
                <div className={`lb-rank ${rankCls(i)}`}>{rankLabel(i)}</div>
                <div className="lb-av">{p.name[0]}</div>
                <div style={{ flex: 1 }}><div className="lb-name">{p.name}</div><div className="lb-sub">{p.bets} bets · Best ×{Number(p.best).toFixed(2)}</div></div>
                <div className="lb-amt">{fKES(p.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="page">
          <div className="pcard">
            {!user ? <Locked title="Stats Locked" sub="Sign in to see your performance statistics." openLogin={() => setModal("login")} openRegister={() => setModal("register")} /> : (<>
              <div className="pcard-head"><div className="pcard-title">My Stats</div><div className="pcard-sub">Your performance overview</div></div>
              <div className="pcard-body">
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-icon"><Activity size={17} /></div><div className="stat-val amber">{stats.totalBets}</div><div className="stat-lbl">Total Bets</div></div>
                  <div className="stat-card"><div className="stat-icon"><TrendingUp size={17} /></div><div className="stat-val green">{fKES(stats.totalWon)}</div><div className="stat-lbl">Total Won</div></div>
                  <div className="stat-card"><div className="stat-icon"><DollarSign size={17} /></div><div className="stat-val red">{fKES(stats.totalLost || 0)}</div><div className="stat-lbl">Total Lost</div></div>
                  <div className="stat-card"><div className="stat-icon"><Award size={17} /></div><div className="stat-val amber">{stats.biggestWin > 0 ? `×${Number(stats.biggestWin).toFixed(2)}` : "—"}</div><div className="stat-lbl">Best Cashout</div></div>
                  <div className="stat-card"><div className="stat-icon"><Target size={17} /></div><div className="stat-val">{stats.avgCashout > 0 ? `×${Number(stats.avgCashout).toFixed(2)}` : "—"}</div><div className="stat-lbl">Avg Cashout</div></div>
                  <div className="stat-card"><div className="stat-icon"><Percent size={17} /></div><div className="stat-val">{stats.totalBets > 0 ? `${Math.round((stats.cashoutCount / stats.totalBets) * 100)}%` : "—"}</div><div className="stat-lbl">Win Rate</div></div>
                  <div className="stat-card"><div className="stat-icon"><DollarSign size={17} /></div><div className="stat-val">{fKES(stats.totalWagered || 0)}</div><div className="stat-lbl">Total Wagered</div></div>
                  <div className="stat-card"><div className="stat-icon"><TrendingUp size={17} /></div><div className={`stat-val ${(stats.totalWon - (stats.totalLost || 0)) >= 0 ? "green" : "red"}`}>{fKES(stats.totalWon - (stats.totalLost || 0))}</div><div className="stat-lbl">Net Profit</div></div>
                </div>
                <div className="acct-info">
                  <div className="acct-section-lbl">Account</div>
                  <div className="acct-row"><span className="acct-key">Name</span><span className="acct-val">{user.name}</span></div>
                  <div className="acct-row"><span className="acct-key">Phone</span><span className="acct-val mono">+{user.phone}</span></div>
                  <div className="acct-row"><span className="acct-key">Balance</span><span className="acct-val green">{fKES(balance)}</span></div>
                </div>
              </div>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}