import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, DollarSign, TrendingUp, Activity,
  Shield, Ban, CheckCircle, Search, RefreshCw, LogOut,
  BarChart2, Eye, ChevronLeft, ChevronRight, Zap,
  ArrowDownCircle, ArrowUpCircle, Award, Menu, X
} from "lucide-react";

const API = "https://aviator-backend-production-1de1.up.railway.app/api";

const fKES = n => `KES ${Number(n||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fDate = d => new Date(d).toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});
const fTime = d => new Date(d).toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"});
const fNum = n => Number(n||0).toLocaleString();

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem("avipesa_admin_token") || "");
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [txns, setTxns] = useState([]);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnPage, setTxnPage] = useState(1);
  const [txnType, setTxnType] = useState("");
  const [rounds, setRounds] = useState([]);
  const [roundTotal, setRoundTotal] = useState(0);
  const [roundPage, setRoundPage] = useState(1);
  const [liveData, setLiveData] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [adjustAmt, setAdjustAmt] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [dailyReport, setDailyReport] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueDays, setRevenueDays] = useState(7);
  const [topDepositors, setTopDepositors] = useState([]);
  const [topWinners, setTopWinners] = useState([]);
  const [gameConfig, setGameConfig] = useState({ paused: false, minBet: 10, maxBet: 50000, bannerMsg: "" });
  const [suspicious, setSuspicious] = useState([]);
  const [largeWds, setLargeWds] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyUserId, setNotifyUserId] = useState("");
  const [commsResult, setCommsResult] = useState("");
  const [minBetInput, setMinBetInput] = useState("10");
  const [maxBetInput, setMaxBetInput] = useState("50000");
  const [bannerInput, setBannerInput] = useState("");

  const authFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    });
    if (res.status === 401 || res.status === 403) {
      setAuthed(false);
      localStorage.removeItem("avipesa_admin_token");
      return null;
    }
    return res.json();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    authFetch("/admin/overview").then(d => {
      if (d && !d.error) setAuthed(true);
    });
  }, []);

  const login = async () => {
    setLoginErr("");
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginErr(data.error || "Invalid secret"); return; }
      localStorage.setItem("avipesa_admin_token", data.token);
      setToken(data.token);
      setAuthed(true);
    } catch { setLoginErr("Network error"); }
  };

  const logout = () => {
    localStorage.removeItem("avipesa_admin_token");
    setToken(""); setAuthed(false);
  };

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    const d = await authFetch("/admin/overview");
    if (d) setOverview(d);
    setLoading(false);
  }, [authFetch]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const d = await authFetch(`/admin/users?search=${userSearch}&page=${userPage}&limit=20`);
    if (d) { setUsers(d.users || []); setUserTotal(d.total || 0); }
    setLoading(false);
  }, [authFetch, userSearch, userPage]);

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    const d = await authFetch(`/admin/transactions?type=${txnType}&page=${txnPage}&limit=30`);
    if (d) { setTxns(d.transactions || []); setTxnTotal(d.total || 0); }
    setLoading(false);
  }, [authFetch, txnType, txnPage]);

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    const d = await authFetch(`/admin/rounds?page=${roundPage}&limit=30`);
    if (d) { setRounds(d.rounds || []); setRoundTotal(d.total || 0); }
    setLoading(false);
  }, [authFetch, roundPage]);

  const fetchLive = useCallback(async () => {
    const d = await authFetch("/admin/live");
    if (d) setLiveData(d);
  }, [authFetch]);

  const fetchGameStats = useCallback(async () => {
    const d = await authFetch("/admin/gamestats");
    if (d) setGameStats(d);
  }, [authFetch]);

  const fetchUserDetail = useCallback(async (id) => {
    const d = await authFetch(`/admin/users/${id}`);
    if (d) setSelectedUser(d);
  }, [authFetch]);

  useEffect(() => {
    if (!authed) return;
    if (tab === "overview") { fetchOverview(); fetchGameStats(); }
    if (tab === "users") fetchUsers();
    if (tab === "transactions") fetchTxns();
    if (tab === "rounds") fetchRounds();
    if (tab === "live") fetchLive();
    if (tab === "reports") fetchReports();
    if (tab === "gamecontrol") fetchGameConfig();
    if (tab === "risk") fetchRisk();
  }, [authed, tab]);

  useEffect(() => { if (authed && tab === "users") fetchUsers(); }, [userPage, userSearch]);
  useEffect(() => { if (authed && tab === "transactions") fetchTxns(); }, [txnPage, txnType]);
  useEffect(() => { if (authed && tab === "rounds") fetchRounds(); }, [roundPage]);

  useEffect(() => {
    if (!authed || tab !== "live") return;
    const t = setInterval(fetchLive, 3000);
    return () => clearInterval(t);
  }, [authed, tab, fetchLive]);

  const banUser = async (id, banned) => {
    const d = await authFetch(`/admin/users/${id}/ban`, {
      method: "POST",
      body: JSON.stringify({ banned }),
    });
    if (d?.ok) {
      setActionMsg(banned ? "User banned" : "User unbanned");
      fetchUserDetail(id);
      setTimeout(() => setActionMsg(""), 2500);
    }
  };

  const adjustBalance = async (id, action) => {
    const amt = parseFloat(adjustAmt);
    if (isNaN(amt) || amt <= 0) return;
    const finalAmt = action === "deduct" ? -amt : amt;
    const defaultNote = action === "deduct" ? "Admin debit" : "Admin credit";
    const d = await authFetch(`/admin/users/${id}/balance`, {
      method: "POST",
      body: JSON.stringify({ amount: finalAmt, note: adjustNote || defaultNote }),
    });
    if (d?.ok) {
      setActionMsg(action === "deduct" ? `Deducted ${fKES(amt)}` : `Added ${fKES(amt)}`);
      setAdjustAmt(""); setAdjustNote("");
      fetchUserDetail(id);
      setTimeout(() => setActionMsg(""), 2500);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setSelectedUser(null);
    setSidebarOpen(false);
  };

  if (!authed) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#06080e",padding:"16px"}}>
        <div style={{width:"100%",maxWidth:360,background:"#111827",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"28px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,fontSize:20,fontWeight:800,marginBottom:6,fontFamily:"'Space Grotesk',sans-serif",color:"#f0f4ff"}}>
            <Shield size={26} color="#4f8ef7" />
            AviPesa <span style={{color:"#4f8ef7"}}>Admin</span>
          </div>
          <div style={{fontSize:12,color:"#6b7a99",marginBottom:20,fontFamily:"'Space Grotesk',sans-serif"}}>Restricted access — authorised personnel only</div>
          {loginErr && <div style={{background:"rgba(255,77,109,0.1)",border:"1px solid rgba(255,77,109,0.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#ff4d6d",marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>{loginErr}</div>}
          <input
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:14,outline:"none",marginBottom:10,boxSizing:"border-box"}}
            type="password"
            placeholder="Admin secret key"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />
          <button style={{width:"100%",padding:13,borderRadius:9,border:"none",background:"#4f8ef7",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,cursor:"pointer"}} onClick={login}>
            Enter Dashboard
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview",     icon: <BarChart2 size={15}/>,   label: "Overview"     },
    { id: "live",         icon: <Activity size={15}/>,    label: "Live"         },
    { id: "users",        icon: <Users size={15}/>,       label: "Users"        },
    { id: "transactions", icon: <DollarSign size={15}/>,  label: "Transactions" },
    { id: "rounds",       icon: <Zap size={15}/>,         label: "Rounds"       },
    { id: "reports",      icon: <TrendingUp size={15}/>,  label: "Reports"      },
    { id: "gamecontrol",  icon: <Shield size={15}/>,      label: "Game"         },
    { id: "risk",         icon: <Activity size={15}/>,    label: "Risk"         },
    { id: "comms",        icon: <Users size={15}/>,       label: "Comms"        },
  ];

  const revenueDaysRef = useRef(7);
  const fetchReports = useCallback(async () => {
    setLoading(true);
    const [daily, rev, deps, wins] = await Promise.all([
      authFetch("/admin/reports/daily"),
      authFetch(`/admin/reports/revenue?days=${revenueDaysRef.current}`),
      authFetch("/admin/reports/topdepositors"),
      authFetch("/admin/reports/topwinners"),
    ]);
    if (daily) setDailyReport(daily);
    if (rev) setRevenueData(rev);
    if (deps) setTopDepositors(deps);
    if (wins) setTopWinners(wins);
    setLoading(false);
  }, [authFetch]);

  const fetchGameConfig = useCallback(async () => {
    const d = await authFetch("/admin/game/config");
    if (d) { setGameConfig(d); setMinBetInput(String(d.minBet)); setMaxBetInput(String(d.maxBet)); setBannerInput(d.bannerMsg||""); }
  }, [authFetch]);

  const fetchRisk = useCallback(async () => {
    setLoading(true);
    const [sus, lwd] = await Promise.all([authFetch("/admin/risk/suspicious"), authFetch("/admin/risk/largewithdrawals")]);
    if (sus) setSuspicious(sus);
    if (lwd) setLargeWds(lwd);
    setLoading(false);
  }, [authFetch]);

  const togglePause = async () => {
    const d = await authFetch("/admin/game/pause", { method: "POST", body: JSON.stringify({ paused: !gameConfig.paused }) });
    if (d?.ok) setGameConfig(p => ({ ...p, paused: d.paused }));
  };

  const saveLimits = async () => {
    const d = await authFetch("/admin/game/limits", { method: "POST", body: JSON.stringify({ minBet: minBetInput, maxBet: maxBetInput }) });
    if (d?.ok) { setGameConfig(d.config); setActionMsg("Bet limits updated"); setTimeout(() => setActionMsg(""), 2000); }
  };

  const saveBanner = async () => {
    const d = await authFetch("/admin/game/banner", { method: "POST", body: JSON.stringify({ message: bannerInput }) });
    if (d?.ok) { setActionMsg("Banner updated"); setTimeout(() => setActionMsg(""), 2000); }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    const d = await authFetch("/admin/broadcast", { method: "POST", body: JSON.stringify({ message: broadcastMsg }) });
    if (d?.ok) { setCommsResult("Broadcast sent to all users"); setBroadcastMsg(""); setTimeout(() => setCommsResult(""), 3000); }
  };

  const sendNotify = async () => {
    if (!notifyMsg.trim() || !notifyUserId.trim()) return;
    const d = await authFetch(`/admin/notify/${notifyUserId}`, { method: "POST", body: JSON.stringify({ message: notifyMsg }) });
    if (d?.ok) { setCommsResult(d.delivered ? "Message delivered (user online)" : "Saved (user offline)"); setNotifyMsg(""); setTimeout(() => setCommsResult(""), 3000); }
  };

  const refreshCurrent = () => {
    if (tab==="overview") { fetchOverview(); fetchGameStats(); }
    if (tab==="users") fetchUsers();
    if (tab==="transactions") fetchTxns();
    if (tab==="rounds") fetchRounds();
    if (tab==="live") fetchLive();
    if (tab==="reports") fetchReports();
    if (tab==="gamecontrol") fetchGameConfig();
    if (tab==="risk") fetchRisk();
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#06080e",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif"}}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:40}} />
      )}

      {/* Sidebar */}
      <aside style={{
        width:200,background:"#0c0f1a",borderRight:"1px solid rgba(255,255,255,0.06)",
        display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"16px 10px",
        flexShrink:0,
        position: window.innerWidth < 768 ? "fixed" : "relative",
        top:0,left:0,height:"100%",zIndex:50,
        transform: window.innerWidth < 768 ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "none",
        transition:"transform 0.25s ease",
      }}>
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 4px"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <Shield size={16} color="#4f8ef7"/>
              <span style={{fontSize:14,fontWeight:800}}>Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{background:"none",border:"none",color:"#6b7a99",cursor:"pointer",display: window.innerWidth < 768 ? "flex" : "none",alignItems:"center"}}>
              <X size={16}/>
            </button>
          </div>
          <nav style={{display:"flex",flexDirection:"column",gap:3}}>
            {TABS.map(t => (
              <button key={t.id}
                style={{display:"flex",alignItems:"center",gap:9,padding:"10px 10px",borderRadius:8,border:"none",background:tab===t.id?"rgba(79,142,247,0.1)":"transparent",color:tab===t.id?"#4f8ef7":"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left"}}
                onClick={() => switchTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={logout} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 10px",borderRadius:8,border:"1px solid rgba(255,77,109,0.2)",background:"transparent",color:"#ff4d6d",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>
          <LogOut size={13}/> Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>

        {/* Topbar */}
        <div style={{height:50,borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",background:"rgba(12,15,26,0.95)",flexShrink:0,gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={() => setSidebarOpen(true)} style={{background:"none",border:"none",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center",padding:4}}>
              <Menu size={18}/>
            </button>
            <span style={{fontSize:13,fontWeight:700}}>{TABS.find(t=>t.id===tab)?.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {loading && <RefreshCw size={13} style={{animation:"spin 1s linear infinite",color:"#4f8ef7"}}/>}
            <button onClick={refreshCurrent} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>
              <RefreshCw size={12}/> Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,padding:"14px",overflowY:"auto",overflowX:"hidden"}}>

          {/* OVERVIEW */}
          {tab === "overview" && overview && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginBottom:14}}>
                {[
                  {label:"Deposits",      val:fKES(overview.totalDeposits),    color:"#00e676", icon:<ArrowDownCircle size={14}/>},
                  {label:"Withdrawals",   val:fKES(overview.totalWithdrawals), color:"#ff4d6d", icon:<ArrowUpCircle size={14}/>},
                  {label:"Total Bets",    val:fKES(overview.totalBetsPlaced),  color:"#ffb703", icon:<Activity size={14}/>},
                  {label:"Wins Paid",     val:fKES(overview.totalWinsPaid),    color:"#c77dff", icon:<Award size={14}/>},
                  {label:"House Profit",  val:fKES(overview.houseProfit),      color:overview.houseProfit>=0?"#00e676":"#ff4d6d", icon:<TrendingUp size={14}/>},
                  {label:"Total Users",   val:fNum(overview.totalUsers),       color:"#4f8ef7", icon:<Users size={14}/>},
                  {label:"Total Rounds",  val:fNum(overview.totalRounds),      color:"#ffb703", icon:<Zap size={14}/>},
                  {label:"Today Deposits",val:fKES(overview.depositsToday),    color:"#00e676", icon:<DollarSign size={14}/>},
                  {label:"New Users Today",val:fNum(overview.newUsersToday),   color:"#4f8ef7", icon:<Users size={14}/>},
                ].map((s,i) => (
                  <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 12px 10px"}}>
                    <div style={{color:s.color,marginBottom:6}}>{s.icon}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:s.color,marginBottom:3,wordBreak:"break-all"}}>{s.val}</div>
                    <div style={{fontSize:9,color:"#6b7a99",fontWeight:500}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {gameStats && (
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8}}>Game Statistics</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
                    {[
                      {label:"Total Rounds", val:fNum(gameStats.total_rounds)},
                      {label:"Avg Crash",    val:`${Number(gameStats.avg_crash||0).toFixed(2)}×`},
                      {label:"Max Crash",    val:`${Number(gameStats.max_crash||0).toFixed(2)}×`},
                      {label:"Under 2×",     val:fNum(gameStats.under_2x)},
                      {label:"2× – 5×",      val:fNum(gameStats.btw_2_5x)},
                      {label:"Over 10×",     val:fNum(gameStats.over_10x)},
                    ].map((s,i) => (
                      <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"10px 12px"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,marginBottom:3}}>{s.val}</div>
                        <div style={{fontSize:9,color:"#6b7a99"}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIVE */}
          {tab === "live" && liveData && (
            <div>
              <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"14px",marginBottom:14,display:"flex",flexWrap:"wrap",alignItems:"center",gap:12}}>
                <span style={{fontSize:10,fontWeight:700,color:"#00e676"}}>● LIVE</span>
                <span style={{fontSize:12,fontWeight:700,color:"#6b7a99"}}>{liveData.state?.toUpperCase()}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:700}}>{Number(liveData.multiplier||1).toFixed(2)}×</span>
                <span style={{fontSize:10,color:"#6b7a99",marginLeft:"auto"}}>Round #{liveData.roundId} · Crash@{Number(liveData.crashPoint||0).toFixed(2)}×</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8}}>Active Bets ({liveData.activeBets?.length||0})</div>
              <div style={{overflowX:"auto"}}>
                {(liveData.activeBets||[]).map((b,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#111827",borderRadius:8,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,fontWeight:600,flex:1,minWidth:80}}>{b.name}</span>
                    <span style={{fontSize:11,color:"#ffb703",fontFamily:"monospace"}}>{fKES(b.amount)}</span>
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700,background:b.cashedOut?"rgba(0,230,118,0.1)":"rgba(255,183,3,0.1)",color:b.cashedOut?"#00e676":"#ffb703"}}>{b.cashedOut?"Cashed":"Active"}</span>
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700,background:b.isBot?"rgba(79,142,247,0.1)":"rgba(199,125,255,0.1)",color:b.isBot?"#4f8ef7":"#c77dff"}}>{b.isBot?"Bot":"Real"}</span>
                  </div>
                ))}
                {(!liveData.activeBets||liveData.activeBets.length===0) && <div style={{textAlign:"center",padding:24,color:"#6b7a99",fontSize:12}}>No active bets</div>}
              </div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",margin:"14px 0 8px"}}>History</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {(liveData.history||[]).map((v,i) => (
                  <span key={i} style={{padding:"3px 8px",borderRadius:4,fontFamily:"monospace",fontSize:11,fontWeight:700,background:v<2?"rgba(79,142,247,0.15)":v>=10?"rgba(199,125,255,0.15)":"rgba(107,122,153,0.15)",color:v<2?"#6fa6f8":v>=10?"#c77dff":"#8a9ab8"}}>{Number(v).toFixed(2)}×</span>
                ))}
              </div>
            </div>
          )}

          {/* USERS LIST */}
          {tab === "users" && !selectedUser && (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                <div style={{position:"relative",flex:1,minWidth:160}}>
                  <Search size={12} style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#6b7a99"}}/>
                  <input
                    style={{width:"100%",background:"#111827",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 10px 8px 28px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,outline:"none",boxSizing:"border-box"}}
                    placeholder="Search name or phone..."
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  />
                </div>
                <span style={{fontSize:10,color:"#6b7a99",whiteSpace:"nowrap"}}>{userTotal} users</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {users.map((u,i) => (
                  <div key={u.id} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"12px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:700}}>{u.first_name} {u.last_name}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700,background:u.banned?"rgba(255,77,109,0.1)":"rgba(0,230,118,0.1)",color:u.banned?"#ff4d6d":"#00e676"}}>{u.banned?"Banned":"Active"}</span>
                        <button onClick={() => fetchUserDetail(u.id)} style={{padding:"4px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"}}>
                          <Eye size={12}/>
                        </button>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                      <div>
                        <div style={{fontSize:9,color:"#6b7a99",marginBottom:2}}>Phone</div>
                        <div style={{fontSize:11,fontFamily:"monospace"}}>{u.phone}</div>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:"#6b7a99",marginBottom:2}}>Balance</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#00e676"}}>{fKES(u.balance)}</div>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:"#6b7a99",marginBottom:2}}>Bets</div>
                        <div style={{fontSize:11}}>{fNum(u.total_bets)}</div>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:"#6b7a99",marginBottom:2}}>Joined</div>
                        <div style={{fontSize:10,color:"#6b7a99"}}>{fDate(u.created_at)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length===0 && <div style={{textAlign:"center",padding:24,color:"#6b7a99",fontSize:12}}>No users found</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginTop:14}}>
                <button style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"}} disabled={userPage===1} onClick={() => setUserPage(p=>p-1)}><ChevronLeft size={13}/></button>
                <span style={{fontSize:12,color:"#6b7a99"}}>Page {userPage} of {Math.ceil(userTotal/20)||1}</span>
                <button style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"}} disabled={userPage*20>=userTotal} onClick={() => setUserPage(p=>p+1)}><ChevronRight size={13}/></button>
              </div>
            </div>
          )}

          {/* USER DETAIL */}
          {tab === "users" && selectedUser && (
            <div>
              <button onClick={() => setSelectedUser(null)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,cursor:"pointer",marginBottom:14}}>
                <ChevronLeft size={13}/> Back
              </button>
              {actionMsg && <div style={{background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#00e676",marginBottom:12}}>{actionMsg}</div>}

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10,marginBottom:14}}>
                <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:10}}>Account Info</div>
                  {[
                    ["Name",    `${selectedUser.user.first_name} ${selectedUser.user.last_name}`],
                    ["Phone",   selectedUser.user.phone],
                    ["Balance", fKES(selectedUser.user.balance)],
                    ["Status",  selectedUser.user.banned?"BANNED":"Active"],
                    ["Joined",  fDate(selectedUser.user.created_at)],
                  ].map(([k,v]) => (
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <span style={{color:"#6b7a99"}}>{k}</span>
                      <span style={{fontWeight:600,color:k==="Balance"?"#00e676":k==="Status"&&selectedUser.user.banned?"#ff4d6d":"inherit"}}>{v}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => banUser(selectedUser.user.id, !selectedUser.user.banned)}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:8,fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:12,background:selectedUser.user.banned?"rgba(0,230,118,0.1)":"rgba(255,77,109,0.1)",color:selectedUser.user.banned?"#00e676":"#ff4d6d",border:`1px solid ${selectedUser.user.banned?"rgba(0,230,118,0.3)":"rgba(255,77,109,0.3)"}`}}>
                    {selectedUser.user.banned ? <><CheckCircle size={12}/> Unban User</> : <><Ban size={12}/> Ban User</>}
                  </button>
                </div>
                <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:10}}>Adjust Balance</div>
                  <input style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}} type="number" min="0" placeholder="Amount (positive number)" value={adjustAmt} onChange={e => setAdjustAmt(e.target.value)}/>
                  <input style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}} placeholder="Note (optional)" value={adjustNote} onChange={e => setAdjustNote(e.target.value)}/>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={() => adjustBalance(selectedUser.user.id, "add")} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 14px",borderRadius:8,fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(0,230,118,0.1)",color:"#00e676",border:"1px solid rgba(0,230,118,0.3)"}}>
                      + Add
                    </button>
                    <button onClick={() => adjustBalance(selectedUser.user.id, "deduct")} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 14px",borderRadius:8,fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(255,77,109,0.1)",color:"#ff4d6d",border:"1px solid rgba(255,77,109,0.3)"}}>
                      - Deduct
                    </button>
                  </div>
                </div>
              </div>

              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8}}>Recent Transactions</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:16}}>
                {(selectedUser.transactions||[]).slice(0,15).map((t,i) => (
                  <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:600}}>{t.label}</div>
                      <div style={{fontSize:9,color:"#6b7a99",marginTop:2}}>{fDate(t.created_at)} {fTime(t.created_at)}</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:parseFloat(t.amount)>=0?"#00e676":"#ff4d6d"}}>{parseFloat(t.amount)>=0?"+":""}{fKES(Math.abs(t.amount))}</span>
                  </div>
                ))}
              </div>

              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8}}>Recent Bets</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {(selectedUser.bets||[]).slice(0,15).map((b,i) => (
                  <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:600}}>Round #{b.round_id}</div>
                      <div style={{fontSize:10,color:"#6b7a99",marginTop:2}}>Bet: {fKES(b.amount)} · Crash@{b.crash_point}×</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700,background:b.cashed_out?"rgba(0,230,118,0.1)":"rgba(255,77,109,0.1)",color:b.cashed_out?"#00e676":"#ff4d6d"}}>{b.cashed_out?"Won":"Lost"}</span>
                      {b.payout>0 && <div style={{fontSize:11,color:"#00e676",marginTop:3}}>{fKES(b.payout)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSACTIONS */}
          {tab === "transactions" && (
            <div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {[["","All"],["dep","Deposits"],["win","Wins"],["wd","Withdrawals"],["bet","Bets"]].map(([k,l]) => (
                  <button key={k} onClick={() => { setTxnType(k); setTxnPage(1); }} style={{padding:"5px 11px",borderRadius:16,border:"1px solid rgba(255,255,255,0.08)",background:txnType===k?"rgba(79,142,247,0.1)":"transparent",color:txnType===k?"#4f8ef7":"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",borderColor:txnType===k?"rgba(79,142,247,0.3)":"rgba(255,255,255,0.08)"}}>{l}</button>
                ))}
                <span style={{fontSize:10,color:"#6b7a99",alignSelf:"center",marginLeft:"auto"}}>{txnTotal} records</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {txns.map((t,i) => (
                  <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"11px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:600}}>{t.first_name} {t.last_name}</span>
                      <span style={{fontSize:12,fontWeight:700,color:parseFloat(t.amount)>=0?"#00e676":"#ff4d6d"}}>{parseFloat(t.amount)>=0?"+":""}{fKES(Math.abs(t.amount))}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,fontWeight:700,background:t.type==="dep"?"rgba(0,230,118,0.1)":t.type==="win"?"rgba(255,183,3,0.1)":t.type==="wd"?"rgba(79,142,247,0.1)":"rgba(255,77,109,0.1)",color:t.type==="dep"?"#00e676":t.type==="win"?"#ffb703":t.type==="wd"?"#4f8ef7":"#ff4d6d"}}>{t.type}</span>
                      {t.status && t.status!=="success" && <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,fontWeight:700,background:t.status==="pending"?"rgba(255,183,3,0.1)":"rgba(255,77,109,0.1)",color:t.status==="pending"?"#ffb703":"#ff4d6d"}}>{t.status}</span>}
                      {(!t.status||t.status==="success") && t.type==="dep" && <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,fontWeight:700,background:"rgba(0,230,118,0.1)",color:"#00e676"}}>✓ paid</span>}
                      <span style={{fontSize:10,color:"#6b7a99",flex:1}}>{t.label}</span>
                      <span style={{fontSize:9,color:"#6b7a99",fontFamily:"monospace"}}>{fDate(t.created_at)}</span>
                    </div>
                  </div>
                ))}
                {txns.length===0 && <div style={{textAlign:"center",padding:24,color:"#6b7a99",fontSize:12}}>No transactions</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginTop:14}}>
                <button style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"}} disabled={txnPage===1} onClick={() => setTxnPage(p=>p-1)}><ChevronLeft size={13}/></button>
                <span style={{fontSize:12,color:"#6b7a99"}}>Page {txnPage} of {Math.ceil(txnTotal/30)||1}</span>
                <button style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"}} disabled={txnPage*30>=txnTotal} onClick={() => setTxnPage(p=>p+1)}><ChevronRight size={13}/></button>
              </div>
            </div>
          )}

          {/* ROUNDS */}
          {tab === "rounds" && (
            <div>
              <div style={{fontSize:10,color:"#6b7a99",marginBottom:10}}>{roundTotal} rounds played</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {rounds.map((r,i) => {
                  const edge = parseFloat(r.total_wagered||0) - parseFloat(r.total_paid||0);
                  return (
                    <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"11px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:11,fontFamily:"monospace",color:"#6b7a99"}}>#{r.id}</span>
                        <span style={{fontSize:16,fontWeight:700,fontFamily:"monospace",color:r.crash_point<2?"#6fa6f8":r.crash_point>=10?"#c77dff":"#8a9ab8"}}>{Number(r.crash_point).toFixed(2)}×</span>
                        <span style={{fontSize:12,fontWeight:700,color:edge>=0?"#00e676":"#ff4d6d"}}>{fKES(edge)}</span>
                      </div>
                      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                        <div><span style={{fontSize:9,color:"#6b7a99"}}>Bets </span><span style={{fontSize:11}}>{r.bet_count}</span></div>
                        <div><span style={{fontSize:9,color:"#6b7a99"}}>Wagered </span><span style={{fontSize:11}}>{fKES(r.total_wagered)}</span></div>
                        <div><span style={{fontSize:9,color:"#6b7a99"}}>Paid </span><span style={{fontSize:11,color:"#ff4d6d"}}>{fKES(r.total_paid)}</span></div>
                        <div><span style={{fontSize:9,color:"#6b7a99"}}>{fDate(r.created_at)}</span></div>
                      </div>
                    </div>
                  );
                })}
                {rounds.length===0 && <div style={{textAlign:"center",padding:24,color:"#6b7a99",fontSize:12}}>No rounds yet</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginTop:14}}>
                <button style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"}} disabled={roundPage===1} onClick={() => setRoundPage(p=>p-1)}><ChevronLeft size={13}/></button>
                <span style={{fontSize:12,color:"#6b7a99"}}>Page {roundPage} of {Math.ceil(roundTotal/30)||1}</span>
                <button style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"}} disabled={roundPage*30>=roundTotal} onClick={() => setRoundPage(p=>p+1)}><ChevronRight size={13}/></button>
              </div>
            </div>
          )}


          {/* REPORTS */}
          {tab === "reports" && (
            <div>
              {dailyReport && (
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8}}>Today vs Yesterday</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginBottom:14}}>
                    {[
                      {label:"Deposits Today", val:fKES(dailyReport.today.deposits), sub:`vs ${fKES(dailyReport.yesterday.deposits)}`, color:"#00e676"},
                      {label:"Profit Today", val:fKES(dailyReport.today.profit), sub:`vs ${fKES(dailyReport.yesterday.profit)}`, color:dailyReport.today.profit>=0?"#00e676":"#ff4d6d"},
                      {label:"Bets Today", val:fKES(dailyReport.today.bets), sub:`${fNum(dailyReport.today.betCount)} bets`, color:"#ffb703"},
                      {label:"New Users", val:fNum(dailyReport.today.newUsers), sub:"today", color:"#4f8ef7"},
                      {label:"Active Players", val:fNum(dailyReport.today.activeUsers), sub:"today", color:"#c77dff"},
                      {label:"Rounds Today", val:fNum(dailyReport.today.rounds), sub:"played", color:"#ffb703"},
                    ].map((s,i) => (
                      <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"12px"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:s.color,marginBottom:3}}>{s.val}</div>
                        <div style={{fontSize:9,color:"#6b7a99",marginBottom:2}}>{s.label}</div>
                        <div style={{fontSize:9,color:"#4f4f6f"}}>{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    Revenue Chart
                    <div style={{display:"flex",gap:4}}>
                      {[7,14,30].map(d => (
                        <button key={d} onClick={() => { setRevenueDays(d); revenueDaysRef.current = d; fetchReports(); }} style={{padding:"2px 8px",borderRadius:4,border:"1px solid rgba(255,255,255,0.08)",background:revenueDays===d?"rgba(79,142,247,0.1)":"transparent",color:revenueDays===d?"#4f8ef7":"#6b7a99",fontSize:10,cursor:"pointer"}}>{d}d</button>
                      ))}
                    </div>
                  </div>
                  <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14,marginBottom:14,overflowX:"auto"}}>
                    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:100,minWidth:revenueData.length*36}}>
                      {revenueData.map((d,i) => {
                        const maxVal = Math.max(...revenueData.map(r => Math.max(r.profit, r.deposits)), 1);
                        return (
                          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:32}}>
                            <div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:80}}>
                              <div style={{flex:1,background:"rgba(79,142,247,0.6)",borderRadius:"3px 3px 0 0",height:`${(d.deposits/maxVal)*100}%`,minHeight:2}} title={`Deposits: ${fKES(d.deposits)}`}/>
                              <div style={{flex:1,background:d.profit>=0?"rgba(0,230,118,0.6)":"rgba(255,77,109,0.6)",borderRadius:"3px 3px 0 0",height:`${(Math.abs(d.profit)/maxVal)*100}%`,minHeight:2}} title={`Profit: ${fKES(d.profit)}`}/>
                            </div>
                            <div style={{fontSize:8,color:"#6b7a99",textAlign:"center"}}>{d.date.slice(5)}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",gap:12,marginTop:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#6b7a99"}}><div style={{width:8,height:8,background:"rgba(79,142,247,0.6)",borderRadius:2}}/> Deposits</div>
                      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#6b7a99"}}><div style={{width:8,height:8,background:"rgba(0,230,118,0.6)",borderRadius:2}}/> Profit</div>
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#6b7a99",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.8px"}}>Top Depositors</div>
                      {topDepositors.map((u,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                          <span style={{color:"#f0f4ff"}}>{u.first_name} {u.last_name?.[0]}***</span>
                          <span style={{color:"#00e676",fontFamily:"monospace"}}>{fKES(u.total_deposited)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#6b7a99",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.8px"}}>Top Winners</div>
                      {topWinners.map((u,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                          <span style={{color:"#f0f4ff"}}>{u.first_name} {u.last_name?.[0]}***</span>
                          <span style={{color:"#ffb703",fontFamily:"monospace"}}>{fKES(u.total_profit)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {!dailyReport && <div style={{textAlign:"center",padding:24,color:"#6b7a99",fontSize:12}}>Loading reports...</div>}
            </div>
          )}

          {/* GAME CONTROLS */}
          {tab === "gamecontrol" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {actionMsg && <div style={{background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#00e676"}}>{actionMsg}</div>}
              <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:12}}>Game Status</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:gameConfig.paused?"#ff4d6d":"#00e676"}}>{gameConfig.paused ? "⏸ PAUSED" : "▶ RUNNING"}</div>
                    <div style={{fontSize:10,color:"#6b7a99",marginTop:2}}>Game is currently {gameConfig.paused?"paused — no new rounds":"active"}</div>
                  </div>
                  <button onClick={togglePause} style={{padding:"9px 18px",borderRadius:8,border:"none",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",background:gameConfig.paused?"rgba(0,230,118,0.15)":"rgba(255,77,109,0.15)",color:gameConfig.paused?"#00e676":"#ff4d6d"}}>
                    {gameConfig.paused ? "Resume Game" : "Pause Game"}
                  </button>
                </div>
              </div>

              <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:12}}>Bet Limits</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div>
                    <div style={{fontSize:10,color:"#6b7a99",marginBottom:4}}>Min Bet (KES)</div>
                    <input style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box"}} type="number" value={minBetInput} onChange={e => setMinBetInput(e.target.value)}/>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#6b7a99",marginBottom:4}}>Max Bet (KES)</div>
                    <input style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",boxSizing:"border-box"}} type="number" value={maxBetInput} onChange={e => setMaxBetInput(e.target.value)}/>
                  </div>
                </div>
                <button onClick={saveLimits} style={{padding:"9px 16px",borderRadius:8,border:"1px solid rgba(79,142,247,0.3)",background:"rgba(79,142,247,0.1)",color:"#4f8ef7",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save Limits</button>
              </div>

              <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:12}}>Game Banner</div>
                <div style={{fontSize:10,color:"#6b7a99",marginBottom:6}}>Shows a banner message to all players on the game page</div>
                <input style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}} placeholder="e.g. Maintenance at 10pm tonight..." value={bannerInput} onChange={e => setBannerInput(e.target.value)}/>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={saveBanner} style={{padding:"9px 16px",borderRadius:8,border:"1px solid rgba(79,142,247,0.3)",background:"rgba(79,142,247,0.1)",color:"#4f8ef7",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>Set Banner</button>
                  <button onClick={() => { setBannerInput(""); saveBanner(); }} style={{padding:"9px 16px",borderRadius:8,border:"1px solid rgba(255,77,109,0.3)",background:"rgba(255,77,109,0.1)",color:"#ff4d6d",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>Clear</button>
                </div>
              </div>
            </div>
          )}

          {/* RISK */}
          {tab === "risk" && (
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8}}>Suspicious Activity (High Win Rate)</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
                {suspicious.map((u,i) => (
                  <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"11px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:700}}>{u.first_name} {u.last_name}</span>
                      <span style={{fontSize:12,fontWeight:700,color:parseFloat(u.win_rate)>70?"#ff4d6d":parseFloat(u.win_rate)>50?"#ffb703":"#00e676"}}>{u.win_rate}% wins</span>
                    </div>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      <div><span style={{fontSize:9,color:"#6b7a99"}}>Bets </span><span style={{fontSize:11}}>{u.total_bets}</span></div>
                      <div><span style={{fontSize:9,color:"#6b7a99"}}>Avg cashout </span><span style={{fontSize:11}}>{Number(u.avg_cashout).toFixed(2)}×</span></div>
                      <div><span style={{fontSize:9,color:"#6b7a99"}}>Best </span><span style={{fontSize:11}}>{Number(u.max_cashout).toFixed(2)}×</span></div>
                      <div><span style={{fontSize:9,color:"#6b7a99"}}>Profit </span><span style={{fontSize:11,color:"#00e676"}}>{fKES(u.total_profit)}</span></div>
                      <div><span style={{fontSize:9,color:"#6b7a99"}}>Phone </span><span style={{fontSize:10,fontFamily:"monospace"}}>{u.phone}</span></div>
                    </div>
                  </div>
                ))}
                {suspicious.length===0 && <div style={{textAlign:"center",padding:24,color:"#6b7a99",fontSize:12}}>No suspicious activity detected</div>}
              </div>

              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:8}}>Large Withdrawals (KES 1,000+)</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {largeWds.map((t,i) => (
                  <div key={i} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.05)",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600}}>{t.first_name} {t.last_name}</div>
                      <div style={{fontSize:9,color:"#6b7a99",marginTop:2}}>{fDate(t.created_at)} · {t.phone}</div>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:"#ff4d6d"}}>{fKES(Math.abs(t.amount))}</span>
                  </div>
                ))}
                {largeWds.length===0 && <div style={{textAlign:"center",padding:24,color:"#6b7a99",fontSize:12}}>No large withdrawals</div>}
              </div>
            </div>
          )}

          {/* COMMS */}
          {tab === "comms" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {commsResult && <div style={{background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#00e676"}}>{commsResult}</div>}
              <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:4}}>Broadcast to All Users</div>
                <div style={{fontSize:10,color:"#6b7a99",marginBottom:10}}>Sends a popup notification to every connected player instantly</div>
                <textarea style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box",resize:"vertical",minHeight:80}} placeholder="e.g. Double winnings event starts in 1 hour!" value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}/>
                <button onClick={sendBroadcast} style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#4f8ef7",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>Send Broadcast</button>
              </div>

              <div style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:4}}>Notify Specific User</div>
                <div style={{fontSize:10,color:"#6b7a99",marginBottom:10}}>Send a private message to a specific user by their ID</div>
                <input style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}} type="number" placeholder="User ID (find in Users tab)" value={notifyUserId} onChange={e => setNotifyUserId(e.target.value)}/>
                <textarea style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box",resize:"vertical",minHeight:60}} placeholder="Your message..." value={notifyMsg} onChange={e => setNotifyMsg(e.target.value)}/>
                <button onClick={sendNotify} style={{padding:"9px 16px",borderRadius:8,border:"1px solid rgba(79,142,247,0.3)",background:"rgba(79,142,247,0.2)",color:"#4f8ef7",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>Send Message</button>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080e; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}