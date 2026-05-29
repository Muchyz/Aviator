import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Wallet, History, Trophy, BarChart2, LogOut,
  Eye, EyeOff, X, Plus, Minus,
  TrendingUp, DollarSign, Award,
  MessageSquare, Users, User, Lock,
  Target, Percent, Activity, Send, Check,
  ArrowUpCircle, ArrowDownCircle, RefreshCw,
  Volume2, VolumeX, RotateCcw, ShieldCheck,
  Flame, Star, Sparkles
} from "lucide-react";

(() => {
  if (document.getElementById("av-fonts")) return;
  const l = document.createElement("link");
  l.id = "av-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
  document.head.appendChild(l);
})();

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#04060d;--surface:#080c17;--card:#0d1220;--card2:#111828;
  --border:rgba(255,255,255,0.04);--border-md:rgba(255,255,255,0.08);--border-strong:rgba(255,255,255,0.14);
  --blue:#5b9cf6;--blue-dim:rgba(91,156,246,0.08);--blue-border:rgba(91,156,246,0.25);
  --green:#00f5a0;--green-dim:rgba(0,245,160,0.07);--green-border:rgba(0,245,160,0.28);
  --red:#ff3d68;--red-dim:rgba(255,61,104,0.09);--red-border:rgba(255,61,104,0.28);
  --amber:#ffbe0b;--amber-dim:rgba(255,190,11,0.09);--amber-border:rgba(255,190,11,0.28);
  --purple:#b57bee;--purple-dim:rgba(181,123,238,0.1);
  --mpesa:#00b84a;--mpesa-hover:#009d3f;
  --text:#eef2ff;--text2:#5a6a8a;--text3:#1e2840;
  --glow-amber:rgba(255,190,11,0.15);--glow-green:rgba(0,245,160,0.12);--glow-red:rgba(255,61,104,0.15);
  --shadow:0 4px 24px rgba(0,0,0,0.6);--shadow-lg:0 12px 56px rgba(0,0,0,0.8);
  --r:11px;--r-sm:7px;
}
html,body{width:100%;overflow-x:hidden;background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--border-md);border-radius:3px}
.root{min-height:100vh;width:100%;overflow-x:hidden;background:var(--bg);padding-bottom:56px;
  background-image:radial-gradient(ellipse 80% 40% at 50% -10%,rgba(91,156,246,0.06) 0%,transparent 60%);}

.nav{position:sticky;top:0;z-index:400;height:50px;background:rgba(4,6,13,0.96);backdrop-filter:blur(28px);border-bottom:1px solid var(--border);width:100%;}
.nav-i{width:100%;max-width:1320px;margin:0 auto;height:100%;padding:0 14px;display:flex;align-items:center;gap:8px;}
.logo{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;flex-shrink:0;}
.logo-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#5b9cf6,#b57bee);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 16px rgba(91,156,246,0.35);}
.logo-text{font-size:16px;font-weight:800;letter-spacing:-0.4px;color:var(--text);}
.logo-text span{background:linear-gradient(90deg,#5b9cf6,#b57bee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.ntabs{display:none;gap:1px;margin:0 14px;flex:1;}
.ntab{padding:5px 12px;border-radius:7px;border:none;background:transparent;color:var(--text2);font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:5px;white-space:nowrap;letter-spacing:0.2px;}
.ntab:hover{color:var(--text);background:rgba(255,255,255,0.03)}
.ntab.on{background:var(--blue-dim);color:var(--blue);border:1px solid var(--blue-border);}
.nav-r{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:auto}
.bal-chip{display:flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:4px 10px;}
.bal-lbl{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2);display:none;}
.bal-val{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--green)}
.btn-deposit{display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:8px;border:none;background:var(--mpesa);color:#fff;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;white-space:nowrap;flex-shrink:0;box-shadow:0 0 14px rgba(0,184,74,0.25);}
.btn-deposit:hover{background:var(--mpesa-hover);box-shadow:0 0 20px rgba(0,184,74,0.35);}
.dep-label{display:none}
.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;}
.icon-btn:hover{border-color:var(--border-strong);color:var(--text)}
.av-wrap{position:relative}
.av-avatar{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#5b9cf6,#b57bee);border:none;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;cursor:pointer;box-shadow:0 0 12px rgba(91,156,246,0.3);}
.dropdown{position:absolute;top:calc(100% + 8px);right:0;min-width:200px;z-index:500;background:var(--card2);border:1px solid var(--border-md);border-radius:14px;padding:5px;box-shadow:var(--shadow-lg);animation:fdDown 0.14s ease;}
@keyframes fdDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.dd-top{padding:12px 13px 10px;border-bottom:1px solid var(--border);margin-bottom:4px}
.dd-name{font-size:13px;font-weight:700;letter-spacing:-0.2px}
.dd-phone{font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:2px}
.dd-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border-radius:8px;border:none;background:transparent;color:var(--text);font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;text-align:left;transition:background 0.12s;}
.dd-item:hover{background:rgba(255,255,255,0.04)}
.dd-item.danger{color:var(--red)}
.dd-sep{height:1px;background:var(--border);margin:4px 0}
.nav-auth{display:flex;gap:5px}
.btn-ghost{padding:5px 12px;border-radius:8px;border:1px solid var(--border-md);background:transparent;color:var(--text);font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;}
.btn-ghost:hover{border-color:var(--border-strong);background:rgba(255,255,255,0.03)}
.btn-primary{padding:5px 12px;border-radius:8px;border:none;background:var(--blue);color:#fff;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;box-shadow:0 0 12px rgba(91,156,246,0.3);}
.btn-primary:hover{background:#4a8ae5}

.mob-tabs{display:flex;background:rgba(4,6,13,0.98);border-top:1px solid var(--border);position:fixed;bottom:0;left:0;right:0;z-index:400;backdrop-filter:blur(20px);}
.mtab{flex:1;padding:7px 0 5px;border:none;background:transparent;color:var(--text2);font-family:'Syne',sans-serif;font-size:9px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:all 0.15s;min-height:46px;letter-spacing:0.3px;}
.mtab.on{color:var(--blue)}
.mtab.on svg{filter:drop-shadow(0 0 6px rgba(91,156,246,0.5))}

.overlay{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center;animation:ovIn 0.15s ease;}
@keyframes ovIn{from{opacity:0}to{opacity:1}}
.modal{width:100%;max-width:460px;background:var(--card2);border:1px solid var(--border-md);border-radius:20px 20px 0 0;max-height:94vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:mSlide 0.28s cubic-bezier(0.32,0.72,0,1);}
@keyframes mSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-drag{width:40px;height:4px;border-radius:2px;background:var(--border-md);margin:12px auto 0;}
.mhead{padding:14px 18px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;}
.mtitle{font-size:17px;font-weight:800;letter-spacing:-0.4px}
.msub{font-size:11px;color:var(--text2);margin-top:2px}
.mclose{width:29px;height:29px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:10px;transition:all 0.12s;}
.mclose:hover{color:var(--text);border-color:var(--border-strong)}
.mbody{padding:18px 18px 30px}
.fg{margin-bottom:13px}
.flbl{display:block;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text2);margin-bottom:5px;}
.finput{width:100%;background:var(--surface);border:1px solid var(--border-md);border-radius:9px;padding:11px 13px;color:var(--text);font-family:'Syne',sans-serif;font-size:14px;outline:none;transition:border-color 0.15s,box-shadow 0.15s;-webkit-appearance:none;}
.finput:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(91,156,246,0.1)}
.finput.err-field{border-color:var(--red)}
.finput::placeholder{color:var(--text3)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fhint{font-size:11px;color:var(--text2);margin-top:5px;line-height:1.5}
.ferr-inline{font-size:11px;color:var(--red);margin-top:3px}
.flink{color:var(--blue);font-size:12px;font-weight:700;background:none;border:none;cursor:pointer;padding:0}
.flink:hover{text-decoration:underline}
.ffoot{text-align:center;margin-top:14px;font-size:13px;color:var(--text2)}
.ferr{background:var(--red-dim);border:1px solid var(--red-border);border-radius:9px;padding:9px 13px;font-size:13px;color:var(--red);margin-bottom:13px;}
.fok{background:var(--green-dim);border:1px solid var(--green-border);border-radius:9px;padding:9px 13px;font-size:13px;color:var(--green);margin-bottom:13px;}
.btn-form{width:100%;padding:13px;border-radius:10px;border:none;background:var(--blue);color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.15s;box-shadow:0 0 16px rgba(91,156,246,0.25);}
.btn-form:hover{background:#4a8ae5;box-shadow:0 0 24px rgba(91,156,246,0.4)}
.btn-form:disabled{opacity:0.4;cursor:not-allowed;box-shadow:none}
.btn-mpesa-full{width:100%;padding:13px;border-radius:10px;border:none;background:var(--mpesa);color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 0 16px rgba(0,184,74,0.22);}
.btn-mpesa-full:hover{background:var(--mpesa-hover);box-shadow:0 0 24px rgba(0,184,74,0.35)}
.btn-mpesa-full:disabled{opacity:0.4;cursor:not-allowed;box-shadow:none}
.presets{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}
.preset{padding:5px 11px;background:var(--surface);border:1px solid var(--border-md);border-radius:7px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:12px;cursor:pointer;transition:all 0.12s;}
.preset:hover{border-color:var(--mpesa);color:var(--mpesa)}
.phone-wrap{display:flex;border:1px solid var(--border-md);border-radius:9px;overflow:hidden;background:var(--surface);transition:border-color 0.15s,box-shadow 0.15s}
.phone-wrap:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(91,156,246,0.1)}
.phone-flag{padding:0 11px;display:flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:var(--text2);border-right:1px solid var(--border);background:var(--card);white-space:nowrap;flex-shrink:0}
.phone-input{flex:1;background:transparent;border:none;padding:11px 13px;color:var(--text);font-family:'Syne',sans-serif;font-size:14px;outline:none;-webkit-appearance:none;}
.phone-input::placeholder{color:var(--text3)}
.pw-wrap{position:relative}
.pw-wrap .finput{padding-right:42px}
.pw-eye{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text2);cursor:pointer;padding:3px;display:flex;align-items:center;justify-content:center;}
.pw-eye:hover{color:var(--text)}
.stk-wait{text-align:center;padding:28px 0}
.stk-icon{width:56px;height:56px;border-radius:16px;background:var(--green-dim);border:1px solid var(--green-border);display:flex;align-items:center;justify-content:center;margin:0 auto 15px;color:var(--green);box-shadow:0 0 20px var(--glow-green);}
.stk-title{font-size:17px;font-weight:800;margin-bottom:8px;letter-spacing:-0.3px}
.stk-sub{color:var(--text2);font-size:13px;line-height:1.6}
.stk-blink{color:var(--mpesa);font-size:12px;font-weight:700;margin-top:14px;animation:blk 1.1s infinite}
@keyframes blk{0%,100%{opacity:1}50%{opacity:0.3}}

