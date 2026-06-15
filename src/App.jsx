import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Zap, Wallet, History, Trophy, BarChart2, LogOut,
  ArrowDownCircle, ArrowUpCircle, Volume2, VolumeX,
  Check, Activity, TrendingUp, DollarSign, Award, Target, Percent,
  ShieldCheck, MoreHorizontal
} from "lucide-react";

import "./styles/global.css";

import { API, SOCKET_URL, FLOAT_WINS } from "./constants";
import { fKES, fTime, fDate, cbCls } from "./utils/format";
import { useSoundEngine } from "./hooks/useSoundEngine";

import AnimatedBalance from "./components/AnimatedBalance";
import GameGraph from "./components/GameGraph";
import BigWinOverlay from "./components/BigWinOverlay";
import CountdownRing from "./components/CountdownRing";
import BetPanel from "./components/BetPanel";
import LiveChat from "./components/LiveChat";
import Locked from "./components/Locked";

import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";
import DepositModal from "./components/modals/DepositModal";
import WithdrawModal from "./components/modals/WithdrawModal";
import ProvablyFairModal from "./components/modals/ProvablyFairModal";
import RoundHistoryModal from "./components/modals/RoundHistoryModal";

export default function App() {
  const [user, setUser] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [soundOn, setSoundOnState] = useState(true);
  const [modal, setModal] = useState(null);
  const [tab, setTabState] = useState(() => localStorage.getItem("avipesa_tab") || "game");
  const setTab = (t) => { setTabState(t); localStorage.setItem("avipesa_tab", t); };
  const [ddOpen, setDdOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState([]);
  const [txnsLoading, setTxnsLoading] = useState(false);
  const [walletMode, setWalletMode] = useState("deposit");
  const [txnFilter, setTxnFilter] = useState("all");
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalWon: 0, totalBets: 0, biggestWin: 0,
    totalWagered: 0, totalLost: 0, cashoutCount: 0, avgCashout: 0
  });

  const [gs, setGs] = useState("waiting");
  const [mult, setMult] = useState(1);
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [betAmt, setBetAmt] = useState("50");
  const [autoCO, setAutoCO] = useState("2.00");
  const [hasBet2, setHasBet2] = useState(false);
  const [cashedOut2, setCashedOut2] = useState(false);
  const [betAmt2, setBetAmt2] = useState("50");
  const [autoCO2, setAutoCO2] = useState("2.00");
  const [pathPts, setPathPts] = useState([]);
  const [planeCrashed, setPlaneCrashed] = useState(false);
  const [cd, setCd] = useState(5);
  const [crashes, setCrashes] = useState([]);
  const [players, setPlayers] = useState([]);
  const [winBanner, setWinBanner] = useState(null);
  const [floatNotifs, setFloatNotifs] = useState([]);
  const [pfHash, setPfHash] = useState(null);
  const [pfExpanded, setPfExpanded] = useState(false);
  const [roundId, setRoundId] = useState(1);
  const [bigWin, setBigWin] = useState(null);
  const [toastState, setToastState] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [onlineCount, setOnlineCount] = useState(() => Math.floor(Math.random() * 1583) + 3000);
  const [adminBanner, setAdminBanner] = useState("");
  const [gamePaused, setGamePaused] = useState(false);

  const gsRef = useRef("waiting");
  const multRef = useRef(1);
  const betAmountRef = useRef(null);
  const cashedOutRef = useRef(false);
  const betAmount2Ref = useRef(null);
  const cashedOut2Ref = useRef(false);
  const lastBetRef = useRef(null);
  const lastBet2Ref = useRef(null);
  const socketRef = useRef(null);
  const roundIdRef = useRef(1);
  const seenBigWinsRef = useRef(new Set());
  const flyTickRef = useRef(0);
  const balanceRef = useRef(0);
  const userRef = useRef(null);
  const betAmtRef = useRef("50");
  const betAmt2StrRef = useRef("50");
  const autoCORef = useRef("2.00");
  const autoCO2Ref = useRef("2.00");

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { betAmtRef.current = betAmt; }, [betAmt]);
  useEffect(() => { betAmt2StrRef.current = betAmt2; }, [betAmt2]);
  useEffect(() => { autoCORef.current = autoCO; }, [autoCO]);
  useEffect(() => { autoCO2Ref.current = autoCO2; }, [autoCO2]);

  const sound = useSoundEngine();

  // Preload audio assets and unlock AudioContext on first user interaction,
  // so sounds are ready immediately when the first round starts.
  useEffect(() => {
    const unlock = () => {
      sound.preload();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [sound]);

  const toast_ = useCallback((msg, type = "ok") => {
    setToastState({ msg, type });
    setTimeout(() => setToastState(null), 3200);
  }, []);

  const addTxn = useCallback((type, label, amount) => {
    setTxns(p => [{ id: Date.now(), type, label, amount, time: new Date() }, ...p]);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("avipesa_token");
    if (!token) { setAppReady(true); return; }
    const timer = setTimeout(() => setAppReady(true), 2200);
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.ok) return r.json();
        if (r.status === 401) {
          // Token is genuinely invalid/expired - clear it
          localStorage.removeItem("avipesa_token");
        }
        return Promise.reject();
      })
      .then(data => {
        setUser(data.user); setBalance(data.user.balance || 0);
        userRef.current = data.user; balanceRef.current = data.user.balance || 0;
        clearTimeout(timer); setAppReady(true);
      })
      .catch(() => {
        // Network error or non-401 failure - keep the token, user stays
        // logged out for this session but can retry on next load
        clearTimeout(timer); setAppReady(true);
      });
    fetchGameConfig();
    return () => clearTimeout(timer);
  }, []);

  // Fetch initial game config (pause state, banner)
  const fetchGameConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API}/game/config`);
      const data = await res.json();
      if (data.paused !== undefined) setGamePaused(data.paused);
      if (data.bannerMsg !== undefined) setAdminBanner(data.bannerMsg || "");
    } catch {}
  }, []);

  const connectSocket = useCallback((token) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_URL, {
      auth: { token: token || "" },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;
    return socket;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("avipesa_token") || "";
    const socket = connectSocket(token);

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      setSocketReady(true);
    });

    socket.on("disconnect", reason => {
      console.log("⚠️ Disconnected:", reason);
      setSocketReady(false);
    });

    socket.on("connect_error", e => console.warn("❌ Error:", e.message));

    socket.on("game:state", data => {
      gsRef.current = data.state; setGs(data.state);
      setMult(data.multiplier || 1); multRef.current = data.multiplier || 1;
      setCd(data.countdown || 5); setCrashes(data.history || []); setPlayers(data.bets || []);
    });

    socket.on("game:waiting", data => {
      gsRef.current = "waiting"; setGs("waiting");
      setMult(1); multRef.current = 1;
      setPathPts([]); setPlaneCrashed(false);
      setCashedOut(false); cashedOutRef.current = false;
      setHasBet(false); betAmountRef.current = null;
      setCashedOut2(false); cashedOut2Ref.current = false;
      setHasBet2(false); betAmount2Ref.current = null;
      setCrashes(data.history || []); setPlayers(data.bets || []);
      seenBigWinsRef.current.clear(); flyTickRef.current = 0;
      sound.stopHum();
      roundIdRef.current += 1; setRoundId(r => r + 1);
    });

    socket.on("game:countdown", data => setCd(data.countdown));

    socket.on("game:flying", data => {
      gsRef.current = "flying"; setGs("flying"); setPlaneCrashed(false);
      flyTickRef.current = 0; setPathPts([{ pct: 0, mult: 1 }]);
      setMult(1); multRef.current = 1; setPlayers(data.bets || []);
      if (data.roundId) { roundIdRef.current = data.roundId; setRoundId(data.roundId); }
      sound.startHum();
    });

    socket.on("game:tick", data => {
      const m = data.multiplier;
      setMult(m); multRef.current = m;
      flyTickRef.current += 1;
      const tick = flyTickRef.current;
      const maxTicks = 200;
      const pct = Math.min(tick / maxTicks, 1);
      setPathPts(p => {
        const next = [...p, { pct, mult: m }];
        if (next.length > maxTicks) {
          const dropped = next.length - maxTicks;
          return next.slice(dropped).map((pt, i) => ({ pct: i / (maxTicks - 1), mult: pt.mult }));
        }
        return next;
      });
      setPlayers(data.bets || []);
      sound.updateHum(m);

      (data.bets || []).forEach(p => {
        if (p.cashed && parseFloat(p.cashMult) >= 10 && !seenBigWinsRef.current.has(p.id || p.name)) {
          seenBigWinsRef.current.add(p.id || p.name);
          setBigWin({ player: p.name, mult: p.cashMult });
          setTimeout(() => setBigWin(null), 2500);
        }
      });
    });

    socket.on("game:crashed", data => {
      gsRef.current = "crashed"; setGs("crashed"); setPlaneCrashed(true);
      const cm = data.multiplier;
      setCrashes(p => [cm, ...p].slice(0, 32));
      setPlayers(data.bets || []);
      if (data.hash) setPfHash(data.hash);
      if (data.roundId) { roundIdRef.current = data.roundId; setRoundId(data.roundId); }
      sound.stopHum(); sound.playCrash();
      if (betAmountRef.current && !cashedOutRef.current)
        toast_(`Crashed x${cm.toFixed(2)} — Lost ${fKES(parseFloat(betAmountRef.current))}`, "err");
      if (betAmount2Ref.current && !cashedOut2Ref.current)
        toast_(`Bet 2 crashed x${cm.toFixed(2)}`, "err");
      betAmountRef.current = null; setHasBet(false);
      betAmount2Ref.current = null; setHasBet2(false);
    });

    socket.on("game:bets", bets => setPlayers(bets || []));

    socket.on("admin:notify", data => {
      toast_(data.message, "ok");
    });

    socket.on("admin:broadcast", data => {
      toast_(data.message, "ok");
    });

    socket.on("game:config", data => {
      if (data.bannerMsg !== undefined) {
        setAdminBanner(data.bannerMsg || "");
      }
      if (data.paused !== undefined) {
        setGamePaused(data.paused);
      }
    });

    socket.on("bet:result", result => {
      if (result.panelId === 2) {
        if (result.ok) {
          setBalance(result.balance); balanceRef.current = result.balance;
          setHasBet2(true);
          betAmount2Ref.current = String(result.amount || betAmt2StrRef.current);
          lastBet2Ref.current = parseFloat(betAmt2StrRef.current);
          toast_(`Bet 2 placed — ${fKES(parseFloat(betAmt2StrRef.current))}`);
        } else { toast_(result.error || "Bet 2 failed", "err"); }
      } else {
        if (result.ok) {
          setBalance(result.balance); balanceRef.current = result.balance;
          setHasBet(true);
          betAmountRef.current = String(result.amount || betAmtRef.current);
          lastBetRef.current = parseFloat(betAmtRef.current);
          toast_(`Bet placed — ${fKES(parseFloat(betAmtRef.current))}`);
        } else { toast_(result.error || "Bet failed", "err"); }
      }
    });

    socket.on("cashout:result", result => {
      if (result.panelId === 2) {
        if (result.ok) {
          cashedOut2Ref.current = true; setCashedOut2(true);
          setBalance(result.balance); balanceRef.current = result.balance;
          addTxn("win", `Bet 2 Win x${result.mult.toFixed(2)}`, result.profit);
          toast_(`Bet 2 cashed x${result.mult.toFixed(2)} — Won ${fKES(result.payout)}`);
          sound.playCashout();
        } else { toast_(result.error || "Cashout failed", "err"); }
      } else {
        if (result.ok) {
          cashedOutRef.current = true; setCashedOut(true);
          setBalance(result.balance); balanceRef.current = result.balance;
          addTxn("win", `Win x${result.mult.toFixed(2)}`, result.profit);
          setWinBanner(`x${result.mult.toFixed(2)} — Won ${fKES(result.payout)}`);
          setTimeout(() => setWinBanner(null), 3000);
          toast_(`Cashed out x${result.mult.toFixed(2)} — Won ${fKES(result.payout)}`);
          sound.playCashout();
        } else { toast_(result.error || "Cashout failed", "err"); }
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const fluc = setInterval(() => {
      setOnlineCount(prev => {
        const delta = Math.floor(Math.random() * 40) - 18;
        return Math.min(4583, Math.max(3000, prev + delta));
      });
    }, 8000);
    return () => clearInterval(fluc);
  }, []);

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

  const handleBet = useCallback(() => {
    const u = userRef.current;
    if (!u) { setModal("login"); return; }
    if (gamePaused) { toast_("Game is currently paused", "err"); return; }
    if (gamePaused) { toast_("Game is currently paused", "err"); return; }
    const a = parseFloat(betAmtRef.current);
    if (isNaN(a) || a < 10) { toast_("Minimum bet is KES 10", "err"); return; }
    if (a > balanceRef.current) { toast_("Insufficient balance", "err"); return; }
    if (gsRef.current !== "waiting") { toast_("Wait for next round", "err"); return; }
    if (betAmountRef.current) { toast_("Bet already placed", "err"); return; }
    const socket = socketRef.current;
    if (!socket) { toast_("Not connected. Please refresh.", "err"); return; }
    socket.emit("bet:place", { amount: a });
  }, [toast_, gamePaused]);

  const handleBet2 = useCallback(() => {
    const u = userRef.current;
    if (!u) { setModal("login"); return; }
    if (gamePaused) { toast_("Game is currently paused", "err"); return; }
    if (gamePaused) { toast_("Game is currently paused", "err"); return; }
    const a = parseFloat(betAmt2StrRef.current);
    if (isNaN(a) || a < 10) { toast_("Minimum bet is KES 10", "err"); return; }
    if (a > balanceRef.current) { toast_("Insufficient balance", "err"); return; }
    if (gsRef.current !== "waiting") { toast_("Wait for next round", "err"); return; }
    if (betAmount2Ref.current) { toast_("Bet 2 already placed", "err"); return; }
    const socket = socketRef.current;
    if (!socket) { toast_("Not connected. Please refresh.", "err"); return; }
    socket.emit("bet:place", { amount: a, panelId: 2 });
  }, [toast_, gamePaused]);

  const doCashout = useCallback(() => {
    if (!betAmountRef.current || cashedOutRef.current) return;
    if (gsRef.current !== "flying") return;
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("bet:cashout");
  }, []);

  const doCashout2 = useCallback(() => {
    if (!betAmount2Ref.current || cashedOut2Ref.current) return;
    if (gsRef.current !== "flying") return;
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("bet:cashout", { panelId: 2 });
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.code !== "Space") return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      if (gsRef.current === "waiting" && !betAmountRef.current) { handleBet(); return; }
      if (gsRef.current === "flying" && betAmountRef.current && !cashedOutRef.current) { doCashout(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleBet, doCashout]);

  const fetchTxns = () => {
    if (!userRef.current) return;
    setTxnsLoading(true);
    fetch(`${API}/wallet/transactions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("avipesa_token")}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTxns(data.map(t => ({ ...t, time: new Date(t.created_at) }))); })
      .catch(() => {})
      .finally(() => setTxnsLoading(false));
  };

  useEffect(() => {
    if (tab === "history") fetchTxns();
  }, [tab]);

  useEffect(() => {
    if (tab === "leaderboard") {
      fetch(`${API}/game/leaderboard`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setLeaderboard(data.map(p => ({
            name: p.name, total: p.total_won, bets: p.total_bets, best: p.best_cashout
          })));
        })
        .catch(() => {});
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "stats" && userRef.current) {
      fetch(`${API}/game/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("avipesa_token")}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setStats(data); })
        .catch(() => {});
    }
  }, [tab]);

  const handleLogin = useCallback((u) => {
    setUser(u); setBalance(u.balance || 0);
    userRef.current = u; balanceRef.current = u.balance || 0;
    toast_(`Welcome, ${u.name.split(" ")[0]}!`);
    const socket = socketRef.current;
    if (socket) {
      socket.auth = { token: localStorage.getItem("avipesa_token") || "" };
      socket.disconnect().connect();
    }
  }, [toast_]);

  const handleLogout = () => {
    localStorage.removeItem("avipesa_token");
    setUser(null); setBalance(0); userRef.current = null; balanceRef.current = 0;
    setDdOpen(false);
    setHasBet(false); betAmountRef.current = null;
    setHasBet2(false); betAmount2Ref.current = null;
    const socket = socketRef.current;
    if (socket) {
      socket.auth = { token: "" };
      socket.disconnect().connect();
    }
    toast_("Signed out");
  };

  const handleDeposit = (newBalance, amt) => {
    setBalance(newBalance); balanceRef.current = newBalance;
    addTxn("dep", "M-Pesa Deposit", amt);
    toast_(`${fKES(amt)} deposited!`);
  };

  const handleWithdraw = (newBalance, amt) => {
    setBalance(newBalance); balanceRef.current = newBalance;
    addTxn("wd", "M-Pesa Withdrawal", -amt);
    toast_(`${fKES(amt)} sent to M-Pesa`);
  };

  const md = mult.toFixed(2);

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
  const rankLabel = i => ["1st", "2nd", "3rd"][i] || `${i + 1}`;
  const fmtRoundId = id => `#${String(id).padStart(5, "0")}`;

  const histIcon = type => {
    if (type === "dep") return <ArrowDownCircle size={15} />;
    if (type === "win") return <Award size={15} />;
    if (type === "wd") return <ArrowUpCircle size={15} />;
    return <Activity size={15} />;
  };

  const NAV_TABS = [
    { id: "game",        icon: <Zap size={14} />,      label: "Game"    },
    { id: "wallet",      icon: <Wallet size={14} />,    label: "Wallet"  },
    { id: "history",     icon: <History size={14} />,   label: "History" },
    { id: "leaderboard", icon: <Trophy size={14} />,    label: "Leaders" },
    { id: "stats",       icon: <BarChart2 size={14} />, label: "Stats"   },
  ];

  if (!appReady) {
    return (
      <div className="splash">
        <div style={{ color: "var(--blue)" }}><Zap size={36} /></div>
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

      {modal === "login"    && <LoginModal    onClose={() => setModal(null)} onLogin={handleLogin}  goRegister={() => setModal("register")} />}
      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onLogin={handleLogin}  goLogin={() => setModal("login")} />}
      {modal === "deposit"  && <DepositModal  onClose={() => setModal(null)} onDeposit={handleDeposit} />}
      {modal === "withdraw" && <WithdrawModal onClose={() => setModal(null)} balance={balance} onWithdraw={handleWithdraw} />}
      {modal === "pf"       && <ProvablyFairModal onClose={() => setModal(null)} hash={pfHash} roundId={roundId} />}
      {modal === "history"  && <RoundHistoryModal onClose={() => setModal(null)} crashes={crashes} />}

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
            <button className="icon-btn" onClick={() => { const n = !soundOn; setSoundOnState(n); sound.setSoundOn(n); }}>
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
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
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                          <div>
                            <div className="dd-name">{user.name}</div>
                            <div className="dd-phone">+{user.phone}</div>
                            {user.aviId && <div style={{fontSize:10,fontWeight:700,color:"var(--blue)",marginTop:3,fontFamily:"monospace"}}>{user.aviId}</div>}
                          </div>
                          <button onClick={() => setDdOpen(false)} style={{background:"none",border:"none",color:"var(--text2)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 0 0 8px",flexShrink:0}}>×</button>
                        </div>
                      </div>
                      {NAV_TABS.map(t => (
                        <button key={t.id} className="dd-item" onClick={() => { setTab(t.id); setDdOpen(false); }}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                      <button className="dd-item" onClick={() => { setModal("deposit"); setDdOpen(false); }}>
                        <ArrowDownCircle size={13} /> Deposit
                      </button>
                      <div className="dd-sep" />
                      <button className="dd-item danger" onClick={handleLogout}>
                        <LogOut size={13} /> Sign Out
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

      {gamePaused && (
        <div style={{background:"rgba(255,77,109,0.12)",borderBottom:"1px solid rgba(255,77,109,0.3)",padding:"8px 14px",textAlign:"center",fontSize:12,fontWeight:600,color:"#ff4d6d"}}>⏸ Game is currently paused by admin</div>
      )}
      {adminBanner && (
        <div style={{background:"rgba(255,183,3,0.12)",borderBottom:"1px solid rgba(255,183,3,0.3)",padding:"8px 14px",textAlign:"center",fontSize:12,fontWeight:600,color:"#ffb703"}}>
          📢 {adminBanner}
        </div>
      )}
      <div className="mob-tabs">
        {NAV_TABS.map(t => (
          <button key={t.id} className={`mtab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "game" && (
        <div className="layout">
          <div>
            <div className="gcard">
              <div className="gtopbar">
                <div className="live-ind"><div className="live-dot" />LIVE</div>
                <div className={`rbadge ${gs}`}>
                  {gs === "waiting" ? `Next in ${cd}s` : gs === "crashed" ? "CRASHED" : "IN PLAY"}
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
                <button className="history-btn" onClick={() => setModal("history")}>
                  <MoreHorizontal size={14} />
                </button>
              </div>

              <div className="canvas">
                {bigWin && <BigWinOverlay player={bigWin.player} mult={bigWin.mult} />}
                {(gs === "flying" || gs === "crashed") && pathPts.length >= 2 && (
                  <GameGraph
                    gs={gs}
                    mult={mult}
                    pathPts={pathPts}
                    crashed={planeCrashed}
                    roundId={roundId}
                  />
                )}
                {gs === "waiting" && <CountdownRing cd={cd} total={5} />}
                {winBanner && <div className="win-flash">{winBanner}</div>}
              </div>

              <BetPanel
                gs={gs} user={user} hasBet={hasBet} cashedOut={cashedOut}
                betAmt={betAmt} setBetAmt={setBetAmt} autoCO={autoCO} setAutoCO={setAutoCO}
                onBet={handleBet} onCashout={doCashout} onLogin={openLogin} md={md}
                lastBetRef={lastBetRef}
                hasBet2={hasBet2} cashedOut2={cashedOut2}
                betAmt2={betAmt2} setBetAmt2={setBetAmt2} autoCO2={autoCO2} setAutoCO2={setAutoCO2}
                onBet2={handleBet2} onCashout2={doCashout2}
                lastBet2Ref={lastBet2Ref}
                socket={socketReady ? socketRef.current : null}
              />

              <div className="pf-bar">
                <span className="pf-label">Provably Fair</span>
                <span className="pf-hash">{pfHash || "Hash published after each round"}</span>
                <button className="pf-toggle" onClick={() => setModal("pf")}>
                  <ShieldCheck size={10} /> Verify
                </button>
                <button className="pf-toggle" onClick={() => setPfExpanded(e => !e)}>
                  {pfExpanded ? "▲" : "▼"}
                </button>
              </div>
              {pfExpanded && (
                <div className="pf-expanded">
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text2)", marginBottom: 5 }}>
                    Round {fmtRoundId(roundId)} · Server Seed Hash
                  </div>
                  <div className="pf-expanded-hash">{pfHash || "No hash yet — play a round first."}</div>
                  <button className="pf-toggle" style={{ fontSize: 10 }} onClick={() => setModal("pf")}>
                    <ShieldCheck size={10} /> How to verify →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rcol">
            <div className="rcard">
              <div className="rhead" style={{flexDirection:"column",alignItems:"flex-start",gap:4,padding:"10px 12px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
                  <span className="rtitle">Active Players</span>
                  <span className="rcnt">{players.length} in round</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#00e676",boxShadow:"0 0 6px #00e676",animation:"blk 1.4s infinite"}}/>
                  <span style={{fontSize:10,fontWeight:700,color:"#00e676"}}>{onlineCount.toLocaleString()} online now</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"36px 1fr 55px 45px 72px",gap:6,padding:"5px 12px 4px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <div/>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)"}}>Player</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)",textAlign:"right"}}>Bet KES</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)",textAlign:"center"}}>X</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)",textAlign:"right"}}>Win KES</div>
              </div>
              <div className="plist">
                {[...players].sort((a,b) => Number(b.bet) - Number(a.bet)).slice(0, 150).map((p, i) => {
                  const initials = p.name ? p.name.slice(0,2).toUpperCase() : "??";
                  const avatarSeeds = ["felix","mimi","misty","smokey","tiger","cleo","luna","max","simba","nala","oreo","shadow","whiskers","mittens","boots"];
                  const avatarSeed = avatarSeeds[(p.name?.charCodeAt(0) || i + p.name?.charCodeAt(1) || 0) % avatarSeeds.length];
                  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                  return (
                  <div key={p.id || i} className={`prow ${p.cashed ? "cashed" : ""}`} style={{display:"grid",gridTemplateColumns:"36px 1fr 55px 45px 72px",alignItems:"center",gap:6,padding:"7px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    {/* Avatar */}
                    <div style={{width:34,height:34,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#2a2f3e",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg viewBox="0 0 36 36" width="34" height="34" xmlns="http://www.w3.org/2000/svg">
                        <rect width="36" height="36" fill="#2a2f3e"/>
                        <circle cx="18" cy="14" r="7" fill="#4a5068"/>
                        <ellipse cx="18" cy="30" rx="11" ry="8" fill="#4a5068"/>
                      </svg>
                    </div>
                    {/* Player ID */}
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                    {/* Bet KES */}
                    <div style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--text2)",whiteSpace:"nowrap"}}>
                      {Number(p.bet).toLocaleString()}
                    </div>
                    {/* X multiplier */}
                    <div style={{textAlign:"center"}}>
                      {p.cashed
                        ? <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:800,color:"#c77dff"}}>{p.cashMult}×</div>
                        : gs==="flying"
                          ? <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ffb703",animation:"blk 1s infinite"}}>{md}×</div>
                          : <div/>}
                    </div>
                    {/* Win KES */}
                    <div style={{textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#00e676"}}>
                      {p.cashed ? (p.cashMult*p.bet).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2}) : ""}
                    </div>
                  </div>
                  );
                })}
                {players.length === 0 && (
                  <div style={{padding:"18px 9px",fontSize:11,color:"var(--text2)",textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:5}}>✈️</div>
                    Waiting for bets...
                  </div>
                )}
              </div>
            </div>

            <div className="rcard">
              <div className="rhead">
                <span className="rtitle">Quick Deposit</span>
                <span style={{ fontSize: 9, fontWeight: 700, background: "var(--mpesa)", color: "#fff", padding: "2px 6px", borderRadius: 4, letterSpacing: 1 }}>M-PESA</span>
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
                  <div style={{ textAlign: "center", padding: "9px 0" }}>
                    <div style={{ color: "var(--text2)", fontSize: 12, marginBottom: 11, lineHeight: 1.6 }}>
                      Sign in to deposit and play
                    </div>
                    <button className="btn-mpesa-full" onClick={openLogin}>Sign In to Deposit</button>
                  </div>
                )}
              </div>
            </div>

            <LiveChat />
          </div>

          <div className="mob-players">
            <div className="rhead" style={{flexDirection:"column",alignItems:"flex-start",gap:3,padding:"9px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
                <span className="rtitle">Active Players</span>
                <span className="rcnt">{players.length} in round</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#00e676",boxShadow:"0 0 6px #00e676",animation:"blk 1.4s infinite"}}/>
                <span style={{fontSize:10,fontWeight:700,color:"#00e676"}}>{onlineCount.toLocaleString()} online now</span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"36px 1fr 55px 45px 72px",gap:6,padding:"5px 12px 4px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <div/>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)"}}>Player</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)",textAlign:"right"}}>Bet KES</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)",textAlign:"center"}}>X</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:"var(--text2)",textAlign:"right"}}>Win KES</div>
              </div>
            <div className="plist">
              {[...players].sort((a,b) => Number(b.bet) - Number(a.bet)).slice(0, 150).map((p, i) => {
                const initials = p.name ? p.name.slice(0,2).toUpperCase() : "??";
                const avatarSeeds = ["felix","mimi","misty","smokey","tiger","cleo","luna","max","simba","nala","oreo","shadow","whiskers","mittens","boots"];
                const avatarSeed = avatarSeeds[(p.name?.charCodeAt(0) || i + p.name?.charCodeAt(1) || 0) % avatarSeeds.length];
                const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
                return (
                <div key={p.id || i} className={`prow ${p.cashed ? "cashed" : ""}`} style={{display:"grid",gridTemplateColumns:"36px 1fr 55px 45px 72px",alignItems:"center",gap:6,padding:"7px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <div style={{width:34,height:34,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#2a2f3e",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg viewBox="0 0 36 36" width="34" height="34" xmlns="http://www.w3.org/2000/svg">
                      <rect width="36" height="36" fill="#2a2f3e"/>
                      <circle cx="18" cy="14" r="7" fill="#4a5068"/>
                      <ellipse cx="18" cy="30" rx="11" ry="8" fill="#4a5068"/>
                    </svg>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                  <div style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--text2)",whiteSpace:"nowrap"}}>{Number(p.bet).toLocaleString()}</div>
                  <div style={{textAlign:"center"}}>
                    {p.cashed ? <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:800,color:"#c77dff"}}>{p.cashMult}×</div> : gs==="flying" ? <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ffb703",animation:"blk 1s infinite"}}>{md}×</div> : <div/>}
                  </div>
                  {/* Win KES */}
                  <div style={{textAlign:"right"}}>
                    {p.cashed ? <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:"#00e676"}}>{(p.cashMult*p.bet).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}</div> : <div/>}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "wallet" && (
        <div className="page">
          <div className="pcard">
            {!user ? (
              <Locked title="Wallet Locked" sub="Sign in to view your balance, deposit or withdraw."
                openLogin={openLogin} openRegister={openRegister} />
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
                    <button className={`tabbtn ${walletMode === "deposit" ? "on-dep" : ""}`}
                      onClick={() => setWalletMode("deposit")}>
                      <ArrowDownCircle size={14} /> Deposit
                    </button>
                    <button className={`tabbtn ${walletMode === "withdraw" ? "on-wd" : ""}`}
                      onClick={() => setWalletMode("withdraw")}>
                      <ArrowUpCircle size={14} /> Withdraw
                    </button>
                  </div>
                  {walletMode === "deposit" ? (
                    <button className="btn-mpesa-full" onClick={() => setModal("deposit")}>
                      <ArrowDownCircle size={14} /> Deposit via M-Pesa
                    </button>
                  ) : (
                    <button className="btn-mpesa-full"
                      style={{ background: "var(--amber)", color: "#1a0a00" }}
                      onClick={() => setModal("withdraw")}>
                      <ArrowUpCircle size={14} /> Withdraw Funds
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="page wide">
          <div className="pcard">
            {!user ? (
              <Locked title="History Locked" sub="Sign in to view your transaction history."
                openLogin={openLogin} openRegister={openRegister} />
            ) : (
              <>
                <div className="pcard-head">
                  <div className="pcard-title">Transaction History</div>
                  <div className="pcard-sub">{filteredTxns.length} records</div>
                </div>
                <div className="filter-row">
                  {[
                    { k: "all", l: "All" }, { k: "deposits", l: "Deposits" },
                    { k: "wins", l: "Wins" }, { k: "withdrawals", l: "Withdrawals" }
                  ].map(f => (
                    <button key={f.k} className={`fpill ${txnFilter === f.k ? "on" : ""}`}
                      onClick={() => setTxnFilter(f.k)}>{f.l}</button>
                  ))}
                </div>
                {txnsLoading ? (
                  <div style={{padding:"16px"}}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        background:"#0e1117",border:"1px solid rgba(255,255,255,0.07)",
                        borderRadius:14,margin:"0 0 12px",overflow:"hidden",
                        animation:"pulse 1.4s ease-in-out infinite",
                      }}>
                        <div style={{padding:"14px 16px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.06)"}}/>
                            <div>
                              <div style={{width:80,height:10,borderRadius:4,background:"rgba(255,255,255,0.06)",marginBottom:8}}/>
                              <div style={{width:120,height:12,borderRadius:4,background:"rgba(255,255,255,0.04)"}}/>
                            </div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{width:90,height:16,borderRadius:4,background:"rgba(255,255,255,0.06)",marginBottom:8}}/>
                            <div style={{width:60,height:10,borderRadius:10,background:"rgba(255,255,255,0.04)"}}/>
                          </div>
                        </div>
                        <div style={{borderTop:"1px dashed rgba(255,255,255,0.05)",margin:"0 16px"}}/>
                        <div style={{padding:"10px 16px 14px",display:"flex",justifyContent:"space-between"}}>
                          <div style={{width:60,height:9,borderRadius:4,background:"rgba(255,255,255,0.04)"}}/>
                          <div style={{width:100,height:9,borderRadius:4,background:"rgba(255,255,255,0.04)"}}/>
                        </div>
                      </div>
                    ))}
                    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                  </div>
                ) : filteredTxns.length === 0 ? (
                  <div className="nodata">No transactions found.</div>
                ) : null}
                {filteredTxns.map((t, idx) => {
                  const isWin = t.type === "win";
                  const isDep = t.type === "dep";
                  const isWd  = t.type === "wd";
                  const isBet = t.type === "bet";
                  const positive = t.amount >= 0;
                  const accentColor = isWin ? "#00e676" : isDep ? "#00e676" : isWd ? "#4f8ef7" : "#ff4d6d";
                  const emoji = isWin ? "🏆" : isDep ? "💰" : isWd ? "📤" : "❌";
                  const typeLabel = isWin ? "WIN" : isDep ? "DEPOSIT" : isWd ? "WITHDRAWAL" : "BET PLACED";
                  const refNum = t.reference || `TXN${String(t.id).padStart(8,"0")}`;
                  return (
                  <div key={t.id} style={{
                    background:"#0e1117",
                    border:"1px solid rgba(255,255,255,0.07)",
                    borderRadius:14,
                    margin:"0 16px 12px",
                    overflow:"hidden",
                    boxShadow:"0 2px 12px rgba(0,0,0,0.4)",
                  }}>
                    {/* TOP SECTION */}
                    <div style={{padding:"14px 16px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom: (isWin||isBet) ? 10 : 0}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{fontSize:26,lineHeight:1}}>{emoji}</div>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:accentColor}}>{typeLabel}</div>
                            <div style={{fontSize:13,fontWeight:600,color:"#c8d0e0",marginTop:2}}>{t.label}</div>
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:800,color:accentColor,letterSpacing:"-0.5px"}}>
                            {positive ? "+" : "-"}KES {Number(Math.abs(t.amount)).toLocaleString("en-KE",{minimumFractionDigits:2})}
                          </div>
                          <div style={{
                            display:"inline-block",marginTop:4,fontSize:9,fontWeight:700,
                            padding:"2px 8px",borderRadius:20,letterSpacing:"0.8px",
                            background: t.status==="pending" ? "rgba(255,183,3,0.15)" : isWin ? "rgba(0,230,118,0.12)" : isBet ? "rgba(255,77,109,0.12)" : isDep ? "rgba(0,230,118,0.12)" : "rgba(79,142,247,0.12)",
                            color: t.status==="pending" ? "#ffb703" : isWin ? "#00e676" : isBet ? "#ff4d6d" : isDep ? "#00e676" : "#4f8ef7",
                            border: `1px solid ${t.status==="pending" ? "rgba(255,183,3,0.3)" : isWin ? "rgba(0,230,118,0.25)" : isBet ? "rgba(255,77,109,0.25)" : isDep ? "rgba(0,230,118,0.25)" : "rgba(79,142,247,0.25)"}`,
                          }}>{t.status==="pending" ? "⏳ PENDING" : isWin ? "🏆 WIN" : isBet ? "❌ LOSS" : isDep ? "✓ DEPOSITED" : "✓ WITHDRAWN"}</div>
                        </div>
                      </div>
                      {/* WIN DETAILS: bet amount, multiplier, cashout */}
                      {isWin && (() => {
                        const multMatch = t.label.match(/x([\d.]+)/i);
                        const mult = multMatch ? parseFloat(multMatch[1]) : null;
                        const betAmt = mult ? Math.abs(t.amount) / mult : null;
                        const cashout = Math.abs(t.amount);
                        return mult ? (
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,background:"rgba(0,230,118,0.04)",border:"1px solid rgba(0,230,118,0.1)",borderRadius:8,padding:"8px 10px"}}>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontSize:9,color:"#6b7a99",fontWeight:600,letterSpacing:"0.5px",marginBottom:3}}>BET</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#f0f4ff"}}>KES {betAmt.toLocaleString("en-KE",{minimumFractionDigits:2})}</div>
                            </div>
                            <div style={{textAlign:"center",borderLeft:"1px solid rgba(255,255,255,0.06)",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
                              <div style={{fontSize:9,color:"#6b7a99",fontWeight:600,letterSpacing:"0.5px",marginBottom:3}}>CASHED OUT</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:800,color:"#00e676"}}>{mult.toFixed(2)}×</div>
                            </div>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontSize:9,color:"#6b7a99",fontWeight:600,letterSpacing:"0.5px",marginBottom:3}}>RECEIVED</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#00e676"}}>KES {cashout.toLocaleString("en-KE",{minimumFractionDigits:2})}</div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                      {/* BET DETAILS: just show bet amount */}
                      {isBet && (
                        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,77,109,0.04)",border:"1px solid rgba(255,77,109,0.1)",borderRadius:8,padding:"8px 10px"}}>
                          <span style={{fontSize:9,color:"#6b7a99",fontWeight:600,letterSpacing:"0.5px"}}>AMOUNT BETTED</span>
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#ff4d6d",marginLeft:"auto"}}>KES {Number(Math.abs(t.amount)).toLocaleString("en-KE",{minimumFractionDigits:2})}</span>
                        </div>
                      )}
                    </div>

                    {/* TEAR LINE */}
                    <div style={{position:"relative",height:12,overflow:"hidden",margin:"0 -1px"}}>
                      <div style={{position:"absolute",top:0,left:0,right:0,borderTop:"1px dashed rgba(255,255,255,0.1)"}}/>
                      {Array.from({length:18}).map((_,i) => (
                        <div key={i} style={{
                          position:"absolute",top:-6,
                          left:`${(i/18)*100}%`,
                          width:12,height:12,borderRadius:"50%",
                          background:"#06080e",
                          transform:"translateX(-50%)",
                        }}/>
                      ))}
                    </div>

                    {/* BOTTOM SECTION */}
                    <div style={{padding:"10px 16px 14px",background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:10,color:"#4a5568",fontWeight:600,letterSpacing:"0.5px"}}>DATE & TIME</span>
                        <span style={{fontSize:10,color:"#718096",fontFamily:"'JetBrains Mono',monospace"}}>{fDate(t.time)} · {fTime(t.time)}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:10,color:"#4a5568",fontWeight:600,letterSpacing:"0.5px"}}>REF</span>
                        <span style={{fontSize:10,color:"#718096",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.3px"}}>{refNum}</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

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

      {tab === "stats" && (
        <div className="page">
          <div className="pcard">
            {!user ? (
              <Locked title="Stats Locked" sub="Sign in to see your performance statistics."
                openLogin={openLogin} openRegister={openRegister} />
            ) : (
              <>
                <div className="pcard-head">
                  <div className="pcard-title">My Stats</div>
                  <div className="pcard-sub">Your performance overview</div>
                </div>
                <div className="pcard-body">
                  <div className="stats-grid">
                    {[
                      { icon: <Activity size={15} />,    val: stats.totalBets,                                          lbl: "Total Bets",    cls: "amber" },
                      { icon: <TrendingUp size={15} />,  val: fKES(stats.totalWon),                                     lbl: "Total Won",     cls: "green" },
                      { icon: <DollarSign size={15} />,  val: fKES(stats.totalLost || 0),                               lbl: "Total Lost",    cls: "red"   },
                      { icon: <Award size={15} />,       val: stats.biggestWin > 0 ? `×${Number(stats.biggestWin).toFixed(2)}` : "—", lbl: "Best Cashout", cls: "amber" },
                      { icon: <Target size={15} />,      val: stats.avgCashout > 0 ? `×${Number(stats.avgCashout).toFixed(2)}` : "—", lbl: "Avg Cashout",  cls: "" },
                      { icon: <Percent size={15} />,     val: stats.totalBets > 0 ? `${Math.round((stats.cashoutCount / stats.totalBets) * 100)}%` : "—", lbl: "Win Rate", cls: "" },
                      { icon: <DollarSign size={15} />,  val: fKES(stats.totalWagered || 0),                            lbl: "Total Wagered", cls: "" },
                      { icon: <TrendingUp size={15} />,  val: fKES(stats.totalWon - (stats.totalLost || 0)),            lbl: "Net Profit",    cls: (stats.totalWon - (stats.totalLost || 0)) >= 0 ? "green" : "red" },
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
                      { k: "Player ID", v: user.aviId || "—",          cls: "mono"  },
                      { k: "Name",    v: user.name,                   cls: ""      },
                      { k: "Phone",   v: `+${user.phone}`,            cls: "mono"  },
                      { k: "Balance", v: <AnimatedBalance value={balance} />, cls: "green" },
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