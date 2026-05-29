import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Zap, Wallet, History, Trophy, BarChart2, LogOut,
  Eye, EyeOff, ChevronDown, X, Plus, Minus,
  TrendingUp, DollarSign, Award, Sun, Moon,
  MessageSquare, Users, User, Lock,
  Target, Percent, Activity, Send, Check,
  ArrowUpCircle, ArrowDownCircle, RefreshCw
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
  --bg:#07090f;
  --surface:#0d1017;
  --card:#111520;
  --card2:#171d2e;
  --border:rgba(255,255,255,0.06);
  --border-md:rgba(255,255,255,0.11);
  --border-strong:rgba(255,255,255,0.18);
  --blue:#3b82f6;
  --blue-dim:rgba(59,130,246,0.1);
  --blue-border:rgba(59,130,246,0.3);
  --green:#22c55e;
  --green-dim:rgba(34,197,94,0.1);
  --green-border:rgba(34,197,94,0.3);
  --red:#f43f5e;
  --red-dim:rgba(244,63,94,0.1);
  --red-border:rgba(244,63,94,0.3);
  --amber:#f59e0b;
  --amber-dim:rgba(245,158,11,0.1);
  --amber-border:rgba(245,158,11,0.3);
  --purple:#a855f7;
  --mpesa:#16a34a;
  --mpesa-hover:#15803d;
  --text:#e2e8f0;
  --text2:#64748b;
  --text3:#334155;
  --shadow:0 4px 24px rgba(0,0,0,0.4);
  --shadow-lg:0 8px 48px rgba(0,0,0,0.6);
}
html,body{width:100%;overflow-x:hidden;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:var(--border-md);border-radius:4px}
.root{min-height:100vh;width:100%;overflow-x:hidden;background:var(--bg);padding-bottom:60px;}