.layout{display:flex;flex-direction:column;gap:10px;padding:8px;width:100%;max-width:1320px;margin:0 auto;}
.gcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;width:100%;}
.gtopbar{padding:7px 11px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:5px;min-height:40px;flex-wrap:wrap;background:rgba(0,0,0,0.2);}
.live-ind{display:flex;align-items:center;gap:4px;font-size:9px;font-weight:700;color:var(--text2);flex-shrink:0;margin-right:2px;letter-spacing:0.8px;text-transform:uppercase;}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:blk 1.4s infinite;flex-shrink:0;}
.rbadge{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;padding:3px 8px;border-radius:5px;background:var(--surface);border:1px solid var(--border-md);color:var(--text2);flex-shrink:0;letter-spacing:0.3px;}
.rbadge.flying{color:var(--amber);border-color:var(--amber-border);background:var(--amber-dim);box-shadow:0 0 10px var(--glow-amber);}
.rbadge.crashed{color:var(--red);border-color:var(--red-border);background:var(--red-dim);}
.topbar-sep{width:1px;height:14px;background:var(--border-md);flex-shrink:0;margin:0 3px;}
.crashes-inline{display:flex;align-items:center;gap:3px;overflow-x:auto;flex:1;min-width:0;}
.crashes-inline::-webkit-scrollbar{display:none}
.cbadge{padding:3px 8px;border-radius:5px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;border:1px solid transparent;transition:all 0.2s;}
.cbadge.lo{background:rgba(91,156,246,0.07);color:#7eb4f7;border-color:rgba(91,156,246,0.18)}
.cbadge.mi{background:rgba(90,106,138,0.07);color:#8a9ab8;border-color:rgba(90,106,138,0.14)}
.cbadge.hi{background:rgba(181,123,238,0.09);color:var(--purple);border-color:rgba(181,123,238,0.22)}
.cbadge.new{animation:badgePop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)}
@keyframes badgePop{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}

.canvas{position:relative;height:240px;overflow:hidden;border-bottom:1px solid var(--border);
  background:radial-gradient(ellipse 100% 60% at 50% 100%,rgba(91,156,246,0.04) 0%,transparent 65%),
  linear-gradient(180deg,#02040c 0%,#04060f 50%,#060a15 100%);}
.csvg{position:absolute;inset:0;width:100%;height:100%;}

.mult-overlay{position:absolute;top:10px;left:50%;transform:translateX(-50%);text-align:center;pointer-events:none;user-select:none;z-index:5;}
.mult-num{font-family:'JetBrains Mono',monospace;font-size:50px;font-weight:700;line-height:1;letter-spacing:-3px;transition:color 0.2s;}
.mult-num.waiting{color:var(--text3);}
.mult-num.flying{color:#ffffff;}
.mult-num.flying.hi5{color:var(--amber);text-shadow:0 0 30px rgba(255,190,11,0.5);}
.mult-num.flying.hi10{color:var(--purple);text-shadow:0 0 50px rgba(181,123,238,0.8);animation:bigPulse 0.45s ease infinite}
.mult-num.crashed{color:var(--red);text-shadow:0 0 30px rgba(255,61,104,0.6);animation:shake 0.4s ease}
@keyframes bigPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.mult-label{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-top:4px;color:var(--text2)}
.mult-label.flying{color:rgba(255,190,11,0.45)}
.mult-label.crashed{color:var(--red);opacity:0.7}
.win-flash{position:absolute;top:10px;right:11px;z-index:10;background:rgba(0,245,160,0.1);border:1px solid var(--green-border);border-radius:8px;padding:5px 13px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--green);white-space:nowrap;animation:popIn 0.28s ease;backdrop-filter:blur(12px);box-shadow:0 0 18px var(--glow-green);}
@keyframes popIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}

.cd-outer{display:flex;flex-direction:column;align-items:center;gap:8px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:5;}
.cd-ring{position:relative;width:68px;height:68px}
.cd-ring svg{transform:rotate(-90deg)}
.cd-track{fill:none;stroke:var(--border-md);stroke-width:2.5}
.cd-fill{fill:none;stroke:var(--blue);stroke-width:2.5;stroke-linecap:round;transition:stroke-dashoffset 0.9s linear;filter:drop-shadow(0 0 6px rgba(91,156,246,0.5));}
.cd-val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:var(--blue)}
.cd-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2)}

.bpanel{padding:11px 13px 15px}
.bpanel-header{display:flex;align-items:center;justify-content:space-between;padding:9px 13px 0;border-top:1px solid var(--border);}
.bpanel-title{font-size:10px;font-weight:700;color:var(--text2);letter-spacing:0.8px;text-transform:uppercase;}
.dual-toggle-row{display:flex;align-items:center;gap:6px;}
.dual-lbl{font-size:10px;font-weight:600;color:var(--text2);}
.stepper-row{display:flex;align-items:center;gap:7px;margin-bottom:9px}
.step-btn{width:42px;height:42px;border-radius:9px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.12s;}
.step-btn:hover:not(:disabled){border-color:var(--border-strong);background:var(--card2);color:var(--blue)}
.step-btn:disabled{opacity:0.3;cursor:not-allowed}
.step-val{flex:1;background:var(--surface);border:1px solid var(--border-md);border-radius:9px;padding:9px 11px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;text-align:center;outline:none;-webkit-appearance:none;transition:border-color 0.15s}
.step-val:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(91,156,246,0.1)}
.step-val:disabled{opacity:0.35}
.qgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:11px}
.qgbtn{padding:8px 4px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.12s;text-align:center;}
.qgbtn:hover:not(:disabled){border-color:var(--blue-border);color:var(--blue);background:var(--blue-dim)}
.qgbtn:disabled{opacity:0.3;cursor:not-allowed}
.bet-cta{width:100%;padding:14px;border-radius:10px;border:none;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.15s;margin-bottom:11px;letter-spacing:0.2px;display:flex;align-items:center;justify-content:center;gap:8px;}
.bet-cta.place{background:linear-gradient(135deg,#00c853,#00f5a0);color:#001a0d;box-shadow:0 0 20px rgba(0,245,160,0.2);}
.bet-cta.place:hover:not(:disabled){filter:brightness(1.07);box-shadow:0 0 30px rgba(0,245,160,0.35)}
.bet-cta.place:disabled{opacity:0.45;cursor:not-allowed;box-shadow:none}
.bet-cta.cashout{background:linear-gradient(135deg,#ff8800,#ffbe0b);color:#1a0a00;box-shadow:0 0 24px rgba(255,190,11,0.28);animation:cashGlow 1.1s ease infinite}
@keyframes cashGlow{0%,100%{box-shadow:0 0 24px rgba(255,190,11,0.28)}50%{box-shadow:0 0 40px rgba(255,190,11,0.5)}}
.bet-cta.waiting-btn{background:var(--surface);border:1px solid var(--border-md);color:var(--text2);font-size:13px;cursor:default}
.bet-cta.login-btn{background:var(--blue-dim);border:1px solid var(--blue-border);color:var(--blue);font-size:14px}
.bet-cta.login-btn:hover{background:rgba(91,156,246,0.14)}
.auto-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.auto-lbl{font-size:11px;font-weight:600;color:var(--text2)}
.toggle{position:relative;width:36px;height:20px;flex-shrink:0;cursor:pointer}
.toggle input{opacity:0;width:0;height:0;position:absolute}
.toggle-track{position:absolute;inset:0;border-radius:10px;background:var(--surface);border:1px solid var(--border-md);transition:all 0.2s}
.toggle input:checked+.toggle-track{background:var(--blue);border-color:var(--blue);box-shadow:0 0 8px rgba(91,156,246,0.35)}
.toggle-thumb{position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:50%;background:#fff;transition:all 0.2s;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.3)}
.toggle input:checked~.toggle-thumb{left:19px}
.aco-input{width:60px;background:var(--surface);border:1px solid var(--border-md);border-radius:7px;padding:4px 7px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;text-align:center;outline:none;transition:border-color 0.15s}
.aco-input:focus{border-color:var(--blue)}
.dual-panels{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid var(--border);}
.dual-panel-wrap{border-right:1px solid var(--border);}
.dual-panel-wrap:last-child{border-right:none;}
.dual-panel-label{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2);padding:7px 13px 0;display:flex;align-items:center;gap:5px;}
.dual-panel-label .dot{width:6px;height:6px;border-radius:50%;background:var(--blue);box-shadow:0 0 5px var(--blue);}
.dual-panel-label .dot.p2{background:var(--amber);box-shadow:0 0 5px var(--amber);}
.space-hint{display:flex;align-items:center;justify-content:center;gap:5px;font-size:9px;color:var(--text3);margin-top:-8px;margin-bottom:9px;user-select:none;}
.space-key{display:inline-block;background:var(--surface);border:1px solid var(--border-md);border-radius:4px;padding:1px 7px;font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--text2);}
.repeat-btn{display:flex;align-items:center;gap:4px;padding:5px 9px;background:var(--surface);border:1px solid var(--border-md);border-radius:7px;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;cursor:pointer;transition:all 0.12s;white-space:nowrap;margin-bottom:11px;}
.repeat-btn:hover:not(:disabled){border-color:var(--border-strong);color:var(--text)}
.repeat-btn:disabled{opacity:0.3;cursor:not-allowed}

.pf-bar{border-top:1px solid var(--border);padding:6px 11px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;background:rgba(0,0,0,0.15);}
.pf-label{font-size:9px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:var(--text3);flex-shrink:0;}
.pf-hash{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
.pf-toggle{font-size:9px;font-weight:700;color:var(--blue);background:none;border:none;cursor:pointer;flex-shrink:0;padding:2px 6px;border-radius:5px;display:flex;align-items:center;gap:3px;transition:background 0.12s;}
.pf-toggle:hover{background:var(--blue-dim);}
.round-id-badge{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;color:var(--text3);background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:2px 6px;flex-shrink:0;}

.rcol{display:none;flex-direction:column;gap:10px}
.rcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.rhead{padding:10px 13px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.rtitle{font-size:10px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:var(--text)}
.rcnt{background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:2px 7px;font-size:10px;color:var(--text2);font-family:'JetBrains Mono',monospace}
.plist{padding:3px;max-height:250px;overflow-y:auto;}
.plist::-webkit-scrollbar{width:2px}
.plist::-webkit-scrollbar-thumb{background:var(--border-md)}
.prow{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border-radius:7px;transition:background 0.1s;}
.prow:hover{background:rgba(255,255,255,0.02)}
.prow.cashed{background:rgba(0,245,160,0.03)}
.pname{font-size:11px;font-weight:600}
.pbet{font-size:9px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:1px}
.pmult{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--text2)}
.pmult.cashed{color:var(--green)}
.wm-bal{background:linear-gradient(135deg,rgba(91,156,246,0.07),rgba(91,156,246,0.02));border:1px solid var(--blue-border);border-radius:10px;padding:12px;margin-bottom:11px;}
.wm-lbl{font-size:9px;color:var(--text2);letter-spacing:1px;text-transform:uppercase}
.wm-amt{font-family:'JetBrains Mono',monospace;font-size:19px;font-weight:700;color:var(--green);margin:4px 0 2px}
.wm-sub{font-size:10px;color:var(--text2)}
.wmini{padding:12px}

.chat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;}
.chat-feed{height:140px;overflow-y:auto;padding:9px;display:flex;flex-direction:column;gap:4px;}
.chat-feed::-webkit-scrollbar{display:none}
.chat-msg{font-size:11px;line-height:1.5;}
.chat-name{font-weight:700;margin-right:3px;font-size:10px}
.chat-name.blue{color:var(--blue)}
.chat-name.green{color:var(--green)}
.chat-name.amber{color:var(--amber)}
.chat-text{color:var(--text2)}
.chat-input-row{display:flex;gap:6px;padding:9px;border-top:1px solid var(--border)}
.chat-input{flex:1;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;padding:7px 11px;color:var(--text);font-family:'Syne',sans-serif;font-size:12px;outline:none;transition:border-color 0.15s}
.chat-input:focus{border-color:var(--blue)}
.chat-send{width:33px;height:33px;border-radius:8px;border:none;background:var(--blue);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 10px rgba(91,156,246,0.25);transition:all 0.12s;}
.chat-send:hover{background:#4a8ae5}
.mob-players{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;width:100%;}

.page{width:100%;max-width:500px;margin:10px auto;padding:0 8px}
.page.wide{max-width:660px}
.pcard{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.pcard-head{padding:15px 17px;border-bottom:1px solid var(--border)}
.pcard-title{font-size:16px;font-weight:800;letter-spacing:-0.4px}
.pcard-sub{font-size:11px;color:var(--text2);margin-top:2px}
.pcard-body{padding:15px 17px}
.big-bal{background:linear-gradient(135deg,rgba(91,156,246,0.07),transparent);border:1px solid var(--blue-border);border-radius:11px;padding:15px;margin-bottom:15px;}
.bb-lbl{font-size:9px;color:var(--text2);letter-spacing:1.2px;text-transform:uppercase}
.bb-amt{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:var(--green);margin:5px 0 3px}
.bb-sub{font-size:11px;color:var(--text2)}
.tab-row{display:flex;gap:7px;margin-bottom:15px}
.tabbtn{flex:1;padding:9px 6px;border-radius:9px;border:1px solid var(--border-md);background:var(--surface);color:var(--text2);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.12s;}
.tabbtn.on-dep{background:var(--green-dim);border-color:var(--green-border);color:var(--green)}
.tabbtn.on-wd{background:var(--amber-dim);border-color:var(--amber-border);color:var(--amber)}
.filter-row{display:flex;gap:5px;padding:9px 13px;border-bottom:1px solid var(--border);overflow-x:auto}
.filter-row::-webkit-scrollbar{display:none}
.fpill{padding:4px 11px;border-radius:16px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all 0.12s;letter-spacing:0.2px}
.fpill.on{background:var(--blue-dim);border-color:var(--blue-border);color:var(--blue)}
.hist-row{display:flex;align-items:center;justify-content:space-between;padding:11px 17px;border-bottom:1px solid rgba(255,255,255,0.02);}
.hist-l{display:flex;align-items:center;gap:9px;min-width:0}
.hist-ico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hist-ico.dep{background:var(--green-dim);color:var(--green)}
.hist-ico.win{background:var(--amber-dim);color:var(--amber)}
.hist-ico.loss{background:var(--red-dim);color:var(--red)}
.hist-ico.wd{background:var(--blue-dim);color:var(--blue)}
.hist-ico.bet{background:var(--purple-dim);color:var(--purple)}
.hist-desc{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.1px}
.hist-time{font-size:9px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:2px}
.hist-amt{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;flex-shrink:0;padding-left:11px}
.hist-amt.pos{color:var(--green)}
.hist-amt.neg{color:var(--red)}
.locked{display:flex;flex-direction:column;align-items:center;text-align:center;padding:50px 22px}
.locked-ico{width:52px;height:52px;border-radius:14px;background:var(--surface);border:1px solid var(--border-md);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--text2)}
.locked-title{font-size:17px;font-weight:800;margin-bottom:8px;letter-spacing:-0.3px}
.locked-sub{color:var(--text2);font-size:13px;line-height:1.6;margin-bottom:20px;max-width:240px}
.locked-btns{display:flex;gap:9px}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:15px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:13px;transition:border-color 0.15s;}
.stat-card:hover{border-color:var(--border-md)}
.stat-icon{margin-bottom:7px;color:var(--text2)}
.stat-val{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:var(--text)}
.stat-val.green{color:var(--green)}
.stat-val.amber{color:var(--amber)}
.stat-val.red{color:var(--red)}
.stat-lbl{font-size:10px;color:var(--text2);margin-top:4px;font-weight:600}
.acct-info{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:14px}
.acct-row{display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:6px 0}
.acct-row+.acct-row{border-top:1px solid var(--border)}
.acct-key{color:var(--text2)}
.acct-val{font-weight:700}
.acct-val.mono{font-family:'JetBrains Mono',monospace;font-size:11px}
.acct-val.green{color:var(--green)}
.acct-section-lbl{font-size:9px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:var(--text2);margin-bottom:11px}
.lb-row{display:flex;align-items:center;gap:11px;padding:11px 17px;border-bottom:1px solid rgba(255,255,255,0.02);}
.lb-rank{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;width:26px;flex-shrink:0;text-align:center}
.lb-rank.gold{color:var(--amber);text-shadow:0 0 8px rgba(255,190,11,0.5)}
.lb-rank.silver{color:#94a3b8}
.lb-rank.bronze{color:#b07a40}
.lb-av{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#5b9cf6,#b57bee);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
.lb-name{flex:1;font-size:12px;font-weight:700;letter-spacing:-0.1px}
.lb-sub{font-size:9px;color:var(--text2);margin-top:1px;font-family:'JetBrains Mono',monospace}
.lb-amt{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--green)}

.toast{position:fixed;bottom:63px;left:50%;transform:translateX(-50%);z-index:900;width:calc(100% - 28px);max-width:300px;padding:10px 14px;border-radius:10px;font-size:12px;font-weight:700;text-align:center;display:flex;align-items:center;justify-content:center;gap:7px;animation:tUp 0.22s ease;backdrop-filter:blur(16px);letter-spacing:0.1px;}
@keyframes tUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.toast.ok{background:rgba(0,245,160,0.1);border:1px solid var(--green-border);color:var(--green);box-shadow:0 4px 20px var(--glow-green)}
.toast.err{background:var(--red-dim);border:1px solid var(--red-border);color:var(--red);box-shadow:0 4px 20px var(--glow-red)}
.nodata{text-align:center;padding:28px;color:var(--text2);font-size:12px}

.float-notif{position:fixed;bottom:72px;left:11px;z-index:800;pointer-events:none;display:flex;flex-direction:column;gap:5px;max-width:210px;}
.fnotif{background:rgba(0,245,160,0.09);border:1px solid var(--green-border);border-radius:9px;padding:7px 11px;font-size:10px;font-weight:700;color:var(--green);animation:floatUp 4.2s ease forwards;backdrop-filter:blur(10px);}
@keyframes floatUp{0%{opacity:0;transform:translateY(16px)}10%{opacity:1;transform:translateY(0)}80%{opacity:1;transform:translateY(-8px)}100%{opacity:0;transform:translateY(-22px)}}

.bigwin-overlay{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(3px);pointer-events:none;animation:bwIn 0.3s ease;}
@keyframes bwIn{from{opacity:0}to{opacity:1}}
.bigwin-box{text-align:center;animation:bwPop 0.45s cubic-bezier(0.175,0.885,0.32,1.275);}
@keyframes bwPop{from{transform:scale(0.4);opacity:0}to{transform:scale(1);opacity:1}}
.bigwin-mult{font-family:'JetBrains Mono',monospace;font-size:48px;font-weight:700;color:var(--purple);text-shadow:0 0 50px rgba(181,123,238,0.9);line-height:1;animation:bigPulse 0.35s ease infinite;}
.bigwin-name{font-size:12px;font-weight:700;color:var(--text2);margin-top:6px;letter-spacing:0.5px;}
.bigwin-label{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(181,123,238,0.6);margin-top:3px;}

.splash{position:fixed;inset:0;z-index:1000;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;
  background-image:radial-gradient(ellipse 60% 40% at 50% 50%,rgba(91,156,246,0.06) 0%,transparent 70%);}
.splash-logo{font-size:24px;font-weight:800;letter-spacing:-0.5px}
.splash-logo span{background:linear-gradient(90deg,#5b9cf6,#b57bee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.splash-ring{width:42px;height:42px;border-radius:50%;border:2.5px solid var(--border-md);border-top-color:var(--blue);animation:spin 0.85s linear infinite;box-shadow:0 0 20px rgba(91,156,246,0.2);}
@keyframes spin{to{transform:rotate(360deg)}}

@media(min-width:400px){.canvas{height:260px}.mult-num{font-size:56px}}
@media(min-width:540px){.dep-label{display:inline}.bal-lbl{display:block}.canvas{height:280px}.mult-num{font-size:64px}.float-notif{bottom:18px}.toast{bottom:18px;left:auto;right:14px;transform:none;width:auto;max-width:280px;animation:tRight 0.2s ease}}
@keyframes tRight{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:768px){.ntabs{display:flex}.mob-tabs{display:none}.root{padding-bottom:0}.canvas{height:295px}}
@media(min-width:980px){.layout{display:grid;grid-template-columns:1fr 288px;gap:10px;padding:10px 16px;}.rcol{display:flex}.mob-players{display:none}.canvas{height:315px}.mult-num{font-size:70px}}
`;

(() => {
  if (document.getElementById("av-css")) return;
  const s = document.createElement("style");
  s.id = "av-css"; s.textContent = CSS;
  document.head.appendChild(s);
})();

// ─── UTILS ────────────────────────────────────────────────────────────────
const fKES = n => `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fTime = d => d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
const fDate = d => d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
const cbCls = v => v < 2 ? "lo" : v >= 10 ? "hi" : "mi";
const randId = () => Math.random().toString(36).slice(2, 9);

// ─── GAME ENGINE (fully local, no server needed) ──────────────────────────
// Generates a crash point using a provably-fair-style formula
function generateCrashPoint() {
  // House edge ~4%. Most crashes are low, occasionally very high.
  const r = Math.random();
  if (r < 0.04) return 1.00; // instant crash
  return Math.max(1.00, parseFloat((0.97 / (1 - Math.random() * 0.97)).toFixed(2)));
}

const BOT_NAMES = [
  "KipC***","WanjiM***","OmonB***","Amina***","JohnK***","FatumA***","MwanM***",
  "NjeriW***","BrianO***","GraceA***","SamK***","LucyN***","PeterM***","AnnW***"
];
const BOT_CHAT_MSGS = [
  { color:"amber", text:"That 8x was fire 🔥" },
  { color:"green", text:"cashed at 3.2x, nice one" },
  { color:"blue", text:"Big win alert this round!" },
  { color:"", text:"let's go all in" },
  { color:"amber", text:"anyone riding to 20x?" },
  { color:"", text:"just deposited, ready!" },
  { color:"green", text:"auto cashout is the way" },
  { color:"", text:"gg everyone 💪" },
  { color:"amber", text:"wow that crash was brutal 😭" },
  { color:"green", text:"×5 and cashed baby!" },
  { color:"", text:"next round gonna be big 🚀" },
];
const FLOAT_WINS = [
  "WanjiM*** won KES 1,240","KipC*** cashed out ×8.4","Amina*** won KES 3,500",
  "OmonB*** cashed out ×5.2","JohnK*** won KES 840","FatumA*** cashed ×12.1",
];

// ─── ANIMATED BALANCE ─────────────────────────────────────────────────────
function useAnimatedBalance(target) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef(null);
  useEffect(() => {
    const from = prevRef.current, to = target;
    if (Math.abs(from - to) < 0.01) return;
    const start = performance.now(), dur = 650;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = now => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * ease);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else { setDisplay(to); prevRef.current = to; }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);
  return display;
}
function AnimatedBalance({ value }) {
  const d = useAnimatedBalance(value);
  return <span>{fKES(d)}</span>;
}

// ─── AIRPLANE ─────────────────────────────────────────────────────────────
function AirplaneSVG({ crashed = false }) {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none"
      style={{
        display:"block",
        filter: crashed
          ? "drop-shadow(0 0 10px rgba(255,61,104,0.9))"
          : "drop-shadow(0 0 8px rgba(200,225,255,0.85)) drop-shadow(0 0 18px rgba(150,200,255,0.4))",
        transform: crashed ? "rotate(30deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
      }}>
      <defs>
        <linearGradient id="planeBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={crashed ? "#cc2244" : "#c8ddf5"} />
          <stop offset="100%" stopColor={crashed ? "#ff3d68" : "#ffffff"} />
        </linearGradient>
        <linearGradient id="engineFlame" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffe000" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#ff9500" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Engine flame (only when flying) */}
      {!crashed && (
        <ellipse cx="6" cy="20" rx="9" ry="3.5" fill="url(#engineFlame)" opacity="0.9" />
      )}
      {/* Fuselage */}
      <path d="M14 17.5 Q20 15 40 16 Q58 16.5 66 20 Q58 23.5 40 24 Q20 25 14 22.5 Z" fill="url(#planeBody)" />
      {/* Nose */}
      <path d="M60 18 L72 20 L60 22 Z" fill={crashed ? "#ff7090" : "#e8f4ff"} />
      {/* Main wing */}
      <path d="M30 19.5 L16 4 L44 18 Z" fill={crashed ? "#991133" : "#8ab4d8"} opacity="0.9" />
      <path d="M30 21 L16 36 L44 22 Z" fill={crashed ? "#771122" : "#6699bb"} opacity="0.5" />
      {/* Tail fin */}
      <path d="M16 19.5 L13 10 L22 18 Z" fill={crashed ? "#bb2244" : "#aaccee"} opacity="0.9" />
      {/* Horizontal stabilizers */}
      <path d="M14 20 L7 15 L20 19 Z" fill={crashed ? "#881133" : "#7aaccc"} opacity="0.75" />
      <path d="M14 21 L7 26 L20 22 Z" fill={crashed ? "#661122" : "#5a9bbb"} opacity="0.55" />
      {/* Engine pod */}
      <ellipse cx="29" cy="23.5" rx="5" ry="2.2" fill={crashed ? "#771133" : "#3a5577"} />
      {/* Cockpit */}
      <ellipse cx="54" cy="18.5" rx="4" ry="2" fill="rgba(130,210,255,0.7)" />
      <ellipse cx="48" cy="18" rx="2.8" ry="1.8" fill="rgba(130,210,255,0.45)" />
      <ellipse cx="42" cy="17.8" rx="2" ry="1.5" fill="rgba(130,210,255,0.25)" />
      {/* Livery line */}
      <path d="M22 17.5 Q42 17 60 18" stroke="rgba(91,156,246,0.55)" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

// ─── GRAPH ────────────────────────────────────────────────────────────────
function GameGraph({ mult, pathPts, crashed }) {
  const W = 600, H = 300;
  const PAD_L = 48, PAD_B = 28, PAD_R = 22, PAD_T = 22;
  const gW = W - PAD_L - PAD_R, gH = H - PAD_T - PAD_B;

  const maxMult = Math.max(1.5, mult * 1.18 + 0.4);
  const toX = pct => PAD_L + pct * gW;
  const toY = m => PAD_T + gH - Math.min((m - 1) / (maxMult - 1), 1) * gH;

  // Build smooth bezier path
  let linePath = "", fillPath = "";
  if (pathPts.length >= 2) {
    const pts = pathPts.map(p => ({ x: toX(p.pct), y: toY(p.mult) }));
    linePath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const cpx1 = p.x + (c.x - p.x) * 0.5, cpx2 = p.x + (c.x - p.x) * 0.5;
      linePath += ` C ${cpx1} ${p.y} ${cpx2} ${c.y} ${c.x} ${c.y}`;
    }
    const last = pts[pts.length - 1];
    fillPath = linePath + ` L ${last.x} ${PAD_T + gH} L ${pts[0].x} ${PAD_T + gH} Z`;
  }

  // Y-axis ticks
  const range = maxMult - 1;
  const niceSteps = [0.2, 0.5, 1, 2, 5, 10, 20, 50];
  const tickStep = niceSteps.find(s => s >= range / 5) || 1;
  const yTicks = [];
  for (let v = 1; v <= maxMult + tickStep * 0.5; v += tickStep) {
    if (v > maxMult + 0.1) break;
    yTicks.push(+v.toFixed(1));
  }

  const lineColor = crashed ? "#ff3d68" : "#ffbe0b";
  const lastPt = pathPts.length > 0 ? pathPts[pathPts.length - 1] : null;
  const tipX = lastPt ? toX(lastPt.pct) : PAD_L;
  const tipY = lastPt ? toY(lastPt.mult) : PAD_T + gH;
  const boxX = Math.min(tipX + 8, PAD_L + gW - 56);
  const boxY = Math.max(PAD_T + 4, Math.min(tipY - 14, PAD_T + gH - 28));

  return (
    <svg className="csvg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={crashed ? "#ff3d68" : "#ffbe0b"} stopOpacity={crashed ? "0.35" : "0.28"} />
          <stop offset="100%" stopColor={crashed ? "#ff3d68" : "#ff8800"} stopOpacity="0" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="gc"><rect x={PAD_L} y={PAD_T} width={gW} height={gH} /></clipPath>
        <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.6" fill="rgba(255,255,255,0.035)" />
        </pattern>
      </defs>

      {/* Dot grid */}
      <rect x={PAD_L} y={PAD_T} width={gW} height={gH} fill="url(#dotgrid)" />

      {/* Grid lines */}
      {yTicks.map((v, i) => {
        const sy = toY(v);
        if (sy < PAD_T - 2 || sy > PAD_T + gH + 2) return null;
        return (
          <g key={i}>
            <line x1={PAD_L} y1={sy} x2={PAD_L + gW} y2={sy} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 8" />
            <text x={PAD_L - 7} y={sy + 4} textAnchor="end" fontSize="9.5" fontFamily="JetBrains Mono,monospace" fill="rgba(90,106,138,0.7)" fontWeight="600">
              {v % 1 === 0 ? `${v}×` : `${v.toFixed(1)}×`}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + gH} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <line x1={PAD_L} y1={PAD_T + gH} x2={PAD_L + gW} y2={PAD_T + gH} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Area */}
      {fillPath && <path d={fillPath} fill="url(#areaGrad)" clipPath="url(#gc)" />}

      {/* Glow line */}
      {linePath && (
        <path d={linePath} fill="none" stroke={crashed ? "rgba(255,61,104,0.4)" : "rgba(255,190,11,0.25)"}
          strokeWidth="12" strokeLinecap="round" clipPath="url(#gc)" filter="url(#glow)" />
      )}

      {/* Main line */}
      {linePath && (
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" clipPath="url(#gc)" />
      )}

      {/* Pulsing tip (flying) */}
      {lastPt && !crashed && tipY >= PAD_T - 12 && (
        <g clipPath="url(#gc)" filter="url(#glow)">
          <circle cx={tipX} cy={tipY} r="5" fill="#ffbe0b" opacity="0.12">
            <animate attributeName="r" values="4;14;4" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.18;0;0.18" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={tipX} cy={tipY} r="4" fill="#ffbe0b" opacity="0.8" />
          <circle cx={tipX} cy={tipY} r="2" fill="#fff" />
        </g>
      )}

      {/* Multiplier callout */}
      {lastPt && (
        <g>
          <rect x={boxX} y={boxY} width="54" height="22" rx="5"
            fill={crashed ? "rgba(255,61,104,0.14)" : "rgba(255,190,11,0.11)"}
            stroke={crashed ? "rgba(255,61,104,0.4)" : "rgba(255,190,11,0.35)"} strokeWidth="1" />
          <text x={boxX + 27} y={boxY + 15} textAnchor="middle" fontSize="11.5"
            fontFamily="JetBrains Mono,monospace" fill={crashed ? "#ff3d68" : "#ffbe0b"} fontWeight="700">
            {Number(mult).toFixed(2)}×
          </text>
        </g>
      )}

      <text x={PAD_L - 7} y={PAD_T + gH + 4} textAnchor="end" fontSize="9.5"
        fontFamily="JetBrains Mono,monospace" fill="rgba(90,106,138,0.5)">1×</text>
    </svg>
  );
}

// ─── PLANE OVERLAY ────────────────────────────────────────────────────────
function PlaneOverlay({ pct, mult, maxMult, crashed }) {
  const W = 600, H = 300;
  const PAD_L = 48, PAD_B = 28, PAD_R = 22, PAD_T = 22;
  const gW = W - PAD_L - PAD_R, gH = H - PAD_T - PAD_B;
  const svgX = PAD_L + pct * gW;
  const ratio = Math.min((mult - 1) / (Math.max(1.5, maxMult) - 1), 1);
  const svgY = PAD_T + gH - ratio * gH;
  const leftPct = (svgX / W) * 100;
  const bottomPct = ((H - svgY) / H) * 100;
  return (
    <div style={{
      position:"absolute", left:`${leftPct}%`, bottom:`${bottomPct}%`,
      transform:"translate(-12%, 45%)", pointerEvents:"none", zIndex:7,
      transition: crashed ? "none" : "left 0.08s linear, bottom 0.08s linear",
      willChange:"left,bottom",
    }}>
      <AirplaneSVG crashed={crashed} />
    </div>
  );
}

// ─── COUNTDOWN RING ───────────────────────────────────────────────────────
function CountdownRing({ cd, total = 5 }) {
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div className="cd-outer">
      <div className="cd-ring">
        <svg width="68" height="68" viewBox="0 0 68 68">
          <circle className="cd-track" cx="34" cy="34" r={r} />
          <circle className="cd-fill" cx="34" cy="34" r={r}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - cd / total)} />
        </svg>
        <div className="cd-val">{Math.ceil(cd)}</div>
      </div>
      <div className="cd-label">Next Round</div>
    </div>
  );
}

// ─── BIG WIN OVERLAY ──────────────────────────────────────────────────────
function BigWinOverlay({ player, mult }) {
  return (
    <div className="bigwin-overlay">
      <div className="bigwin-box">
        <div style={{ fontSize:36, marginBottom:4 }}>🚀</div>
        <div className="bigwin-mult">{Number(mult).toFixed(2)}×</div>
        <div className="bigwin-name">{player}</div>
        <div className="bigwin-label">Mega Win!</div>
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────
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
      <input className="phone-input" placeholder="7XX XXX XXX"
        value={value.replace(/^254/, "")}
        onChange={e => onChange("254" + e.target.value.replace(/^0/, "").replace(/\D/g, ""))} />
    </div>
  );
}
function PwInput({ placeholder, value, onChange, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input className="finput" type={show ? "text" : "password"} placeholder={placeholder}
        value={value} onChange={onChange} onKeyDown={onKeyDown} />
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
  const submit = () => {
    if (phone.length < 12 || !pass) { setErr("Enter your phone number and password."); return; }
    setLoading(true);
    setTimeout(() => {
      // Simulate login — check localStorage for registered users
      const stored = JSON.parse(localStorage.getItem("av_users") || "{}");
      const key = phone;
      if (!stored[key] || stored[key].pass !== pass) {
        setErr("Invalid phone number or password."); setLoading(false); return;
      }
      const u = stored[key];
      localStorage.setItem("av_session", JSON.stringify({ phone, name: u.name }));
      onLogin({ phone, name: u.name, balance: u.balance || 1000 });
      onClose();
    }, 600);
  };
  return (
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">Welcome back</div><div className="msub">Sign in with your number</div></div>
        <button className="mclose" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="mbody">
        {err && <div className="ferr">{err}</div>}
        <div className="fg"><label className="flbl">M-Pesa Number</label><PhoneInput value={phone} onChange={setPhone} /></div>
        <div className="fg">
          <label className="flbl">Password</label>
          <PwInput placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <button className="btn-form" onClick={submit} disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        <div className="ffoot">No account?{" "}<button className="flink" onClick={() => { onClose(); goRegister(); }}>Create one free</button></div>
      </div>
    </Modal>
  );
}

function RegisterModal({ onClose, onLogin, goLogin }) {
  const [f, setF] = useState({ fn:"", ln:"", phone:"254", pass:"", confirm:"" });
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
  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true);
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("av_users") || "{}");
      if (stored[f.phone]) { setErr("Phone already registered. Sign in instead."); setLoading(false); return; }
      const name = `${f.fn} ${f.ln}`;
      stored[f.phone] = { name, pass: f.pass, balance: 1000 };
      localStorage.setItem("av_users", JSON.stringify(stored));
      localStorage.setItem("av_session", JSON.stringify({ phone: f.phone, name }));
      onLogin({ phone: f.phone, name, balance: 1000 });
      onClose();
    }, 700);
  };
  return (
    <Modal onClose={onClose}>
      <div className="mhead">
        <div><div className="mtitle">Create Account</div><div className="msub">Join AviPesa · Start with KES 1,000 demo</div></div>
        <button className="mclose" onClick={onClose}><X size={15} /></button>
      </div>
      <div className="mbody">
        {err && <div className="ferr">{err}</div>}
        <div className="frow">
          <div className="fg">
            <label className="flbl">First Name</label>
            <input className={`finput ${errs.fn ? "err-field" : ""}`} placeholder="John"
              value={f.fn} onChange={e => { set("fn")(e.target.value); setErrs(p => ({ ...p, fn:"" })); }} />
            {errs.fn && <div className="ferr-inline">{errs.fn}</div>}
          </div>
          <div className="fg">
            <label className="flbl">Last Name</label>
            <input className={`finput ${errs.ln ? "err-field" : ""}`} placeholder="Kamau"
              value={f.ln} onChange={e => { set("ln")(e.target.value); setErrs(p => ({ ...p, ln:"" })); }} />
            {errs.ln && <div className="ferr-inline">{errs.ln}</div>}
          </div>
        </div>
        <div className="fg">
          <label className="flbl">M-Pesa Number</label>
          <PhoneInput value={f.phone} onChange={v => { set("phone")(v); setErrs(p => ({ ...p, phone:"" })); }} />
          {errs.phone && <div className="ferr-inline">{errs.phone}</div>}
        </div>
        <div className="frow">
          <div className="fg">
            <label className="flbl">Password</label>
            <PwInput placeholder="Min 6 chars" value={f.pass} onChange={e => { set("pass")(e.target.value); setErrs(p => ({ ...p, pass:"" })); }} />
            {errs.pass && <div className="ferr-inline">{errs.pass}</div>}
          </div>
          <div className="fg">
            <label className="flbl">Confirm</label>
            <PwInput placeholder="Repeat" value={f.confirm} onChange={e => { set("confirm")(e.target.value); setErrs(p => ({ ...p, confirm:"" })); }} />
            {errs.confirm && <div className="ferr-inline">{errs.confirm}</div>}
          </div>
        </div>
        <div className="fhint" style={{ marginBottom:13 }}>By registering you confirm you are 18+ and agree to our <span style={{ color:"var(--blue)" }}>Terms of Service</span>.</div>
        <button className="btn-form" onClick={submit} disabled={loading}>{loading ? "Creating account..." : "Create Account — Get KES 1,000 Demo"}</button>
        <div className="ffoot">Have an account?{" "}<button className="flink" onClick={() => { onClose(); goLogin(); }}>Sign in</button></div>
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
      <div className="mhead">
        <div><div className="mtitle">Deposit via M-Pesa</div><div className="msub">Demo mode — funds added instantly</div></div>
        {step === 0 && <button className="mclose" onClick={onClose}><X size={15} /></button>}
      </div>
      <div className="mbody">
        {step === 0 ? (
          <>
            <div className="fg">
              <label className="flbl">Amount (KES)</label>
              <input className="finput" type="number" placeholder="Minimum KES 10" value={amount} onChange={e => setAmount(e.target.value)} />
              <div className="presets">
                {[50, 100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} className="preset" onClick={() => setAmount(String(v))}>{v}</button>
                ))}
              </div>
            </div>
            <button className="btn-mpesa-full" onClick={submit} disabled={!valid}>
              <ArrowDownCircle size={16} /> Deposit {amount && !isNaN(amt) ? fKES(amt) : ""}
            </button>
          </>
        ) : (
          <div className="stk-wait">
            <div className="stk-icon"><ArrowDownCircle size={24} /></div>
            <div className="stk-title">Processing Deposit</div>
            <div className="stk-sub">Adding funds to your account...</div>
            <div className="stk-blink">Please wait...</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function WithdrawModal({ onClose, balance, onWithdraw }) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const amt = parseFloat(amount);
  const valid = !isNaN(amt) && amt >= 100 && amt <= balance;
  const toConfirm = () => {
    if (!valid) { setErr(amt > balance ? "Exceeds balance" : "Minimum KES 100"); return; }
    setErr(""); setStep(1);
  };
  const confirm = () => {
    setLoading(true);
    setTimeout(() => { onWithdraw(amt); onClose(); }, 1200);
  };
  return (
    <Modal onClose={step === 0 ? onClose : () => {}}>
      <div className="mhead">
        <div><div className="mtitle">Withdraw Funds</div><div className="msub">Demo mode · instant</div></div>
        {step === 0 && <button className="mclose" onClick={onClose}><X size={15} /></button>}
      </div>
      <div className="mbody">
        {step === 0 ? (
          <>
            {err && <div className="ferr">{err}</div>}
            <div className="fg">
              <label className="flbl">Amount (KES)</label>
              <input className="finput" type="number" placeholder="Min KES 100" value={amount} onChange={e => setAmount(e.target.value)} />
              <div className="presets">
                {[100, 500, 1000, 2000].map(v => (
                  <button key={v} className="preset" onClick={() => setAmount(String(v))} disabled={v > balance}>{v}</button>
                ))}
              </div>
              <div className="fhint">Available: <strong style={{ color:"var(--green)" }}>{fKES(balance)}</strong></div>
            </div>
            <button className="btn-form" onClick={toConfirm} disabled={!amount}>Review Withdrawal</button>
          </>
        ) : loading ? (
          <div className="stk-wait">
            <div className="stk-icon" style={{ background:"var(--blue-dim)", border:"1px solid var(--blue-border)", color:"var(--blue)" }}>
              <RefreshCw size={24} />
            </div>
            <div className="stk-title">Processing...</div>
            <div className="stk-blink" style={{ color:"var(--blue)" }}>Please wait</div>
          </div>
        ) : (
          <>
            <div style={{ background:"var(--surface)", border:"1px solid var(--border-md)", borderRadius:10, padding:14, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:9 }}>
                <span style={{ color:"var(--text2)" }}>Amount</span><span style={{ fontWeight:700 }}>{fKES(amt)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, borderTop:"1px solid var(--border)", paddingTop:9, fontWeight:700 }}>
                <span style={{ color:"var(--text2)" }}>You receive</span>
                <span style={{ color:"var(--green)" }}>{fKES(amt)}</span>
              </div>
            </div>
            <button className="btn-mpesa-full" style={{ background:"var(--amber)", color:"#1a0800", marginBottom:9 }} onClick={confirm}>
              <Check size={16} /> Confirm Withdrawal
            </button>
            <button className="btn-ghost" style={{ width:"100%", textAlign:"center" }} onClick={() => setStep(0)}>Edit</button>
          </>
        )}
      </div>
    </Modal>
  );
}

function Locked({ title, sub, openLogin, openRegister }) {
  return (
    <div className="locked">
      <div className="locked-ico"><Lock size={21} /></div>
      <div className="locked-title">{title}</div>
      <div className="locked-sub">{sub}</div>
      <div className="locked-btns">
        <button className="btn-ghost" onClick={openLogin}>Sign In</button>
        <button className="btn-primary" onClick={openRegister}>Register Free</button>
      </div>
    </div>
  );
}

// ─── LIVE CHAT ────────────────────────────────────────────────────────────
function LiveChat() {
  const [msgs, setMsgs] = useState(BOT_CHAT_MSGS.slice(0, 3).map((m, i) => ({ ...m, id: i, name: BOT_NAMES[i] })));
  const [input, setInput] = useState("");
  const feedRef = useRef(null);
  useEffect(() => {
    const t = setInterval(() => {
      const m = BOT_CHAT_MSGS[Math.floor(Math.random() * BOT_CHAT_MSGS.length)];
      const n = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      setMsgs(p => [...p.slice(-18), { ...m, id: Date.now(), name: n }]);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [msgs]);
  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p.slice(-18), { name:"You", color:"blue", text:input, id:Date.now() }]);
    setInput("");
  };
  return (
    <div className="chat-card">
      <div className="rhead">
        <span className="rtitle">Live Chat</span>
        <div className="live-ind"><div className="live-dot" />Live</div>
      </div>
      <div className="chat-feed" ref={feedRef}>
        {msgs.map(m => (
          <div key={m.id} className="chat-msg">
            <span className={`chat-name ${m.color || ""}`}>{m.name}:</span>
            <span className="chat-text"> {m.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Say something..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
        <button className="chat-send" onClick={send}><Send size={13} /></button>
      </div>
    </div>
  );
}

// ─── BET PANEL ────────────────────────────────────────────────────────────
function SingleBetPanel({ gs, user, hasBet, cashedOut, betAmt, setBetAmt, autoCOOn, setAutoCOOn,
  autoCO, setAutoCO, onBet, onCashout, onLogin, md, lastBetRef, compact }) {
  const amt = parseFloat(betAmt) || 0;
  const adjust = delta => {
    const cur = parseFloat(betAmt) || 0;
    setBetAmt(String(Math.max(10, Math.round((cur + delta) * 100) / 100)));
  };
  return (
    <div className="bpanel" style={compact ? { padding:"8px 10px 12px" } : {}}>
      <div className="stepper-row">
        <button className="step-btn" onClick={() => adjust(-10)} disabled={hasBet || gs === "flying"}><Minus size={15} /></button>
        <input className="step-val" type="number" value={betAmt}
          onChange={e => setBetAmt(e.target.value)} disabled={hasBet || gs === "flying"}
          style={compact ? { fontSize:14 } : {}} />
        <button className="step-btn" onClick={() => adjust(10)} disabled={hasBet || gs === "flying"}><Plus size={15} /></button>
      </div>
      <div className="qgrid">
        {[100, 200, 500, 1000].map(v => (
          <button key={v} className="qgbtn" onClick={() => setBetAmt(String(v))} disabled={hasBet || gs === "flying"}>
            {v >= 1000 ? `${v/1000}k` : v}
          </button>
        ))}
      </div>
      <button className="repeat-btn" disabled={!lastBetRef.current || hasBet || gs === "flying"}
        onClick={() => { if (lastBetRef.current) setBetAmt(String(lastBetRef.current)); }}>
        <RotateCcw size={9} /> Repeat {lastBetRef.current ? fKES(lastBetRef.current) : "last"}
      </button>
      {/* Main CTA */}
      {!user ? (
        <button className="bet-cta login-btn" onClick={onLogin}><Lock size={14} /> Sign In to Play</button>
      ) : gs === "flying" && hasBet && !cashedOut ? (
        <button className="bet-cta cashout" onClick={onCashout}>💰 Cash Out ×{md}</button>
      ) : gs === "waiting" ? (
        <button className="bet-cta place" onClick={onBet} disabled={hasBet}>
          {hasBet ? <><Check size={14} /> Bet Placed — Waiting...</> : `Place Bet · ${fKES(amt)}`}
        </button>
      ) : gs === "flying" && !hasBet ? (
        <button className="bet-cta waiting-btn" disabled>Waiting for next round...</button>
      ) : gs === "crashed" ? (
        <button className="bet-cta waiting-btn" disabled>Round ended</button>
      ) : (
        <button className="bet-cta waiting-btn" disabled>
          {hasBet && cashedOut ? `✓ Cashed out ×${md}` : "Waiting..."}
        </button>
      )}
      {!compact && gs === "waiting" && !hasBet && (
        <div className="space-hint"><span className="space-key">SPACE</span> to place bet</div>
      )}
      {!compact && gs === "flying" && hasBet && !cashedOut && (
        <div className="space-hint"><span className="space-key">SPACE</span> to cash out</div>
      )}
      <div className="auto-row">
        <span className="auto-lbl">Auto Cash Out</span>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <label className="toggle">
            <input type="checkbox" checked={autoCOOn} onChange={e => setAutoCOOn(e.target.checked)} />
            <div className="toggle-track" /><div className="toggle-thumb" />
          </label>
          {autoCOOn && (
            <input className="aco-input" type="number" value={autoCO}
              onChange={e => setAutoCO(e.target.value)} min="1.1" step="0.1" />
          )}
        </div>
      </div>
    </div>
  );
}

function BetPanel({ gs, user, hasBet, cashedOut, betAmt, setBetAmt, autoCOOn, setAutoCOOn,
  autoCO, setAutoCO, onBet, onCashout, onLogin, md, lastBetRef,
  hasBet2, cashedOut2, betAmt2, setBetAmt2, autoCOOn2, setAutoCOOn2,
  autoCO2, setAutoCO2, onBet2, onCashout2, lastBet2Ref }) {
  const [dualMode, setDualMode] = useState(false);
  return (
    <>
      <div className="bpanel-header">
        <span className="bpanel-title">Bet Controls</span>
        <div className="dual-toggle-row">
          <span className="dual-lbl">2 Bets</span>
          <label className="toggle">
            <input type="checkbox" checked={dualMode} onChange={e => setDualMode(e.target.checked)} />
            <div className="toggle-track" /><div className="toggle-thumb" />
          </label>
        </div>
      </div>
      {!dualMode ? (
        <SingleBetPanel gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
          betAmt={betAmt} setBetAmt={setBetAmt} autoCOOn={autoCOOn} setAutoCOOn={setAutoCOOn}
          autoCO={autoCO} setAutoCO={setAutoCO}
          onBet={onBet} onCashout={onCashout} onLogin={onLogin} md={md} lastBetRef={lastBetRef} />
      ) : (
        <div className="dual-panels">
          <div className="dual-panel-wrap">
            <div className="dual-panel-label"><div className="dot" /> Bet 1</div>
            <SingleBetPanel compact gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
              betAmt={betAmt} setBetAmt={setBetAmt} autoCOOn={autoCOOn} setAutoCOOn={setAutoCOOn}
              autoCO={autoCO} setAutoCO={setAutoCO}
              onBet={onBet} onCashout={onCashout} onLogin={onLogin} md={md} lastBetRef={lastBetRef} />
          </div>
          <div className="dual-panel-wrap">
            <div className="dual-panel-label"><div className="dot p2" /> Bet 2</div>
            <SingleBetPanel compact gs={gs} user={user} hasBet={hasBet2} cashedOut={cashedOut2}
              betAmt={betAmt2} setBetAmt={setBetAmt2} autoCOOn={autoCOOn2} setAutoCOOn={setAutoCOOn2}
              autoCO={autoCO2} setAutoCO={setAutoCO2}
              onBet={onBet2} onCashout={onCashout2} onLogin={onLogin} md={md} lastBetRef={lastBet2Ref} />
          </div>
        </div>
      )}
    </>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [appReady, setAppReady] = useState(false);

  // UI
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("game");
  const [ddOpen, setDdOpen] = useState(false);
  const [toastState, setToastState] = useState(null);
  const [winBanner, setWinBanner] = useState(null);
  const [floatNotifs, setFloatNotifs] = useState([]);
  const [bigWin, setBigWin] = useState(null);
  const [walletMode, setWalletMode] = useState("deposit");
  const [txnFilter, setTxnFilter] = useState("all");
  const [txns, setTxns] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Game state
  const [gs, setGs] = useState("waiting");
  const [mult, setMult] = useState(1.00);
  const [cd, setCd] = useState(5);
  const [crashes, setCrashes] = useState([2.14, 1.32, 8.45, 1.01, 3.78, 1.55, 11.2, 2.9]);
  const [players, setPlayers] = useState([]);
  const [pathPts, setPathPts] = useState([]);
  const [planeCrashed, setPlaneCrashed] = useState(false);
  const [roundId, setRoundId] = useState(1);
  const [pfHash, setPfHash] = useState("a3f9c2...e84b1d");

  // Bet state — panel 1
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [betAmt, setBetAmt] = useState("100");
  const [autoCOOn, setAutoCOOn] = useState(false);
  const [autoCO, setAutoCO] = useState("2.00");
  const lastBetRef = useRef(null);
  const betAmountRef = useRef(null);
  const cashedOutRef = useRef(false);

  // Bet state — panel 2
  const [hasBet2, setHasBet2] = useState(false);
  const [cashedOut2, setCashedOut2] = useState(false);
  const [betAmt2, setBetAmt2] = useState("100");
  const [autoCOOn2, setAutoCOOn2] = useState(false);
  const [autoCO2, setAutoCO2] = useState("2.00");
  const lastBet2Ref = useRef(null);
  const betAmount2Ref = useRef(null);
  const cashedOut2Ref = useRef(false);

  // Game engine refs
  const gsRef = useRef("waiting");
  const multRef = useRef(1);
  const crashPointRef = useRef(1);
  const flyStartRef = useRef(0);
  const flyTimerRef = useRef(null);
  const cdTimerRef = useRef(null);
  const tickRef = useRef(0);
  const balanceRef = useRef(0);
  const userRef = useRef(null);
  const betAmtStr = useRef("100");
  const betAmt2Str = useRef("100");
  const seenBigWins = useRef(new Set());

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { betAmtStr.current = betAmt; }, [betAmt]);
  useEffect(() => { betAmt2Str.current = betAmt2; }, [betAmt2]);

  const toast_ = useCallback((msg, type = "ok") => {
    setToastState({ msg, type });
    setTimeout(() => setToastState(null), 3000);
  }, []);

  const addTxn = useCallback((type, label, amount) => {
    setTxns(p => [{ id: randId(), type, label, amount, time: new Date() }, ...p.slice(0, 99)]);
  }, []);

  // ── Restore session ──
  useEffect(() => {
    const sess = localStorage.getItem("av_session");
    if (sess) {
      try {
        const s = JSON.parse(sess);
        const stored = JSON.parse(localStorage.getItem("av_users") || "{}");
        const u = stored[s.phone];
        const bal = u ? (u.balance || 1000) : 1000;
        setUser({ ...s, balance: bal });
        setBalance(bal);
        userRef.current = { ...s, balance: bal };
        balanceRef.current = bal;
      } catch {}
    }
    setTimeout(() => setAppReady(true), 1200);
  }, []);

  // ── Save balance to localStorage ──
  const saveBalance = useCallback((newBal) => {
    const stored = JSON.parse(localStorage.getItem("av_users") || "{}");
    if (userRef.current?.phone && stored[userRef.current.phone]) {
      stored[userRef.current.phone].balance = newBal;
      localStorage.setItem("av_users", JSON.stringify(stored));
    }
  }, []);

  const updateBalance = useCallback((newBal) => {
    setBalance(newBal);
    balanceRef.current = newBal;
    saveBalance(newBal);
  }, [saveBalance]);

  // ── Generate bot players ──
  const makeBotPlayers = useCallback((crashPt) => {
    const count = 4 + Math.floor(Math.random() * 8);
    return Array.from({ length: count }, (_, i) => {
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const bet = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)];
      // Bot cashout: somewhere between 1.1 and crashPt
      const cashMult = +(1.1 + Math.random() * (crashPt - 1.1) * 0.9).toFixed(2);
      return { id: randId(), name, bet, cashMult, cashed: false };
    });
  }, []);

  // ── START COUNTDOWN ──
  const startCountdown = useCallback(() => {
    gsRef.current = "waiting";
    setGs("waiting");
    setMult(1); multRef.current = 1;
    setPathPts([]); setPlaneCrashed(false);
    setCashedOut(false); cashedOutRef.current = false;
    setCashedOut2(false); cashedOut2Ref.current = false;
    setHasBet(false); betAmountRef.current = null;
    setHasBet2(false); betAmount2Ref.current = null;
    seenBigWins.current.clear();

    const cp = generateCrashPoint();
    crashPointRef.current = cp;
    const hash = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setPfHash(hash.slice(0, 6) + "..." + hash.slice(-6));
    setRoundId(p => p + 1);

    const bots = makeBotPlayers(cp);
    setPlayers(bots);

    let countdown = 5;
    setCd(countdown);

    if (cdTimerRef.current) clearInterval(cdTimerRef.current);
    cdTimerRef.current = setInterval(() => {
      countdown -= 0.1;
      setCd(Math.max(0, countdown));
      if (countdown <= 0) {
        clearInterval(cdTimerRef.current);
        startFlight(cp, bots);
      }
    }, 100);
  }, [makeBotPlayers]);

  // ── START FLIGHT ──
  const startFlight = useCallback((crashPoint, botPlayers) => {
    gsRef.current = "flying";
    setGs("flying");
    flyStartRef.current = performance.now();
    tickRef.current = 0;
    setPathPts([{ pct: 0, mult: 1 }]);

    const MAX_TICKS = 180;
    const cashedBots = new Set();

    if (flyTimerRef.current) clearInterval(flyTimerRef.current);
    flyTimerRef.current = setInterval(() => {
      const elapsed = (performance.now() - flyStartRef.current) / 1000;
      // Exponential growth: starts at 1x, grows faster over time
      const m = Math.min(+(Math.pow(Math.E, elapsed * 0.55)).toFixed(2), 9999.99);
      multRef.current = m;
      setMult(m);

      tickRef.current += 1;
      const pct = Math.min(tickRef.current / MAX_TICKS, 1);
      setPathPts(prev => {
        const next = [...prev, { pct, mult: m }];
        if (next.length > MAX_TICKS) {
          return next.slice(-MAX_TICKS).map((pt, i) => ({ pct: i / (MAX_TICKS - 1), mult: pt.mult }));
        }
        return next;
      });

      // Update bot players — cash them out at their target multiplier
      setPlayers(prev => prev.map(p => {
        if (!p.cashed && m >= p.cashMult && !cashedBots.has(p.id)) {
          cashedBots.add(p.id);
          if (p.cashMult >= 10 && !seenBigWins.current.has(p.id)) {
            seenBigWins.current.add(p.id);
            setBigWin({ player: p.name, mult: p.cashMult });
            setTimeout(() => setBigWin(null), 2400);
          }
          return { ...p, cashed: true };
        }
        return p;
      }));

      // Auto cashout — panel 1
      if (betAmountRef.current && !cashedOutRef.current && autoCORef.current.on) {
        const target = parseFloat(autoCORef.current.val);
        if (!isNaN(target) && m >= target) {
          performCashout(1, m);
        }
      }
      // Auto cashout — panel 2
      if (betAmount2Ref.current && !cashedOut2Ref.current && autoCO2Ref.current.on) {
        const target = parseFloat(autoCO2Ref.current.val);
        if (!isNaN(target) && m >= target) {
          performCashout(2, m);
        }
      }

      // Check crash
      if (m >= crashPoint) {
        clearInterval(flyTimerRef.current);
        triggerCrash(m);
      }
    }, 80);
  }, []);

  // We need refs for autoCO values inside the interval
  const autoCORef = useRef({ on: false, val: "2.00" });
  const autoCO2Ref = useRef({ on: false, val: "2.00" });
  useEffect(() => { autoCORef.current = { on: autoCOOn, val: autoCO }; }, [autoCOOn, autoCO]);
  useEffect(() => { autoCO2Ref.current = { on: autoCOOn2, val: autoCO2 }; }, [autoCOOn2, autoCO2]);

  const performCashout = useCallback((panel, currentMult) => {
    if (panel === 1) {
      if (!betAmountRef.current || cashedOutRef.current) return;
      cashedOutRef.current = true;
      setCashedOut(true);
      const betted = parseFloat(betAmountRef.current);
      const payout = +(betted * currentMult).toFixed(2);
      const profit = +(payout - betted).toFixed(2);
      const newBal = +(balanceRef.current + payout).toFixed(2);
      updateBalance(newBal);
      addTxn("win", `Win ×${currentMult.toFixed(2)}`, profit);
      setWinBanner(`×${currentMult.toFixed(2)} — Won ${fKES(payout)}`);
      setTimeout(() => setWinBanner(null), 3000);
      toast_(`Cashed out ×${currentMult.toFixed(2)} — Won ${fKES(payout)}`);
    } else {
      if (!betAmount2Ref.current || cashedOut2Ref.current) return;
      cashedOut2Ref.current = true;
      setCashedOut2(true);
      const betted = parseFloat(betAmount2Ref.current);
      const payout = +(betted * currentMult).toFixed(2);
      const profit = +(payout - betted).toFixed(2);
      const newBal = +(balanceRef.current + payout).toFixed(2);
      updateBalance(newBal);
      addTxn("win", `Bet 2 Win ×${currentMult.toFixed(2)}`, profit);
      toast_(`Bet 2 cashed ×${currentMult.toFixed(2)} — Won ${fKES(payout)}`);
    }
  }, [updateBalance, addTxn, toast_]);

  const triggerCrash = useCallback((cm) => {
    gsRef.current = "crashed";
    setGs("crashed");
    setPlaneCrashed(true);
    setCrashes(p => [cm, ...p].slice(0, 14));

    // Penalise uncashed bets
    if (betAmountRef.current && !cashedOutRef.current) {
      const lost = parseFloat(betAmountRef.current);
      addTxn("loss", `Lost ×${cm.toFixed(2)} crash`, -lost);
      toast_(`Crashed ×${cm.toFixed(2)} — Lost ${fKES(lost)}`, "err");
    }
    if (betAmount2Ref.current && !cashedOut2Ref.current) {
      const lost = parseFloat(betAmount2Ref.current);
      addTxn("loss", `Bet 2 crashed ×${cm.toFixed(2)}`, -lost);
      toast_(`Bet 2 crashed ×${cm.toFixed(2)}`, "err");
    }

    betAmountRef.current = null; setHasBet(false);
    betAmount2Ref.current = null; setHasBet2(false);

    // Float notifications
    const msg = FLOAT_WINS[Math.floor(Math.random() * FLOAT_WINS.length)];
    const id = Date.now();
    setFloatNotifs(p => [...p.slice(-3), { id, msg }]);
    setTimeout(() => setFloatNotifs(p => p.filter(n => n.id !== id)), 4200);

    // Next round after 4s
    setTimeout(startCountdown, 4000);
  }, [addTxn, toast_, startCountdown]);

  // ── Boot game engine ──
  useEffect(() => {
    const t = setTimeout(startCountdown, 800);
    return () => {
      clearTimeout(t);
      if (flyTimerRef.current) clearInterval(flyTimerRef.current);
      if (cdTimerRef.current) clearInterval(cdTimerRef.current);
    };
  }, [startCountdown]);

  // ── BET ACTIONS ──
  const handleBet = useCallback(() => {
    if (!userRef.current) { setModal("login"); return; }
    const a = parseFloat(betAmtStr.current);
    if (isNaN(a) || a < 10) { toast_("Minimum bet is KES 10", "err"); return; }
    if (a > balanceRef.current) { toast_("Insufficient balance", "err"); return; }
    if (gsRef.current !== "waiting") { toast_("Wait for next round to bet", "err"); return; }
    if (betAmountRef.current) { toast_("Bet already placed", "err"); return; }
    const newBal = +(balanceRef.current - a).toFixed(2);
    updateBalance(newBal);
    betAmountRef.current = String(a);
    lastBetRef.current = a;
    setHasBet(true);
    addTxn("bet", `Bet placed`, -a);
    toast_(`Bet placed — ${fKES(a)}`);
  }, [updateBalance, addTxn, toast_]);

  const handleBet2 = useCallback(() => {
    if (!userRef.current) { setModal("login"); return; }
    const a = parseFloat(betAmt2Str.current);
    if (isNaN(a) || a < 10) { toast_("Minimum bet is KES 10", "err"); return; }
    if (a > balanceRef.current) { toast_("Insufficient balance", "err"); return; }
    if (gsRef.current !== "waiting") { toast_("Wait for next round to bet", "err"); return; }
    if (betAmount2Ref.current) { toast_("Bet 2 already placed", "err"); return; }
    const newBal = +(balanceRef.current - a).toFixed(2);
    updateBalance(newBal);
    betAmount2Ref.current = String(a);
    lastBet2Ref.current = a;
    setHasBet2(true);
    addTxn("bet", `Bet 2 placed`, -a);
    toast_(`Bet 2 placed — ${fKES(a)}`);
  }, [updateBalance, addTxn, toast_]);

  const doCashout = useCallback(() => {
    if (!betAmountRef.current || cashedOutRef.current || gsRef.current !== "flying") return;
    performCashout(1, multRef.current);
  }, [performCashout]);

  const doCashout2 = useCallback(() => {
    if (!betAmount2Ref.current || cashedOut2Ref.current || gsRef.current !== "flying") return;
    performCashout(2, multRef.current);
  }, [performCashout]);

  // ── Spacebar shortcut ──
  useEffect(() => {
    const onKey = e => {
      if (e.code !== "Space") return;
      if (["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
      if (gsRef.current === "waiting" && !betAmountRef.current) { handleBet(); return; }
      if (gsRef.current === "flying" && betAmountRef.current && !cashedOutRef.current) { doCashout(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleBet, doCashout]);

  // ── Leaderboard (generated) ──
  useEffect(() => {
    if (tab === "leaderboard" && leaderboard.length === 0) {
      setLeaderboard([
        { name:"WanjiM***", total:42800, bets:234, best:15.4 },
        { name:"KipC***", total:38200, bets:198, best:22.1 },
        { name:"Amina***", total:29100, bets:312, best:8.7 },
        { name:"OmonB***", total:21500, bets:156, best:11.3 },
        { name:"JohnK***", total:18900, bets:287, best:6.4 },
        { name:"FatumA***", total:14200, bets:89, best:18.8 },
        { name:"MwanM***", total:11800, bets:201, best:5.2 },
        { name:"NjeriW***", total:9400, bets:145, best:9.1 },
      ]);
    }
  }, [tab]);

  const handleLogin = useCallback((u) => {
    setUser(u); updateBalance(u.balance);
    userRef.current = u;
    toast_(`Welcome, ${u.name.split(" ")[0]}!`);
  }, [updateBalance, toast_]);

  const handleLogout = () => {
    localStorage.removeItem("av_session");
    setUser(null); setBalance(0); userRef.current = null; balanceRef.current = 0;
    setDdOpen(false);
    betAmountRef.current = null; setHasBet(false);
    betAmount2Ref.current = null; setHasBet2(false);
    toast_("Signed out");
  };

  const handleDeposit = (amt) => {
    const newBal = +(balanceRef.current + amt).toFixed(2);
    updateBalance(newBal);
    addTxn("dep", "M-Pesa Deposit", amt);
    toast_(`${fKES(amt)} deposited!`);
  };

  const handleWithdraw = (amt) => {
    const newBal = +(balanceRef.current - amt).toFixed(2);
    updateBalance(newBal);
    addTxn("wd", "M-Pesa Withdrawal", -amt);
    toast_(`${fKES(amt)} withdrawn`);
  };

  // ── Computed ──
  const md = mult.toFixed(2);
  const multClass = () => {
    const m = parseFloat(md);
    if (m >= 10) return "hi10";
    if (m >= 5) return "hi5";
    return "";
  };
  const maxMult = Math.max(1.5, mult * 1.18 + 0.4);
  const lastPt = pathPts.length > 0 ? pathPts[pathPts.length - 1] : null;

  const filteredTxns = txns.filter(t => {
    if (txnFilter === "all") return true;
    if (txnFilter === "deposits") return t.type === "dep";
    if (txnFilter === "wins") return t.type === "win";
    if (txnFilter === "withdrawals") return t.type === "wd";
    return true;
  });

  const userStats = (() => {
    const wins = txns.filter(t => t.type === "win");
    const losses = txns.filter(t => t.type === "loss");
    const bets = txns.filter(t => t.type === "bet" || t.type === "win" || t.type === "loss");
    const totalWon = wins.reduce((s, t) => s + t.amount, 0);
    const totalLost = losses.reduce((s, t) => s + Math.abs(t.amount), 0);
    const biggestWin = wins.length ? Math.max(...wins.map(t => t.amount)) : 0;
    return { totalWon, totalLost, totalBets: bets.length, biggestWin };
  })();

  const openLogin = () => setModal("login");
  const openRegister = () => setModal("register");
  const rankCls = i => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const rankLabel = i => ["1st","2nd","3rd"][i] || `${i+1}`;
  const fmtRoundId = id => `#${String(id).padStart(5,"0")}`;
  const histIcon = type => {
    if (type === "dep") return <ArrowDownCircle size={15} />;
    if (type === "win") return <Award size={15} />;
    if (type === "wd") return <ArrowUpCircle size={15} />;
    return <Activity size={15} />;
  };

  const NAV_TABS = [
    { id:"game", icon:<Zap size={14} />, label:"Game" },
    { id:"wallet", icon:<Wallet size={14} />, label:"Wallet" },
    { id:"history", icon:<History size={14} />, label:"History" },
    { id:"leaderboard", icon:<Trophy size={14} />, label:"Leaders" },
    { id:"stats", icon:<BarChart2 size={14} />, label:"Stats" },
  ];

  if (!appReady) {
    return (
      <div className="splash">
        <div style={{ color:"var(--blue)" }}><Zap size={38} /></div>
        <div className="splash-logo">Avi<span>Pesa</span></div>
        <div className="splash-ring" />
      </div>
    );
  }

  return (
    <div className="root" onClick={() => ddOpen && setDdOpen(false)}>
      {toastState && (
        <div className={`toast ${toastState.type}`}>
          {toastState.type === "ok" ? <Check size={13} /> : <Activity size={13} />}
          {toastState.msg}
        </div>
      )}
      <div className="float-notif">
        {floatNotifs.map(n => <div key={n.id} className="fnotif">{n.msg}</div>)}
      </div>

      {modal === "login" && <LoginModal onClose={() => setModal(null)} onLogin={handleLogin} goRegister={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onLogin={handleLogin} goLogin={() => setModal("login")} />}
      {modal === "deposit" && <DepositModal onClose={() => setModal(null)} onDeposit={handleDeposit} />}
      {modal === "withdraw" && <WithdrawModal onClose={() => setModal(null)} balance={balance} onWithdraw={handleWithdraw} />}

      {/* NAV */}
      <nav className="nav">
        <div className="nav-i">
          <div className="logo" onClick={() => setTab("game")}>
            <div className="logo-icon"><Zap size={15} color="#fff" /></div>
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
            {user ? (
              <>
                <div className="bal-chip">
                  <div className="bal-lbl">Balance</div>
                  <div className="bal-val"><AnimatedBalance value={balance} /></div>
                </div>
                <button className="btn-deposit" onClick={() => setModal("deposit")}>
                  <ArrowDownCircle size={13} />
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
                      <div className="dd-sep" />
                      <button className="dd-item danger" onClick={handleLogout}><LogOut size={13} /> Sign Out</button>
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

      <div className="mob-tabs">
        {NAV_TABS.map(t => (
          <button key={t.id} className={`mtab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* GAME TAB */}
      {tab === "game" && (
        <div className="layout">
          <div>
            <div className="gcard">
              {/* TOP BAR */}
              <div className="gtopbar">
                <div className="live-ind"><div className="live-dot" />LIVE</div>
                <div className={`rbadge ${gs}`}>
                  {gs === "waiting" ? `Next in ${Math.ceil(cd)}s` : gs === "crashed" ? "CRASHED" : "IN PLAY"}
                </div>
                <span className="round-id-badge">{fmtRoundId(roundId)}</span>
                <div className="topbar-sep" />
                <div className="crashes-inline">
                  {crashes.map((v, i) => (
                    <span key={i} className={`cbadge ${cbCls(v)} ${i === 0 ? "new" : ""}`}>
                      {Number(v).toFixed(2)}×
                    </span>
                  ))}
                </div>
              </div>

              {/* CANVAS */}
              <div className="canvas">
                {bigWin && <BigWinOverlay player={bigWin.player} mult={bigWin.mult} />}

                {(gs === "flying" || gs === "crashed") && pathPts.length >= 2 && (
                  <GameGraph mult={mult} pathPts={pathPts} crashed={planeCrashed} />
                )}

                {gs === "waiting" && <CountdownRing cd={cd} total={5} />}

                {(gs === "flying" || gs === "crashed") && lastPt && (
                  <PlaneOverlay pct={lastPt.pct} mult={lastPt.mult} maxMult={maxMult} crashed={planeCrashed} />
                )}

                {gs !== "waiting" && (
                  <div className="mult-overlay">
                    <div className={`mult-num ${gs} ${gs === "flying" ? multClass() : ""}`}>{md}×</div>
                    <div className={`mult-label ${gs}`}>{gs === "crashed" ? "CRASHED" : "FLYING"}</div>
                  </div>
                )}

                {winBanner && <div className="win-flash">{winBanner}</div>}
              </div>

              {/* BET PANEL */}
              <BetPanel
                gs={gs} user={user}
                hasBet={hasBet} cashedOut={cashedOut} betAmt={betAmt} setBetAmt={setBetAmt}
                autoCOOn={autoCOOn} setAutoCOOn={setAutoCOOn} autoCO={autoCO} setAutoCO={setAutoCO}
                onBet={handleBet} onCashout={doCashout} onLogin={openLogin} md={md} lastBetRef={lastBetRef}
                hasBet2={hasBet2} cashedOut2={cashedOut2} betAmt2={betAmt2} setBetAmt2={setBetAmt2}
                autoCOOn2={autoCOOn2} setAutoCOOn2={setAutoCOOn2} autoCO2={autoCO2} setAutoCO2={setAutoCO2}
                onBet2={handleBet2} onCashout2={doCashout2} lastBet2Ref={lastBet2Ref}
              />

              {/* PROVABLY FAIR BAR */}
              <div className="pf-bar">
                <span className="pf-label">Provably Fair</span>
                <span className="pf-hash">{pfHash}</span>
                <button className="pf-toggle"><ShieldCheck size={10} /> Verified</button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="rcol">
            <div className="rcard">
              <div className="rhead">
                <span className="rtitle">Active Players</span>
                <span className="rcnt">{players.length + (hasBet ? 1 : 0) + (hasBet2 ? 1 : 0)}</span>
              </div>
              <div className="plist">
                {user && hasBet && (
                  <div className={`prow ${cashedOut ? "cashed" : ""}`}>
                    <div>
                      <div className="pname" style={{ color:"var(--blue)" }}>{user.name.split(" ")[0]} (You)</div>
                      <div className="pbet">KES {betAmt}</div>
                    </div>
                    {gs === "flying" && !cashedOut && <div className="pmult">{md}×</div>}
                    {cashedOut && <div className="pmult cashed">✓ cashed</div>}
                  </div>
                )}
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
                <span style={{ fontSize:9, fontWeight:700, background:"var(--mpesa)", color:"#fff", padding:"2px 7px", borderRadius:5, letterSpacing:0.8, boxShadow:"0 0 8px rgba(0,184,74,0.3)" }}>M-PESA</span>
              </div>
              <div className="wmini">
                {user ? (
                  <>
                    <div className="wm-bal">
                      <div className="wm-lbl">Balance</div>
                      <div className="wm-amt"><AnimatedBalance value={balance} /></div>
                      <div className="wm-sub">AviPesa Wallet</div>
                    </div>
                    <button className="btn-mpesa-full" onClick={() => setModal("deposit")}>
                      <ArrowDownCircle size={14} /> Deposit via M-Pesa
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign:"center", padding:"10px 0" }}>
                    <div style={{ color:"var(--text2)", fontSize:12, marginBottom:12, lineHeight:1.6 }}>Sign in to deposit and play</div>
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
              <Locked title="Wallet Locked" sub="Sign in to view your balance, deposit or withdraw." openLogin={openLogin} openRegister={openRegister} />
            ) : (
              <>
                <div className="pcard-head">
                  <div className="pcard-title">My Wallet</div>
                  <div className="pcard-sub">Manage your AviPesa funds</div>
                </div>
                <div className="pcard-body">
                  <div className="big-bal">
                    <div className="bb-lbl">Available Balance</div>
                    <div className="bb-amt"><AnimatedBalance value={balance} /></div>
                    <div className="bb-sub">Kenyan Shilling · AviPesa Account</div>
                  </div>
                  <div className="tab-row">
                    <button className={`tabbtn ${walletMode === "deposit" ? "on-dep" : ""}`} onClick={() => setWalletMode("deposit")}>
                      <ArrowDownCircle size={14} /> Deposit
                    </button>
                    <button className={`tabbtn ${walletMode === "withdraw" ? "on-wd" : ""}`} onClick={() => setWalletMode("withdraw")}>
                      <ArrowUpCircle size={14} /> Withdraw
                    </button>
                  </div>
                  {walletMode === "deposit" ? (
                    <button className="btn-mpesa-full" onClick={() => setModal("deposit")}>
                      <ArrowDownCircle size={14} /> Deposit via M-Pesa
                    </button>
                  ) : (
                    <button className="btn-mpesa-full" style={{ background:"var(--amber)", color:"#1a0800" }} onClick={() => setModal("withdraw")}>
                      <ArrowUpCircle size={14} /> Withdraw Funds
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
                  {[{k:"all",l:"All"},{k:"deposits",l:"Deposits"},{k:"wins",l:"Wins"},{k:"withdrawals",l:"Withdrawals"}].map(f => (
                    <button key={f.k} className={`fpill ${txnFilter === f.k ? "on" : ""}`} onClick={() => setTxnFilter(f.k)}>{f.l}</button>
                  ))}
                </div>
                {filteredTxns.length === 0 && <div className="nodata">No transactions yet. Place a bet to get started!</div>}
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

      {/* LEADERBOARD */}
      {tab === "leaderboard" && (
        <div className="page wide">
          <div className="pcard">
            <div className="pcard-head">
              <div className="pcard-title">Leaderboard</div>
              <div className="pcard-sub">Top players this month</div>
            </div>
            {leaderboard.map((p, i) => (
              <div key={i} className="lb-row">
                <div className={`lb-rank ${rankCls(i)}`}>{rankLabel(i)}</div>
                <div className="lb-av">{p.name[0]}</div>
                <div style={{ flex:1 }}>
                  <div className="lb-name">{p.name}</div>
                  <div className="lb-sub">{p.bets} bets · Best ×{Number(p.best).toFixed(2)}</div>
                </div>
                <div className="lb-amt">{fKES(p.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS */}
      {tab === "stats" && (
        <div className="page">
          <div className="pcard">
            {!user ? (
              <Locked title="Stats Locked" sub="Sign in to see your performance statistics." openLogin={openLogin} openRegister={openRegister} />
            ) : (
              <>
                <div className="pcard-head">
                  <div className="pcard-title">My Stats</div>
                  <div className="pcard-sub">Your performance overview</div>
                </div>
                <div className="pcard-body">
                  <div className="stats-grid">
                    {[
                      { icon:<Activity size={15} />, val:userStats.totalBets, lbl:"Total Bets", cls:"amber" },
                      { icon:<TrendingUp size={15} />, val:fKES(userStats.totalWon), lbl:"Total Won", cls:"green" },
                      { icon:<DollarSign size={15} />, val:fKES(userStats.totalLost), lbl:"Total Lost", cls:"red" },
                      { icon:<Award size={15} />, val:userStats.biggestWin > 0 ? fKES(userStats.biggestWin) : "—", lbl:"Best Win", cls:"amber" },
                      { icon:<Target size={15} />, val:fKES(balance), lbl:"Balance", cls:"green" },
                      { icon:<Percent size={15} />, val:fKES(userStats.totalWon - userStats.totalLost), lbl:"Net Profit", cls:(userStats.totalWon - userStats.totalLost) >= 0 ? "green" : "red" },
                    ].map((s, i) => (
                      <div key={i} className="stat-card">
                        <div className="stat-icon">{s.icon}</div>
                        <div className={`stat-val ${s.cls}`}>{s.val}</div>
                        <div className="stat-lbl">{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div className="acct-info">
                    <div className="acct-section-lbl">Account Details</div>
                    {[
                      { k:"Name", v:user.name, cls:"" },
                      { k:"Phone", v:`+${user.phone}`, cls:"mono" },
                      { k:"Balance", v:<AnimatedBalance value={balance} />, cls:"green" },
                    ].map(row => (
                      <div key={row.k} className="acct-row">
                        <span className="acct-key">{row.k}</span>
                        <span className={`acct-val ${row.cls}`}>{row.v}</span>
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