/* NAV */
.nav{position:sticky;top:0;z-index:400;height:56px;background:rgba(7,9,15,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);width:100%;}
.nav-i{width:100%;max-width:1280px;margin:0 auto;height:100%;padding:0 16px;display:flex;align-items:center;gap:8px;}
.logo{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;flex-shrink:0;text-decoration:none;}
.logo-icon{width:32px;height:32px;border-radius:8px;background:var(--blue);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.logo-text{font-size:17px;font-weight:800;letter-spacing:-0.5px;color:var(--text);white-space:nowrap;}
.logo-text span{color:var(--blue)}
.ntabs{display:none;gap:2px;margin:0 16px;flex:1;}
.ntab{padding:6px 14px;border-radius:8px;border:none;background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
.ntab:hover{color:var(--text);background:rgba(255,255,255,0.04)}
.ntab.on{background:var(--blue-dim);color:var(--blue);}
.nav-r{display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:auto}
.bal-chip{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:6px 12px;cursor:default;}
.bal-lbl{font-size:10px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:var(--text2)}
.bal-val{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green)}
.btn-deposit{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:none;background:var(--mpesa);color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;flex-shrink:0;}
.btn-deposit:hover{background:var(--mpesa-hover);}
.dep-label{display:none}
.icon-btn{width:36px;height:36px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;}
.icon-btn:hover{border-color:var(--border-strong);color:var(--text)}
.av-wrap{position:relative}
.av-avatar{width:36px;height:36px;border-radius:8px;background:var(--blue);border:none;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;cursor:pointer;transition:all 0.15s;}
.av-avatar:hover{background:var(--blue-hover,#2563eb)}
.dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:200px;z-index:500;background:var(--card2);border:1px solid var(--border-md);border-radius:12px;padding:6px;box-shadow:var(--shadow-lg);animation:fdDown 0.14s ease;}
@keyframes fdDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.dd-top{padding:10px 12px 12px;border-bottom:1px solid var(--border);margin-bottom:4px}
.dd-name{font-size:14px;font-weight:700}
.dd-phone{font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:2px}
.dd-item{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;border-radius:8px;border:none;background:transparent;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;text-align:left;transition:background 0.12s;}
.dd-item:hover{background:rgba(255,255,255,0.04)}
.dd-item.danger{color:var(--red)}
.dd-sep{height:1px;background:var(--border);margin:4px 0}
.nav-auth{display:flex;gap:6px;flex-shrink:0}
.btn-ghost{padding:7px 14px;border-radius:8px;border:1px solid var(--border-md);background:transparent;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
.btn-ghost:hover{border-color:var(--border-strong);background:rgba(255,255,255,0.03)}
.btn-primary{padding:7px 14px;border-radius:8px;border:none;background:var(--blue);color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
.btn-primary:hover{background:#2563eb;}

/* MOBILE TABS */
.mob-tabs{display:flex;background:rgba(7,9,15,0.97);border-top:1px solid var(--border);position:fixed;bottom:0;left:0;right:0;z-index:400;}
.mtab{flex:1;padding:10px 0 8px;border:none;background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:10px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all 0.15s;min-height:52px;}
.mtab.on{color:var(--blue)}

/* OVERLAY / MODAL */
.overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;animation:ovIn 0.16s ease;}
@keyframes ovIn{from{opacity:0}to{opacity:1}}
.modal{width:100%;max-width:480px;background:var(--card2);border:1px solid var(--border-md);border-radius:20px 20px 0 0;max-height:92vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:mSlide 0.26s cubic-bezier(0.32,0.72,0,1);}
@keyframes mSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-drag{width:40px;height:4px;border-radius:2px;background:var(--border-md);margin:12px auto 0;}
.mhead{padding:16px 20px 14px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;}
.mtitle{font-size:18px;font-weight:800;letter-spacing:-0.3px}
.msub{font-size:12px;color:var(--text2);margin-top:3px}
.mclose{width:32px;height:32px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:12px;}
.mclose:hover{color:var(--text);border-color:var(--border-strong)}
.mbody{padding:20px 20px 32px}

/* FORMS */
.fg{margin-bottom:14px}
.flbl{display:block;font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:var(--text2);margin-bottom:6px;}
.finput{width:100%;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:11px 14px;color:var(--text);font-family:'Inter',sans-serif;font-size:14px;outline:none;transition:border-color 0.15s,box-shadow 0.15s;-webkit-appearance:none;}
.finput:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
.finput.err-field{border-color:var(--red)}
.finput::placeholder{color:var(--text3)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fhint{font-size:12px;color:var(--text2);margin-top:5px;line-height:1.5}
.ferr-inline{font-size:11px;color:var(--red);margin-top:4px;display:flex;align-items:center;gap:4px}
.flink{color:var(--blue);font-size:12px;font-weight:600;background:none;border:none;cursor:pointer;padding:0}
.flink:hover{text-decoration:underline}
.ffoot{text-align:center;margin-top:14px;font-size:13px;color:var(--text2)}
.ferr{background:var(--red-dim);border:1px solid var(--red-border);border-radius:8px;padding:10px 14px;font-size:13px;color:var(--red);margin-bottom:14px;}
.fok{background:var(--green-dim);border:1px solid var(--green-border);border-radius:8px;padding:10px 14px;font-size:13px;color:var(--green);margin-bottom:14px;}
.btn-form{width:100%;padding:13px;border-radius:10px;border:none;background:var(--blue);color:#fff;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.15s;}
.btn-form:hover{background:#2563eb}
.btn-form:disabled{opacity:0.45;cursor:not-allowed}
.btn-mpesa-full{width:100%;padding:13px;border-radius:10px;border:none;background:var(--mpesa);color:#fff;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;}
.btn-mpesa-full:hover{background:var(--mpesa-hover)}
.btn-mpesa-full:disabled{opacity:0.45;cursor:not-allowed}
.presets{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.preset{padding:6px 12px;background:var(--surface);border:1px solid var(--border-md);border-radius:6px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:12px;cursor:pointer;transition:all 0.12s;}
.preset:hover{border-color:var(--mpesa);color:var(--mpesa)}
.phone-wrap{display:flex;border:1px solid var(--border-md);border-radius:8px;overflow:hidden;background:var(--surface);transition:border-color 0.15s}
.phone-wrap:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
.phone-flag{padding:0 12px;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--text2);border-right:1px solid var(--border);background:var(--card);white-space:nowrap;flex-shrink:0}
.phone-input{flex:1;background:transparent;border:none;padding:11px 14px;color:var(--text);font-family:'Inter',sans-serif;font-size:14px;outline:none;-webkit-appearance:none;}
.phone-input::placeholder{color:var(--text3)}
.pw-wrap{position:relative}
.pw-wrap .finput{padding-right:44px}
.pw-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text2);cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;}
.pw-eye:hover{color:var(--text)}

/* STK WAIT */
.stk-wait{text-align:center;padding:28px 0}
.stk-icon{width:56px;height:56px;border-radius:16px;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--green)}
.stk-title{font-size:18px;font-weight:700;margin-bottom:8px}
.stk-sub{color:var(--text2);font-size:13px;line-height:1.6}
.stk-blink{color:var(--mpesa);font-size:12px;font-weight:700;margin-top:14px;animation:blk 1.1s infinite}
@keyframes blk{0%,100%{opacity:1}50%{opacity:0.3}}

/* LAYOUT */
.layout{display:flex;flex-direction:column;gap:10px;padding:10px 12px;width:100%;max-width:1280px;margin:0 auto;}

/* GAME CARD */
.gcard{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;width:100%;}
.gtopbar{padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.live-ind{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--text2)}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:blk 1.4s infinite}
.rbadge{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border-md);color:var(--text2);}
.rbadge.flying{color:var(--amber);border-color:var(--amber-border);background:var(--amber-dim)}
.rbadge.crashed{color:var(--red);border-color:var(--red-border);background:var(--red-dim)}

/* CANVAS - IMPROVED GRAPH */
.canvas{position:relative;height:220px;background:radial-gradient(ellipse at 10% 90%,rgba(244,63,94,0.07) 0%,transparent 55%),linear-gradient(180deg,#020509 0%,#07090f 100%);overflow:hidden;}
.canvas::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);background-size:60px 44px;}
.csvg{position:absolute;inset:0;width:100%;height:100%}
.plane-el{position:absolute;pointer-events:none;transition:left 0.085s linear,bottom 0.085s linear;filter:drop-shadow(0 0 8px rgba(245,158,11,0.85)) drop-shadow(0 0 18px rgba(245,158,11,0.35));}
.plane-el.crashed-anim{animation:crashSpin 0.55s ease forwards;filter:drop-shadow(0 0 10px rgba(244,63,94,0.9))!important}
@keyframes crashSpin{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(200deg) scale(1.2)}100%{transform:rotate(380deg) scale(0);opacity:0}}
.explode-el{position:absolute;pointer-events:none;animation:explode 0.65s ease forwards;font-size:28px;line-height:1;}
@keyframes explode{0%{opacity:1;transform:scale(0.6)}60%{opacity:0.8;transform:scale(2.2)}100%{opacity:0;transform:scale(3)}}
.mult-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;user-select:none;}
.mult-num{font-family:'JetBrains Mono',monospace;font-size:54px;font-weight:700;line-height:1;letter-spacing:-2px;transition:color 0.2s;text-shadow:0 0 40px currentColor;}
.mult-num.waiting{color:var(--text3);text-shadow:none;}
.mult-num.flying{color:#ffffff;text-shadow:0 0 30px rgba(245,158,11,0.6),0 2px 0 rgba(0,0,0,0.6);}
.mult-num.flying.hi5{color:#fbbf24;text-shadow:0 0 40px rgba(251,191,36,0.8),0 2px 0 rgba(0,0,0,0.6);}
.mult-num.flying.hi10{color:var(--purple);text-shadow:0 0 40px rgba(168,85,247,0.9);animation:bigPulse 0.3s ease infinite}
.mult-num.crashed{color:var(--red);text-shadow:0 0 30px rgba(244,63,94,0.7);animation:shake 0.35s ease}
@keyframes bigPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.mult-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:6px;color:var(--text2)}
.mult-label.flying{color:rgba(245,158,11,0.7)}
.mult-label.crashed{color:var(--red)}
.win-flash{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:10;background:var(--green-dim);border:1px solid var(--green-border);border-radius:8px;padding:6px 18px;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green);white-space:nowrap;animation:popIn 0.25s ease}
@keyframes popIn{from{opacity:0;transform:translateX(-50%) scale(0.85)}to{opacity:1;transform:translateX(-50%) scale(1)}}

/* CRASH HISTORY BAR */
.cbar{display:flex;align-items:center;gap:5px;padding:8px 16px;border-bottom:1px solid var(--border);overflow-x:auto;min-height:38px;}
.cbar::-webkit-scrollbar{display:none}
.cbar-lbl{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text3);flex-shrink:0;margin-right:4px}
.cbadge{padding:3px 8px;border-radius:5px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;border:1px solid transparent;}
.cbadge.lo{background:var(--blue-dim);color:var(--blue);border-color:var(--blue-border)}
.cbadge.mi{background:rgba(100,116,139,0.1);color:#94a3b8;border-color:rgba(100,116,139,0.2)}
.cbadge.hi{background:rgba(168,85,247,0.1);color:var(--purple);border-color:rgba(168,85,247,0.25)}
.cbadge.new{animation:badgePop 0.35s cubic-bezier(0.175,0.885,0.32,1.275)}
@keyframes badgePop{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}

/* COUNTDOWN RING */
.cd-outer{display:flex;flex-direction:column;align-items:center;gap:8px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
.cd-ring{position:relative;width:72px;height:72px}
.cd-ring svg{transform:rotate(-90deg)}
.cd-track{fill:none;stroke:var(--border-md);stroke-width:3}
.cd-fill{fill:none;stroke:var(--blue);stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset 0.9s linear}
.cd-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;color:var(--blue)}
.cd-label{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2)}

/* BET PANEL */
.bpanel{padding:14px 16px 18px}
.bptabs{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:3px;margin-bottom:16px;gap:3px}
.bptab{flex:1;padding:8px;border-radius:7px;border:none;background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s}
.bptab.on{background:var(--card2);color:var(--text);}
.stepper-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.step-btn{width:44px;height:44px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.12s;}
.step-btn:hover:not(:disabled){border-color:var(--border-strong);background:var(--card2)}
.step-btn:disabled{opacity:0.3;cursor:not-allowed}
.step-val{flex:1;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:10px 12px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;text-align:center;outline:none;-webkit-appearance:none;transition:border-color 0.15s}
.step-val:focus{border-color:var(--blue)}
.step-val:disabled{opacity:0.35}
.qgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px}
.qgbtn{padding:9px 4px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.12s;text-align:center;}
.qgbtn:hover:not(:disabled){border-color:var(--border-strong);color:var(--text)}
.qgbtn:disabled{opacity:0.3;cursor:not-allowed}
.bet-cta{width:100%;padding:15px;border-radius:10px;border:none;font-family:'Inter',sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.15s;margin-bottom:14px;letter-spacing:0.2px;display:flex;align-items:center;justify-content:center;gap:8px;}
.bet-cta.place{background:var(--green);color:#fff;}
.bet-cta.place:hover:not(:disabled){background:#16a34a}
.bet-cta.place:disabled{opacity:0.4;cursor:not-allowed}
.bet-cta.cashout{background:var(--green);color:#fff;animation:glowPulse 0.9s ease infinite}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}50%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
.bet-cta.waiting-btn{background:var(--surface);border:1px solid var(--border-md);color:var(--text2);font-size:14px;cursor:default}
.bet-cta.login-btn{background:var(--blue-dim);border:1px solid var(--blue-border);color:var(--blue);font-size:14px}
.auto-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.auto-lbl{font-size:12px;font-weight:600;color:var(--text2)}
.toggle{position:relative;width:40px;height:22px;flex-shrink:0;cursor:pointer}
.toggle input{opacity:0;width:0;height:0;position:absolute}
.toggle-track{position:absolute;inset:0;border-radius:11px;background:var(--surface);border:1px solid var(--border-md);transition:all 0.2s}
.toggle input:checked+.toggle-track{background:var(--blue);border-color:var(--blue)}
.toggle-thumb{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:all 0.2s;pointer-events:none}
.toggle input:checked~.toggle-thumb{left:21px}
.aco-input{width:64px;background:var(--surface);border:1px solid var(--border-md);border-radius:7px;padding:5px 8px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;text-align:center;outline:none;transition:border-color 0.15s}
.aco-input:focus{border-color:var(--blue)}

/* PLAYERS / SIDEBAR */
.rcol{display:none;flex-direction:column;gap:10px}
.rcard{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.rhead{padding:11px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.rtitle{font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:var(--text)}
.rcnt{background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:2px 8px;font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace}
.plist{padding:4px}
.prow{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:8px;transition:background 0.1s;}
.prow:hover{background:rgba(255,255,255,0.02)}
.prow.cashed{background:rgba(34,197,94,0.04)}
.pname{font-size:12px;font-weight:600}
.pbet{font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:1px}
.pmult{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--text2)}
.pmult.cashed{color:var(--green)}

/* QUICK DEPOSIT WIDGET */
.wm-bal{background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.03));border:1px solid var(--blue-border);border-radius:10px;padding:14px;margin-bottom:12px;}
.wm-lbl{font-size:10px;color:var(--text2);letter-spacing:1px;text-transform:uppercase}
.wm-amt{font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--green);margin:5px 0 3px}
.wm-sub{font-size:11px;color:var(--text2)}
.wmini{padding:14px}

/* LIVE CHAT */
.chat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;}
.chat-feed{height:150px;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:5px;}
.chat-feed::-webkit-scrollbar{display:none}
.chat-msg{font-size:12px;line-height:1.4;}
.chat-name{font-weight:700;margin-right:4px;font-size:11px}
.chat-name.blue{color:var(--blue)}
.chat-name.green{color:var(--green)}
.chat-name.amber{color:var(--amber)}
.chat-text{color:var(--text2)}
.chat-input-row{display:flex;gap:6px;padding:10px;border-top:1px solid var(--border)}
.chat-input{flex:1;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;outline:none;transition:border-color 0.15s}
.chat-input:focus{border-color:var(--blue)}
.chat-send{width:36px;height:36px;border-radius:8px;border:none;background:var(--blue);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.15s}
.chat-send:hover{background:#2563eb}

/* MOB PLAYERS */
.mob-players{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;width:100%;}

/* PAGES */
.page{width:100%;max-width:520px;margin:14px auto;padding:0 12px}
.page.wide{max-width:680px}
.pcard{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.pcard-head{padding:18px 20px;border-bottom:1px solid var(--border)}
.pcard-title{font-size:17px;font-weight:800;letter-spacing:-0.3px}
.pcard-sub{font-size:12px;color:var(--text2);margin-top:3px}
.pcard-body{padding:18px 20px}

/* WALLET PAGE */
.big-bal{background:linear-gradient(135deg,rgba(59,130,246,0.08),transparent);border:1px solid var(--blue-border);border-radius:12px;padding:18px;margin-bottom:18px;}
.bb-lbl{font-size:10px;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase}
.bb-amt{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:var(--green);margin:6px 0 4px}
.bb-sub{font-size:12px;color:var(--text2)}
.tab-row{display:flex;gap:8px;margin-bottom:18px}
.tabbtn{flex:1;padding:10px 8px;border-radius:9px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.12s;}
.tabbtn.on-dep{background:var(--green-dim);border-color:var(--green-border);color:var(--green)}
.tabbtn.on-wd{background:var(--amber-dim);border-color:var(--amber-border);color:var(--amber)}

/* TRANSACTION HISTORY */
.filter-row{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid var(--border);overflow-x:auto}
.filter-row::-webkit-scrollbar{display:none}
.fpill{padding:5px 12px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.12s}
.fpill.on{background:var(--blue-dim);border-color:var(--blue-border);color:var(--blue)}
.hist-row{display:flex;align-items:center;justify-content:space-between;padding:13px 20px;border-bottom:1px solid rgba(255,255,255,0.03);}
.hist-l{display:flex;align-items:center;gap:10px;min-width:0}
.hist-ico{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hist-ico.dep{background:var(--green-dim);color:var(--green)}
.hist-ico.win{background:rgba(245,158,11,0.1);color:var(--amber)}
.hist-ico.loss{background:var(--red-dim);color:var(--red)}
.hist-ico.wd{background:var(--blue-dim);color:var(--blue)}
.hist-ico.bet{background:rgba(168,85,247,0.1);color:var(--purple)}
.hist-desc{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-time{font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:2px}
.hist-amt{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;flex-shrink:0;padding-left:12px}
.hist-amt.pos{color:var(--green)}
.hist-amt.neg{color:var(--red)}

/* LOCKED STATE */
.locked{display:flex;flex-direction:column;align-items:center;text-align:center;padding:52px 24px}
.locked-ico{width:56px;height:56px;border-radius:16px;background:var(--surface);border:1px solid var(--border-md);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--text2)}
.locked-title{font-size:18px;font-weight:800;margin-bottom:8px}
.locked-sub{color:var(--text2);font-size:13px;line-height:1.65;margin-bottom:22px;max-width:260px}
.locked-btns{display:flex;gap:10px}

/* STATS */
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px}
.stat-icon{margin-bottom:8px;color:var(--text2)}
.stat-val{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:var(--text)}
.stat-val.green{color:var(--green)}
.stat-val.amber{color:var(--amber)}
.stat-val.red{color:var(--red)}
.stat-lbl{font-size:11px;color:var(--text2);margin-top:4px;font-weight:500}
.acct-info{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px}
.acct-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:5px 0}
.acct-row+.acct-row{border-top:1px solid var(--border)}
.acct-key{color:var(--text2)}
.acct-val{font-weight:600}
.acct-val.mono{font-family:'JetBrains Mono',monospace;font-size:12px}
.acct-val.green{color:var(--green)}
.acct-section-lbl{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text2);margin-bottom:12px}

/* LEADERBOARD */
.lb-row{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.03);}
.lb-rank{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;width:28px;flex-shrink:0;text-align:center}
.lb-rank.gold{color:var(--amber)}
.lb-rank.silver{color:#94a3b8}
.lb-rank.bronze{color:#a16207}
.lb-av{width:32px;height:32px;border-radius:8px;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
.lb-name{flex:1;font-size:13px;font-weight:600}
.lb-sub{font-size:11px;color:var(--text2);margin-top:1px;font-family:'JetBrains Mono',monospace}
.lb-amt{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green)}

/* TOAST */
.toast{position:fixed;bottom:72px;left:50%;transform:translateX(-50%);z-index:900;width:calc(100% - 32px);max-width:320px;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;animation:tUp 0.2s ease;}
@keyframes tUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.toast.ok{background:var(--green-dim);border:1px solid var(--green-border);color:var(--green)}
.toast.err{background:var(--red-dim);border:1px solid var(--red-border);color:var(--red)}
.nodata{text-align:center;padding:32px;color:var(--text2);font-size:13px}

/* FLOAT NOTIFS */
.float-notif{position:fixed;bottom:80px;left:16px;z-index:800;pointer-events:none;display:flex;flex-direction:column;gap:6px;max-width:220px;}
.fnotif{background:var(--green-dim);border:1px solid var(--green-border);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:600;color:var(--green);animation:floatUp 4s ease forwards;}
@keyframes floatUp{0%{opacity:0;transform:translateY(16px)}10%{opacity:1;transform:translateY(0)}80%{opacity:1;transform:translateY(-8px)}100%{opacity:0;transform:translateY(-24px)}}

/* SPLASH */
.splash{position:fixed;inset:0;z-index:1000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;}
.splash-logo{font-size:26px;font-weight:800;letter-spacing:-0.5px}
.splash-logo span{color:var(--blue)}
.splash-ring{width:48px;height:48px;border-radius:50%;border:3px solid var(--border-md);border-top-color:var(--blue);animation:spin 0.9s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}

/* RESPONSIVE */
@media(min-width:540px){
  .dep-label{display:inline}
  .canvas{height:260px}
  .mult-num{font-size:62px}
  .float-notif{bottom:20px}
  .toast{bottom:20px;left:auto;right:16px;transform:none;width:auto;max-width:300px;animation:tRight 0.2s ease}
}
@keyframes tRight{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:768px){
  .ntabs{display:flex}
  .mob-tabs{display:none}
  .root{padding-bottom:0}
}
@media(min-width:960px){
  .layout{display:grid;grid-template-columns:1fr 300px;gap:12px;padding:12px 20px;}
  .rcol{display:flex}
  .mob-players{display:none}
  .canvas{height:290px}
  .mult-num{font-size:70px}
}
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
  { name: "KipC***", color: "amber", text: "That 8x was fire" },
  { name: "WanjiM***", color: "green", text: "cashed at 3.2x, nice one" },
  { name: "AviBot", color: "blue", text: "Big win alert this round!" },
  { name: "OmonB***", color: "", text: "let's go all in" },
  { name: "Amina***", color: "amber", text: "anyone else riding to 20x?" },
  { name: "JohnK***", color: "", text: "just deposited, ready" },
  { name: "FatumA***", color: "green", text: "auto cashout is the way" },
  { name: "MwanM***", color: "", text: "gg everyone" },
];

const FLOAT_WINS = [
  "WanjiM*** won KES 1,240",
  "KipC*** cashed out ×8.4",
  "Amina*** won KES 3,500",
  "OmonB*** cashed out ×5.2",
  "JohnK*** won KES 840",
  "FatumA*** cashed ×12.1",
];

function PlaneSVG({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M2 20 L38 8 L30 20 L38 32 Z" fill="#f59e0b" opacity="0.95" />
      <path d="M16 20 L25 15 L25 25 Z" fill="#fff" opacity="0.35" />
      <path d="M30 20 L25 15 L29 20 L25 25 Z" fill="#fbbf24" />
    </svg>
  );
}

function Modal({ onClose, children }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-drag" />
        {children}
      </div>
    </div>
  );
}

function PhoneInput({ value, onChange }) {
  return (
    <div className="phone-wrap">
      <div className="phone-flag">🇰🇪 +254</div>
      <input
        className="phone-input"
        placeholder="7XX XXX XXX"
        value={value.replace(/^254/, "")}
        onChange={e => onChange("254" + e.target.value.replace(/^0/, "").replace(/\D/g, ""))}
      />
    </div>
  );
}

function PwInput({ placeholder, value, onChange, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        className="finput"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <button className="pw-eye" onClick={() => setShow(s => !s)} type="button">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Login failed"); setLoading(false); return; }
      localStorage.setItem("avipesa_token", data.token);
      onLogin(data.user);
      onClose();
    } catch {
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mhead">
        <div>
          <div className="mtitle">Welcome back</div>
          <div className="msub">Sign in with your registered phone number</div>
        </div>
        <button className="mclose" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="mbody">
        {err && <div className="ferr">{err}</div>}
        <div className="fg">
          <label className="flbl">M-Pesa Number</label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
        <div className="fg">
          <label className="flbl">Password</label>
          <PwInput
            placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
        </div>
        <button className="btn-form" onClick={submit} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="ffoot">
          No account?{" "}
          <button className="flink" onClick={() => { onClose(); goRegister(); }}>Create one free</button>
        </div>
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
    if (!f.fn) e.fn = "Required";
    if (!f.ln) e.ln = "Required";
    if (f.phone.length < 12) e.phone = "Enter full number";
    if (!f.pass) e.pass = "Required";
    else if (f.pass.length < 6) e.pass = "Min 6 characters";
    if (f.pass !== f.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: f.fn, lastName: f.ln, phone: f.phone, password: f.pass }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Registration failed"); setLoading(false); return; }
      localStorage.setItem("avipesa_token", data.token);
      onLogin(data.user);
      onClose();
    } catch {
      setErr("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mhead">
        <div>
          <div className="mtitle">Create Account</div>
          <div className="msub">Join thousands of AviPesa players</div>
        </div>
        <button className="mclose" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="mbody">
        {err && <div className="ferr">{err}</div>}
        <div className="frow">
          <div className="fg">
            <label className="flbl">First Name</label>
            <input
              className={`finput ${errs.fn ? "err-field" : ""}`}
              placeholder="John"
              value={f.fn}
              onChange={e => { set("fn")(e.target.value); setErrs(p => ({ ...p, fn: "" })); }}
            />
            {errs.fn && <div className="ferr-inline">{errs.fn}</div>}
          </div>
          <div className="fg">
            <label className="flbl">Last Name</label>
            <input
              className={`finput ${errs.ln ? "err-field" : ""}`}
              placeholder="Kamau"
              value={f.ln}
              onChange={e => { set("ln")(e.target.value); setErrs(p => ({ ...p, ln: "" })); }}
            />
            {errs.ln && <div className="ferr-inline">{errs.ln}</div>}
          </div>
        </div>
        <div className="fg">
          <label className="flbl">M-Pesa Number</label>
          <PhoneInput value={f.phone} onChange={v => { set("phone")(v); setErrs(p => ({ ...p, phone: "" })); }} />
          {errs.phone && <div className="ferr-inline">{errs.phone}</div>}
        </div>
        <div className="frow">
          <div className="fg">
            <label className="flbl">Password</label>
            <PwInput
              placeholder="Min 6 chars"
              value={f.pass}
              onChange={e => { set("pass")(e.target.value); setErrs(p => ({ ...p, pass: "" })); }}
            />
            {errs.pass && <div className="ferr-inline">{errs.pass}</div>}
          </div>
          <div className="fg">
            <label className="flbl">Confirm</label>
            <PwInput
              placeholder="Repeat"
              value={f.confirm}
              onChange={e => { set("confirm")(e.target.value); setErrs(p => ({ ...p, confirm: "" })); }}
            />
            {errs.confirm && <div className="ferr-inline">{errs.confirm}</div>}
          </div>
        </div>
        <div className="fhint" style={{ marginBottom: 14 }}>
          By registering you confirm you are 18+ and agree to our{" "}
          <span style={{ color: "var(--blue)" }}>Terms of Service</span>.
        </div>
        <button className="btn-form" onClick={submit} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <div className="ffoot">
          Have an account?{" "}
          <button className="flink" onClick={() => { onClose(); goLogin(); }}>Sign in</button>
        </div>
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
    } catch {
      setErr("Network error.");
      setLoading(false);
    }
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="mhead">
        <div>
          <div className="mtitle">Deposit via M-Pesa</div>
          <div className="msub">Instant STK push · Safaricom</div>
        </div>
        {step === 0 && <button className="mclose" onClick={onClose}><X size={16} /></button>}
      </div>
      <div className="mbody">
        {step === 0 ? (
          <>
            {err && <div className="ferr">{err}</div>}
            <div className="fg">
              <label className="flbl">M-Pesa Number</label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <div className="fg">
              <label className="flbl">Amount (KES)</label>
              <input
                className="finput"
                type="number"
                placeholder="Minimum KES 10"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <div className="presets">
                {[50, 100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} className="preset" onClick={() => setAmount(String(v))}>{v}</button>
                ))}
              </div>
            </div>
            <button className="btn-mpesa-full" onClick={submit} disabled={!valid || loading}>
              <ArrowDownCircle size={18} />
              {loading ? "Sending STK..." : `Deposit ${amount && !isNaN(amt) ? fKES(amt) : ""}`}
            </button>
          </>
        ) : (
          <div className="stk-wait">
            <div className="stk-icon"><ArrowDownCircle size={28} /></div>
            <div className="stk-title">STK Push Sent</div>
            <div className="stk-sub">Check your phone and enter your M-Pesa PIN to complete the deposit.</div>
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
      else if (amt > balance) setErr("Amount exceeds your balance");
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
      onWithdraw(data.balance, amt);
      onClose();
    } catch {
      setErr("Network error.");
      setLoading(false); setStep(0);
    }
  };

  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="mhead">
        <div>
          <div className="mtitle">Withdraw Funds</div>
          <div className="msub">Send to M-Pesa · approx. 2 minutes</div>
        </div>
        {step === 0 && <button className="mclose" onClick={onClose}><X size={16} /></button>}
      </div>
      <div className="mbody">
        {step === 0 ? (
          <>
            {err && <div className="ferr">{err}</div>}
            <div className="fg">
              <label className="flbl">M-Pesa Number</label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <div className="fg">
              <label className="flbl">Amount (KES)</label>
              <input
                className="finput"
                type="number"
                placeholder="Min KES 100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <div className="presets">
                {[100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} className="preset" onClick={() => setAmount(String(v))} disabled={v > balance}>{v}</button>
                ))}
              </div>
              <div className="fhint">Available: <strong style={{ color: "var(--green)" }}>{fKES(balance)}</strong></div>
            </div>
            <button className="btn-form" onClick={toConfirm} disabled={!amount}>Review Withdrawal</button>
          </>
        ) : loading ? (
          <div className="stk-wait">
            <div className="stk-icon" style={{ background: "var(--blue-dim)", border: "1px solid var(--blue-border)", color: "var(--blue)" }}>
              <RefreshCw size={28} />
            </div>
            <div className="stk-title">Processing</div>
            <div className="stk-blink">Please wait...</div>
          </div>
        ) : (
          <>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-md)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: "var(--text2)" }}>M-Pesa Number</span>
                <span style={{ fontFamily: "monospace" }}>+{phone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: "var(--text2)" }}>Amount</span>
                <span>{fKES(amt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: "1px solid var(--border)", paddingTop: 10, fontWeight: 700 }}>
                <span style={{ color: "var(--text2)" }}>You receive</span>
                <span style={{ color: "var(--green)" }}>{fKES(amt)}</span>
              </div>
            </div>
            <button className="btn-mpesa-full" style={{ background: "var(--amber)", color: "#000", marginBottom: 10 }} onClick={confirm}>
              <Check size={18} /> Confirm Withdrawal
            </button>
            <button className="btn-ghost" style={{ width: "100%", textAlign: "center" }} onClick={() => setStep(0)}>
              Edit Details
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

function Locked({ title, sub, openLogin, openRegister }) {
  return (
    <div className="locked">
      <div className="locked-ico"><Lock size={24} /></div>
      <div className="locked-title">{title}</div>
      <div className="locked-sub">{sub}</div>
      <div className="locked-btns">
        <button className="btn-ghost" onClick={openLogin}>Sign In</button>
        <button className="btn-primary" onClick={openRegister}>Register Free</button>
      </div>
    </div>
  );
}

function CountdownRing({ cd, total = 5 }) {
  const r = 30; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (cd / total));
  return (
    <div className="cd-outer">
      <div className="cd-ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle className="cd-track" cx="36" cy="36" r={r} />
          <circle className="cd-fill" cx="36" cy="36" r={r}
            strokeDasharray={circ} strokeDashoffset={offset} />
        </svg>
        <div className="cd-val">{cd}</div>
      </div>
      <div className="cd-label">Next Round</div>
    </div>
  );
}

function BetPanel({ gs, user, hasBet, cashedOut, betAmt, setBetAmt, autoCO, setAutoCO, onBet, onCashout, onLogin, md }) {
  const [bpTab, setBpTab] = useState("bet");
  const [autoCOOn, setAutoCOOn] = useState(false);
  const amt = parseFloat(betAmt) || 0;

  const adjust = delta => {
    const cur = parseFloat(betAmt) || 0;
    setBetAmt(String(Math.max(10, cur + delta)));
  };

  const BigBtn = () => {
    if (!user) return (
      <button className="bet-cta login-btn" onClick={onLogin}>
        <Lock size={16} /> Sign In to Play
      </button>
    );
    if (gs === "flying" && hasBet && !cashedOut) return (
      <button className="bet-cta cashout" onClick={onCashout}>
        Cash Out  ×{md}
      </button>
    );
    if (gs === "waiting") return (
      <button className="bet-cta place" onClick={onBet} disabled={hasBet}>
        {hasBet ? <><Check size={16} /> Bet Placed</> : `Place Bet · ${fKES(amt)}`}
      </button>
    );
    return <button className="bet-cta waiting-btn" disabled>Waiting for next round...</button>;
  };

  return (
    <div className="bpanel">
      <div className="bptabs">
        <button className={`bptab ${bpTab === "bet" ? "on" : ""}`} onClick={() => setBpTab("bet")}>Bet</button>
        <button className={`bptab ${bpTab === "auto" ? "on" : ""}`} onClick={() => setBpTab("auto")}>Auto</button>
      </div>

      {bpTab === "bet" && (
        <>
          <div className="stepper-row">
            <button className="step-btn" onClick={() => adjust(-10)} disabled={hasBet}><Minus size={18} /></button>
            <input
              className="step-val"
              type="number"
              value={betAmt}
              onChange={e => setBetAmt(e.target.value)}
              disabled={hasBet}
            />
            <button className="step-btn" onClick={() => adjust(10)} disabled={hasBet}><Plus size={18} /></button>
          </div>
          <div className="qgrid">
            {[100, 200, 500, 1000].map(v => (
              <button key={v} className="qgbtn" onClick={() => setBetAmt(String(v))} disabled={hasBet}>
                {v.toLocaleString()}
              </button>
            ))}
          </div>
          <BigBtn />
          <div className="auto-row">
            <span className="auto-lbl">Auto Cash Out</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label className="toggle">
                <input type="checkbox" checked={autoCOOn} onChange={e => setAutoCOOn(e.target.checked)} />
                <div className="toggle-track" /><div className="toggle-thumb" />
              </label>
              {autoCOOn && (
                <input
                  className="aco-input"
                  type="number"
                  value={autoCO}
                  onChange={e => setAutoCO(e.target.value)}
                  min="1.1"
                  step="0.1"
                />
              )}
            </div>
          </div>
        </>
      )}

      {bpTab === "auto" && (
        <>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ marginBottom: 12 }}>
              <label className="flbl">Bet Amount (KES)</label>
              <input
                style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border-md)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, outline: "none" }}
                type="number"
                value={betAmt}
                onChange={e => setBetAmt(e.target.value)}
              />
            </div>
            <div>
              <label className="flbl">Auto Cash Out ×</label>
              <input
                style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border-md)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, outline: "none" }}
                type="number"
                value={autoCO}
                onChange={e => setAutoCO(e.target.value)}
                min="1.1"
                step="0.1"
              />
            </div>
          </div>
          <button className="bet-cta place" onClick={onBet} disabled={!user || hasBet || gs !== "waiting"}>
            {!user ? "Sign In to Play" : hasBet ? "Auto Running..." : "Start Auto Bet"}
          </button>
        </>
      )}
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

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p.slice(-20), { name: "You", color: "blue", text: input, id: Date.now() }]);
    setInput("");
  };

  return (
    <div className="chat-card">
      <div className="rhead">
        <span className="rtitle">Live Chat</span>
        <div className="live-ind"><div className="live-dot" />Live</div>
      </div>
      <div className="chat-feed" ref={feedRef}>
        {msgs.map((m, i) => (
          <div key={m.id || i} className="chat-msg">
            <span className={`chat-name ${m.color || ""}`}>{m.name}:</span>
            <span className="chat-text"> {m.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Say something..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button className="chat-send" onClick={send}><Send size={15} /></button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("game");
  const [ddOpen, setDdOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState([]);
  const [walletMode, setWalletMode] = useState("deposit");
  const [txnFilter, setTxnFilter] = useState("all");
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalWon: 0, totalBets: 0, biggestWin: 0, totalWagered: 0, totalLost: 0, streak: 0, streakType: "win", avgCashout: 0, cashoutCount: 0 });
  const [gs, setGs] = useState("waiting");
  const [mult, setMult] = useState(1);
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [betAmt, setBetAmt] = useState("50");
  const [autoCO, setAutoCO] = useState("2.00");
  const [planePos, setPlanePos] = useState({ x: 8, y: 18 });
  const [planeCrashed, setPlaneCrashed] = useState(false);
  const [explodePos, setExplodePos] = useState(null);
  const [cd, setCd] = useState(5);
  const [crashes, setCrashes] = useState([]);
  const [toast, setToast] = useState(null);
  const [pathPts, setPathPts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [winBanner, setWinBanner] = useState(null);
  const [floatNotifs, setFloatNotifs] = useState([]);

  const mRef = useRef(1);
  const gsRef = useRef("waiting");
  const betRef = useRef(false);
  const coRef = useRef(false);
  const socketRef = useRef(null);
  const planePosRef = useRef({ x: 8, y: 18 });

  useEffect(() => {
    const token = localStorage.getItem("avipesa_token");
    if (!token) { setAppReady(true); return; }
    const timer = setTimeout(() => setAppReady(true), 2000);
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setUser(data.user); setBalance(data.user.balance || 0);
        clearTimeout(timer); setAppReady(true);
      })
      .catch(() => {
        localStorage.removeItem("avipesa_token");
        clearTimeout(timer); setAppReady(true);
      });
    return () => clearTimeout(timer);
  }, []);

  const connectSocket = useCallback((token) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_URL, { auth: { token: token || "" }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("game:state", data => {
      setGs(data.state); setMult(data.multiplier || 1); mRef.current = data.multiplier || 1;
      setCd(data.countdown || 5); setCrashes(data.history || []); setPlayers(data.bets || []);
      gsRef.current = data.state;
    });
    socket.on("game:waiting", data => {
      gsRef.current = "waiting"; setGs("waiting"); setMult(1); mRef.current = 1;
      setPlanePos({ x: 8, y: 18 }); planePosRef.current = { x: 8, y: 18 };
      setPlaneCrashed(false); setPathPts([]);
      setCashedOut(false); setHasBet(false); betRef.current = false; coRef.current = false;
      setCrashes(data.history || []); setPlayers(data.bets || []);
    });
    socket.on("game:countdown", data => setCd(data.countdown));
    socket.on("game:flying", data => {
      gsRef.current = "flying"; setGs("flying"); setPlaneCrashed(false);
      setPathPts([{ x: 8, y: 82 }]); setPlayers(data.bets || []);
    });
    socket.on("game:tick", data => {
      const m = data.multiplier; setMult(m); mRef.current = m;
      const elapsed = Math.log(m) / 0.35;
      const px = Math.min(8 + elapsed * 12, 78);
      const py = Math.max(82 - elapsed * 14, 6);
      planePosRef.current = { x: px, y: py }; setPlanePos({ x: px, y: py });
      setPathPts(p => [...p.slice(-80), { x: px, y: py }]);
      setPlayers(data.bets || []);
    });
    socket.on("game:crashed", data => {
      gsRef.current = "crashed"; setGs("crashed"); setPlaneCrashed(true);
      setExplodePos({ ...planePosRef.current }); setTimeout(() => setExplodePos(null), 800);
      setCrashes(p => [data.multiplier, ...p].slice(0, 12)); setPlayers(data.bets || []);
      if (betRef.current && !coRef.current) {
        toast_(`Crashed ×${data.multiplier.toFixed(2)} — Lost ${fKES(parseFloat(betRef.current))}`, "err");
      }
      betRef.current = false; setHasBet(false);
    });
    socket.on("game:bets", bets => setPlayers(bets || []));
    return socket;
  }, []);

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
      if (result.ok) {
        setBalance(result.balance); setHasBet(true); betRef.current = String(a);
        toast_(`Bet placed — KES ${a}`);
      } else {
        toast_(result.error, "err");
      }
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
      } else {
        toast_(result.error, "err");
      }
    });
  }, [addTxn, toast_]);

  useEffect(() => {
    if (tab === "history" && user) {
      fetch(`${API}/wallet/transactions`, { headers: { Authorization: `Bearer ${localStorage.getItem("avipesa_token")}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setTxns(data.map(t => ({ ...t, time: new Date(t.created_at) }))); })
        .catch(() => {});
    }
  }, [tab, user]);

  useEffect(() => {
    if (tab === "leaderboard") {
      fetch(`${API}/game/leaderboard`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setLeaderboard(data.map(p => ({ name: p.name, total: p.total_won, bets: p.total_bets, best: p.best_cashout }))); })
        .catch(() => {});
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "stats" && user) {
      fetch(`${API}/game/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem("avipesa_token")}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setStats(data); })
        .catch(() => {});
    }
  }, [tab, user]);

  const handleLogin = useCallback((u, customMsg) => {
    setUser(u); setBalance(u.balance || 0);
    toast_(customMsg || `Welcome, ${u.name.split(" ")[0]}`);
    const token = localStorage.getItem("avipesa_token") || "";
    connectSocket(token);
  }, [connectSocket, toast_]);

  const handleLogout = () => {
    localStorage.removeItem("avipesa_token");
    if (socketRef.current) socketRef.current.disconnect();
    connectSocket("");
    setUser(null); setBalance(0); setDdOpen(false);
    setHasBet(false); betRef.current = false;
    toast_("Signed out");
  };

  const handleDeposit = (newBalance, amt) => {
    setBalance(newBalance); addTxn("dep", "M-Pesa Deposit", amt);
    toast_(`${fKES(amt)} deposited successfully`);
  };

  const handleWithdraw = (newBalance, amt) => {
    setBalance(newBalance); addTxn("wd", "M-Pesa Withdrawal", -amt);
    toast_(`${fKES(amt)} sent to M-Pesa`);
  };

  const md = mult.toFixed(2);
  const multClass = () => { const m = parseFloat(md); if (m >= 10) return "hi10"; if (m >= 5) return "hi5"; return ""; };

  // IMPROVED GRAPH: smooth exponential curve using quadratic bezier
  const buildPath = () => {
    if (pathPts.length < 2) return { linePath: "", fillPath: "" };
    const W = 420; const H = 280;
    const toX = p => (p.x / 100) * W;
    const toY = p => H - (p.y / 100) * H;
    let d = `M ${toX(pathPts[0])} ${toY(pathPts[0])}`;
    for (let i = 1; i < pathPts.length; i++) {
      const prev = pathPts[i - 1];
      const cur = pathPts[i];
      const cpx = (toX(prev) + toX(cur)) / 2;
      const cpy1 = toY(prev);
      const cpy2 = toY(cur);
      d += ` C ${cpx} ${cpy1}, ${cpx} ${cpy2}, ${toX(cur)} ${toY(cur)}`;
    }
    const last = pathPts[pathPts.length - 1];
    const fillPath = d + ` L ${toX(last)} ${H} L ${toX(pathPts[0])} ${H} Z`;
    return { linePath: d, fillPath };
  };

  const { linePath, fillPath } = buildPath();

  const filteredTxns = txns.filter(t => {
    if (txnFilter === "all") return true;
    if (txnFilter === "deposits") return t.type === "dep";
    if (txnFilter === "wins") return t.type === "win";
    if (txnFilter === "withdrawals") return t.type === "wd";
    return true;
  });
  const openLogin = () => setModal("login");
  const openRegister = () => setModal("register");
  const rankCls = i => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const rankLabel = i => i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}`;

  const NAV_TABS = [
    { id: "game", icon: <Zap size={15} />, label: "Game" },
    { id: "wallet", icon: <Wallet size={15} />, label: "Wallet" },
    { id: "history", icon: <History size={15} />, label: "History" },
    { id: "leaderboard", icon: <Trophy size={15} />, label: "Leaders" },
    { id: "stats", icon: <BarChart2 size={15} />, label: "My Stats" },
  ];

  const histIcon = type => {
    if (type === "dep") return <ArrowDownCircle size={18} />;
    if (type === "win") return <Award size={18} />;
    if (type === "wd") return <ArrowUpCircle size={18} />;
    return <Activity size={18} />;
  };

  if (!appReady) {
    return (
      <div className="splash">
        <div style={{ color: "var(--blue)", marginBottom: 4 }}><Zap size={40} /></div>
        <div className="splash-logo">Avi<span>Pesa</span></div>
        <div className="splash-ring" />
      </div>
    );
  }

  return (
    <div className={`root ${lightMode ? "light" : ""}`} onClick={() => ddOpen && setDdOpen(false)}>
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "ok" ? <Check size={15} /> : <Activity size={15} />}
          {toast.msg}
        </div>
      )}
      <div className="float-notif">
        {floatNotifs.map(n => <div key={n.id} className="fnotif">{n.msg}</div>)}
      </div>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-i">
          <div className="logo" onClick={() => setTab("game")}>
            <div className="logo-icon"><Zap size={18} color="#fff" /></div>
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
            <button className="icon-btn" onClick={() => setLightMode(l => !l)}>
              {lightMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            {user ? (
              <>
                <div className="bal-chip">
                  <div className="bal-lbl">Balance</div>
                  <div className="bal-val">{fKES(balance)}</div>
                </div>
                <button className="btn-deposit" onClick={() => setModal("deposit")}>
                  <ArrowDownCircle size={15} />
                  <span className="dep-label">Deposit</span>
                </button>
                <div className="av-wrap" onClick={e => e.stopPropagation()}>
                  <button className="av-avatar" onClick={() => setDdOpen(o => !o)}>
                    {user.name[0].toUpperCase()}
                  </button>
                  {ddOpen && (
                    <div className="dropdown">
                      <div className="dd-top">
                        <div className="dd-name">{user.name}</div>
                        <div className="dd-phone">+{user.phone}</div>
                      </div>
                      {NAV_TABS.map(t => (
                        <button key={t.id} className="dd-item" onClick={() => { setTab(t.id); setDdOpen(false); }}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                      <button className="dd-item" onClick={() => { setModal("deposit"); setDdOpen(false); }}>
                        <ArrowDownCircle size={15} /> Deposit
                      </button>
                      <div className="dd-sep" />
                      <button className="dd-item danger" onClick={handleLogout}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="nav-auth">
                <button className="btn-ghost" onClick={openLogin}>Sign In</button>
                <button className="btn-primary" onClick={openRegister}>Register</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE TABS */}
      <div className="mob-tabs">
        {NAV_TABS.map(t => (
          <button key={t.id} className={`mtab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* MODALS */}
      {modal === "login" && <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} goRegister={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onLogin={handleLogin} goLogin={() => setModal("login")} />}
      {modal === "deposit" && <DepositModal onClose={() => setModal(null)} onDeposit={handleDeposit} />}
      {modal === "withdraw" && <WithdrawModal onClose={() => setModal(null)} balance={balance} onWithdraw={handleWithdraw} />}

      {/* GAME TAB */}
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

              {/* CANVAS */}
              <div className="canvas">
                {explodePos && (
                  <div className="explode-el" style={{ left: `${explodePos.x}%`, bottom: `${explodePos.y}%` }}>
                    💥
                  </div>
                )}

                <svg className="csvg" viewBox="0 0 420 280" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="flGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="crGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>

                  {/* flying state: amber smooth curve */}
                  {gs === "flying" && linePath && (
                    <>
                      <path d={fillPath} fill="url(#flGrad)" />
                      {/* glow layer */}
                      <path d={linePath} fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      {/* main line */}
                      <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                    </>
                  )}

                  {/* crashed state: red smooth curve */}
                  {gs === "crashed" && linePath && (
                    <>
                      <path d={fillPath} fill="url(#crGrad)" />
                      <path d={linePath} fill="none" stroke="rgba(244,63,94,0.3)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}

                  {/* axis lines */}
                  <line x1="33" y1="0" x2="33" y2="270" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <line x1="33" y1="270" x2="420" y2="270" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                </svg>

                {gs === "waiting" && <CountdownRing cd={cd} total={5} />}

                {(gs === "flying" || gs === "crashed") && (
                  <div
                    className={`plane-el ${planeCrashed ? "crashed-anim" : ""}`}
                    style={{ left: `${planePos.x}%`, bottom: `${planePos.y}%` }}
                  >
                    <PlaneSVG size={40} />
                  </div>
                )}

                {gs !== "waiting" && (
                  <div className="mult-center">
                    <div className={`mult-num ${gs} ${gs === "flying" ? multClass() : ""}`}>{md}×</div>
                    <div className={`mult-label ${gs}`}>
                      {gs === "crashed" ? "Crashed" : "Flying"}
                    </div>
                  </div>
                )}

                {winBanner && <div className="win-flash">{winBanner}</div>}
              </div>

              {/* CRASH HISTORY */}
              <div className="cbar">
                <span className="cbar-lbl">Recent</span>
                {crashes.map((v, i) => (
                  <span key={i} className={`cbadge ${cbCls(v)} ${i === 0 ? "new" : ""}`}>
                    {Number(v).toFixed(2)}×
                  </span>
                ))}
              </div>

              <BetPanel
                gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
                betAmt={betAmt} setBetAmt={setBetAmt} autoCO={autoCO} setAutoCO={setAutoCO}
                onBet={handleBet} onCashout={doCashout} onLogin={() => setModal("login")} md={md}
              />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="rcol">
            <div className="rcard">
              <div className="rhead">
                <span className="rtitle">Active Players</span>
                <span className="rcnt">{players.length}</span>
              </div>
              <div className="plist">
                {players.map((p, i) => (
                  <div key={p.id || i} className={`prow ${p.cashed ? "cashed" : ""}`}>
                    <div>
                      <div className="pname">{p.name}</div>
                      <div className="pbet">KES {p.bet}</div>
                    </div>
                    {gs === "flying" && !p.cashed && <div className="pmult">{md}×</div>}
                    {p.cashed && <div className="pmult cashed">✓ {p.cashMult}×</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rcard">
              <div className="rhead">
                <span className="rtitle">Quick Deposit</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: "var(--mpesa)", color: "#fff", padding: "2px 8px", borderRadius: 5, letterSpacing: 1 }}>M-PESA</span>
              </div>
              <div className="wmini">
                {user ? (
                  <>
                    <div className="wm-bal">
                      <div className="wm-lbl">Balance</div>
                      <div className="wm-amt">{fKES(balance)}</div>
                      <div className="wm-sub">AviPesa Wallet</div>
                    </div>
                    <button className="btn-mpesa-full" onClick={() => setModal("deposit")}>
                      <ArrowDownCircle size={16} /> Deposit via M-Pesa
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
                      Sign in to deposit and start playing
                    </div>
                    <button className="btn-mpesa-full" onClick={openLogin}>Sign In to Deposit</button>
                  </div>
                )}
              </div>
            </div>

            <LiveChat />
          </div>

          {/* MOBILE PLAYERS */}
          <div className="mob-players">
            <div className="rhead">
              <span className="rtitle">Active Players</span>
              <span className="rcnt">{players.length}</span>
            </div>
            <div className="plist">
              {players.slice(0, 5).map((p, i) => (
                <div key={p.id || i} className={`prow ${p.cashed ? "cashed" : ""}`}>
                  <div>
                    <div className="pname">{p.name}</div>
                    <div className="pbet">KES {p.bet}</div>
                  </div>
                  {gs === "flying" && !p.cashed && <div className="pmult">{md}×</div>}
                  {p.cashed && <div className="pmult cashed">✓ {p.cashMult}×</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WALLET TAB */}
      {tab === "wallet" && (
        <div className="page">
          <div className="pcard">
            {!user ? (
              <Locked title="Wallet Locked" sub="Sign in to view your balance, deposit or withdraw funds." openLogin={openLogin} openRegister={openRegister} />
            ) : (
              <>
                <div className="pcard-head">
                  <div className="pcard-title">My Wallet</div>
                  <div className="pcard-sub">Manage your AviPesa funds</div>
                </div>
                <div className="pcard-body">
                  <div className="big-bal">
                    <div className="bb-lbl">Available Balance</div>
                    <div className="bb-amt">{fKES(balance)}</div>
                    <div className="bb-sub">Kenyan Shilling · AviPesa Account</div>
                  </div>
                  <div className="tab-row">
                    <button className={`tabbtn ${walletMode === "deposit" ? "on-dep" : ""}`} onClick={() => setWalletMode("deposit")}>
                      <ArrowDownCircle size={16} /> Deposit
                    </button>
                    <button className={`tabbtn ${walletMode === "withdraw" ? "on-wd" : ""}`} onClick={() => setWalletMode("withdraw")}>
                      <ArrowUpCircle size={16} /> Withdraw
                    </button>
                  </div>
                  {walletMode === "deposit" ? (
                    <button className="btn-mpesa-full" onClick={() => setModal("deposit")}>
                      <ArrowDownCircle size={16} /> Deposit via M-Pesa
                    </button>
                  ) : (
                    <button className="btn-mpesa-full" style={{ background: "var(--amber)", color: "#000" }} onClick={() => setModal("withdraw")}>
                      <ArrowUpCircle size={16} /> Withdraw Funds
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div className="page wide">
          <div className="pcard">
            {!user ? (
              <Locked title="History Locked" sub="Sign in to view your transaction history." openLogin={openLogin} openRegister={openRegister} />
            ) : (
              <>
                <div className="pcard-head">
                  <div className="pcard-title">Transaction History</div>
                  <div className="pcard-sub">{filteredTxns.length} records</div>
                </div>
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
                      <div>
                        <div className="hist-desc">{t.label}</div>
                        <div className="hist-time">{fDate(t.time)} · {fTime(t.time)}</div>
                      </div>
                    </div>
                    <div className={`hist-amt ${t.amount >= 0 ? "pos" : "neg"}`}>
                      {t.amount >= 0 ? "+" : ""}{fKES(Math.abs(t.amount))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {tab === "leaderboard" && (
        <div className="page wide">
          <div className="pcard">
            <div className="pcard-head">
              <div className="pcard-title">Leaderboard</div>
              <div className="pcard-sub">Top players this month</div>
            </div>
            {leaderboard.length === 0 && <div className="nodata">Loading leaderboard...</div>}
            {leaderboard.map((p, i) => (
              <div key={i} className="lb-row">
                <div className={`lb-rank ${rankCls(i)}`}>{rankLabel(i)}</div>
                <div className="lb-av">{p.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div className="lb-name">{p.name}</div>
                  <div className="lb-sub">{p.bets} bets · Best ×{Number(p.best).toFixed(2)}</div>
                </div>
                <div className="lb-amt">{fKES(p.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {tab === "stats" && (
        <div className="page">
          <div className="pcard">
            {!user ? (
              <Locked title="Stats Locked" sub="Sign in to see your personal performance statistics." openLogin={openLogin} openRegister={openRegister} />
            ) : (
              <>
                <div className="pcard-head">
                  <div className="pcard-title">My Stats</div>
                  <div className="pcard-sub">Your performance overview</div>
                </div>
                <div className="pcard-body">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon"><Activity size={18} /></div>
                      <div className="stat-val amber">{stats.totalBets}</div>
                      <div className="stat-lbl">Total Bets</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><TrendingUp size={18} /></div>
                      <div className="stat-val green">{fKES(stats.totalWon)}</div>
                      <div className="stat-lbl">Total Won</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><DollarSign size={18} /></div>
                      <div className="stat-val red">{fKES(stats.totalLost || 0)}</div>
                      <div className="stat-lbl">Total Lost</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><Award size={18} /></div>
                      <div className="stat-val amber">{stats.biggestWin > 0 ? `×${Number(stats.biggestWin).toFixed(2)}` : "—"}</div>
                      <div className="stat-lbl">Best Cashout</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><Target size={18} /></div>
                      <div className="stat-val">{stats.avgCashout > 0 ? `×${Number(stats.avgCashout).toFixed(2)}` : "—"}</div>
                      <div className="stat-lbl">Avg Cashout</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><Percent size={18} /></div>
                      <div className="stat-val">{stats.totalBets > 0 ? `${Math.round((stats.cashoutCount / stats.totalBets) * 100)}%` : "—"}</div>
                      <div className="stat-lbl">Win Rate</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><DollarSign size={18} /></div>
                      <div className="stat-val">{fKES(stats.totalWagered || 0)}</div>
                      <div className="stat-lbl">Total Wagered</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon"><TrendingUp size={18} /></div>
                      <div className={`stat-val ${(stats.totalWon - (stats.totalLost || 0)) >= 0 ? "green" : "red"}`}>
                        {fKES(stats.totalWon - (stats.totalLost || 0))}
                      </div>
                      <div className="stat-lbl">Net Profit</div>
                    </div>
                  </div>
                  <div className="acct-info">
                    <div className="acct-section-lbl">Account Details</div>
                    <div className="acct-row">
                      <span className="acct-key">Name</span>
                      <span className="acct-val">{user.name}</span>
                    </div>
                    <div className="acct-row">
                      <span className="acct-key">Phone</span>
                      <span className="acct-val mono">+{user.phone}</span>
                    </div>
                    <div className="acct-row">
                      <span className="acct-key">Balance</span>
                      <span className="acct-val green">{fKES(balance)}</span>
                    </div>
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