import { useState, useEffect, useCallback } from "react";
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

  const authFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    });
    if (res.status === 401 || res.status === 403) {
      setAuthed(false); localStorage.removeItem("avipesa_admin_token"); return null;
    }
    return res.json();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    authFetch("/admin/overview").then(d => { if (d && !d.error) setAuthed(true); });
  }, []);

  const login = async () => {
    setLoginErr("");
    try {
      const res = await fetch(`${API}/admin/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({secret}) });
      const data = await res.json();
      if (!res.ok) { setLoginErr(data.error || "Invalid secret"); return; }
      localStorage.setItem("avipesa_admin_token", data.token);
      setToken(data.token); setAuthed(true);
    } catch { setLoginErr("Network error"); }
  };

  const logout = () => { localStorage.removeItem("avipesa_admin_token"); setToken(""); setAuthed(false); };

  const fetchOverview = useCallback(async () => { setLoading(true); const d = await authFetch("/admin/overview"); if (d) setOverview(d); setLoading(false); }, [authFetch]);
  const fetchUsers = useCallback(async () => { setLoading(true); const d = await authFetch(`/admin/users?search=${userSearch}&page=${userPage}&limit=20`); if (d) { setUsers(d.users||[]); setUserTotal(d.total||0); } setLoading(false); }, [authFetch, userSearch, userPage]);
  const fetchTxns = useCallback(async () => { setLoading(true); const d = await authFetch(`/admin/transactions?type=${txnType}&page=${txnPage}&limit=30`); if (d) { setTxns(d.transactions||[]); setTxnTotal(d.total||0); } setLoading(false); }, [authFetch, txnType, txnPage]);
  const fetchRounds = useCallback(async () => { setLoading(true); const d = await authFetch(`/admin/rounds?page=${roundPage}&limit=30`); if (d) { setRounds(d.rounds||[]); setRoundTotal(d.total||0); } setLoading(false); }, [authFetch, roundPage]);
  const fetchLive = useCallback(async () => { const d = await authFetch("/admin/live"); if (d) setLiveData(d); }, [authFetch]);
  const fetchGameStats = useCallback(async () => { const d = await authFetch("/admin/gamestats"); if (d) setGameStats(d); }, [authFetch]);
  const fetchUserDetail = useCallback(async (id) => { const d = await authFetch(`/admin/users/${id}`); if (d) setSelectedUser(d); }, [authFetch]);

  useEffect(() => {
    if (!authed) return;
    if (tab==="overview") { fetchOverview(); fetchGameStats(); }
    if (tab==="users") fetchUsers();
    if (tab==="transactions") fetchTxns();
    if (tab==="rounds") fetchRounds();
    if (tab==="live") fetchLive();
  }, [authed, tab]);

  useEffect(() => { if (authed && tab==="users") fetchUsers(); }, [userPage, userSearch]);
  useEffect(() => { if (authed && tab==="transactions") fetchTxns(); }, [txnPage, txnType]);
  useEffect(() => { if (authed && tab==="rounds") fetchRounds(); }, [roundPage]);

  useEffect(() => {
    if (!authed || tab!=="live") return;
    const t = setInterval(fetchLive, 3000);
    return () => clearInterval(t);
  }, [authed, tab, fetchLive]);

  const banUser = async (id, banned) => {
    const d = await authFetch(`/admin/users/${id}/ban`, { method:"POST", body:JSON.stringify({banned}) });
    if (d?.ok) { setActionMsg(banned?"User banned":"User unbanned"); fetchUserDetail(id); setTimeout(()=>setActionMsg(""),2500); }
  };

  const adjustBalance = async (id) => {
    const amt = parseFloat(adjustAmt);
    if (isNaN(amt)) return;
    const d = await authFetch(`/admin/users/${id}/balance`, { method:"POST", body:JSON.stringify({amount:amt, note:adjustNote||"Admin adjustment"}) });
    if (d?.ok) { setActionMsg(`Balance adjusted by ${fKES(amt)}`); setAdjustAmt(""); setAdjustNote(""); fetchUserDetail(id); setTimeout(()=>setActionMsg(""),2500); }
  };

  const switchTab = (t) => { setTab(t); setSelectedUser(null); setSidebarOpen(false); };

  const refreshCurrent = () => {
    if (tab==="overview") { fetchOverview(); fetchGameStats(); }
    if (tab==="users") fetchUsers();
    if (tab==="transactions") fetchTxns();
    if (tab==="rounds") fetchRounds();
    if (tab==="live") fetchLive();
  };

  if (!authed) {
    return (
      <div style={S.loginWrap}>
        <div style={S.loginBox}>
          <div style={S.loginLogo}><Shield size={28} color="#4f8ef7"/><span>AviPesa <b style={{color:"#4f8ef7"}}>Admin</b></span></div>
          <div style={S.loginSub}>Restricted access — authorised personnel only</div>
          {loginErr && <div style={S.errBox}>{loginErr}</div>}
          <input style={S.input} type="password" placeholder="Admin secret key" value={secret} onChange={e=>setSecret(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>
          <button style={S.loginBtn} onClick={login}>Enter Dashboard</button>
        </div>
      </div>
    );
  }

  const TABS = [
    {id:"overview",  icon:<BarChart2 size={13}/>,  label:"Overview"},
    {id:"live",      icon:<Activity size={13}/>,   label:"Live"},
    {id:"users",     icon:<Users size={13}/>,      label:"Users"},
    {id:"transactions",icon:<DollarSign size={13}/>,label:"Transactions"},
    {id:"rounds",    icon:<Zap size={13}/>,        label:"Rounds"},
  ];

  return (
    <div style={S.root}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06080e}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @media(max-width:700px){
          .admin-sidebar{position:fixed!important;top:0;left:0;height:100%!important;z-index:200;transform:translateX(-110%);transition:transform 0.25s ease}
          .admin-sidebar.open{transform:translateX(0)!important}
          .admin-overlay{display:block!important}
          .admin-hamburger{display:flex!important}
          .admin-content{padding:12px 10px!important}
        }
      `}</style>

      {/* Mobile overlay */}
      <div className="admin-overlay" onClick={()=>setSidebarOpen(false)} style={{display:"none",position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:199}}/>

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen?" open":""}`} style={S.sidebar}>
        <div style={S.sideTop}>
          <div style={{...S.sideLogoRow, justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Shield size={18} color="#4f8ef7"/>
              <span style={S.sideLogo}>Admin</span>
            </div>
            <button onClick={()=>setSidebarOpen(false)} style={{background:"none",border:"none",color:"#6b7a99",cursor:"pointer",padding:2}}>
              <X size={15}/>
            </button>
          </div>
          <nav style={S.nav}>
            {TABS.map(t=>(
              <button key={t.id} style={{...S.navBtn,...(tab===t.id?S.navBtnOn:{})}} onClick={()=>switchTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
        <button style={S.logoutBtn} onClick={logout}><LogOut size={13}/> Sign Out</button>
      </aside>

      {/* Main */}
      <main style={S.main}>
        <div style={S.topbar}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button className="admin-hamburger" onClick={()=>setSidebarOpen(true)} style={{display:"none",alignItems:"center",justifyContent:"center",background:"none",border:"none",color:"#6b7a99",cursor:"pointer",padding:4,marginRight:4}}>
              <Menu size={18}/>
            </button>
            <div style={S.topTitle}>{TABS.find(t=>t.id===tab)?.label}</div>
          </div>
          <div style={S.topRight}>
            {loading && <RefreshCw size={13} style={{animation:"spin 1s linear infinite",color:"#4f8ef7"}}/>}
            <button style={S.refreshBtn} onClick={refreshCurrent}><RefreshCw size={13}/> Refresh</button>
          </div>
        </div>

        <div className="admin-content" style={S.content}>

          {/* OVERVIEW */}
          {tab==="overview" && overview && (
            <div>
              <div style={S.statGrid}>
                {[
                  {label:"Total Deposits",    val:fKES(overview.totalDeposits),    icon:<ArrowDownCircle size={16}/>, color:"#00e676"},
                  {label:"Total Withdrawals", val:fKES(overview.totalWithdrawals), icon:<ArrowUpCircle size={16}/>,   color:"#ff4d6d"},
                  {label:"Total Bets",        val:fKES(overview.totalBetsPlaced),  icon:<Activity size={16}/>,        color:"#ffb703"},
                  {label:"Total Wins Paid",   val:fKES(overview.totalWinsPaid),    icon:<Award size={16}/>,           color:"#c77dff"},
                  {label:"House Profit",      val:fKES(overview.houseProfit),      icon:<TrendingUp size={16}/>,      color:overview.houseProfit>=0?"#00e676":"#ff4d6d"},
                  {label:"Total Users",       val:fNum(overview.totalUsers),       icon:<Users size={16}/>,           color:"#4f8ef7"},
                  {label:"Total Rounds",      val:fNum(overview.totalRounds),      icon:<Zap size={16}/>,             color:"#ffb703"},
                  {label:"Deposits Today",    val:fKES(overview.depositsToday),    icon:<DollarSign size={16}/>,      color:"#00e676"},
                  {label:"New Users Today",   val:fNum(overview.newUsersToday),    icon:<Users size={16}/>,           color:"#4f8ef7"},
                ].map((s,i)=>(
                  <div key={i} style={S.statCard}>
                    <div style={{...S.statIcon,color:s.color}}>{s.icon}</div>
                    <div style={{...S.statVal,color:s.color}}>{s.val}</div>
                    <div style={S.statLbl}>{s.label}</div>
                  </div>
                ))}
              </div>
              {gameStats && (
                <div style={S.section}>
                  <div style={S.sectionTitle}>Game Statistics</div>
                  <div style={S.statGrid}>
                    {[
                      {label:"Total Rounds", val:fNum(gameStats.total_rounds)},
                      {label:"Avg Crash",    val:`${Number(gameStats.avg_crash||0).toFixed(2)}×`},
                      {label:"Max Crash",    val:`${Number(gameStats.max_crash||0).toFixed(2)}×`},
                      {label:"Min Crash",    val:`${Number(gameStats.min_crash||0).toFixed(2)}×`},
                      {label:"Under 2×",     val:fNum(gameStats.under_2x)},
                      {label:"2× – 5×",      val:fNum(gameStats.btw_2_5x)},
                      {label:"5× – 10×",     val:fNum(gameStats.btw_5_10x)},
                      {label:"Over 10×",     val:fNum(gameStats.over_10x)},
                    ].map((s,i)=>(
                      <div key={i} style={S.statCard}>
                        <div style={{...S.statVal,fontSize:18}}>{s.val}</div>
                        <div style={S.statLbl}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIVE */}
          {tab==="live" && liveData && (
            <div>
              <div style={{...S.liveHeader,flexWrap:"wrap"}}>
                <div style={S.liveBadge}>● LIVE</div>
                <div style={S.liveState}>{liveData.state?.toUpperCase()}</div>
                <div style={S.liveMult}>{Number(liveData.multiplier||1).toFixed(2)}×</div>
                <div style={{...S.liveInfo,marginLeft:"auto",fontSize:10}}>Round #{liveData.roundId} · Crash@{Number(liveData.crashPoint||0).toFixed(2)}×</div>
              </div>
              <div style={S.sectionTitle}>Active Bets ({liveData.activeBets?.length||0})</div>
              <div style={{overflowX:"auto"}}>
                <div style={{...S.table,minWidth:400}}>
                  <div style={S.thead}>
                    <div style={S.th}>Player</div>
                    <div style={S.th}>Bet</div>
                    <div style={S.th}>Status</div>
                    <div style={S.th}>Mult</div>
                    <div style={S.th}>Type</div>
                  </div>
                  {(liveData.activeBets||[]).map((b,i)=>(
                    <div key={i} style={S.trow}>
                      <div style={S.td}>{b.name}</div>
                      <div style={S.td}>{fKES(b.amount)}</div>
                      <div style={S.td}><span style={{...S.badge,...(b.cashedOut?S.badgeGreen:S.badgeAmber)}}>{b.cashedOut?"Cashed":"Active"}</span></div>
                      <div style={S.td}>{b.cashMult?`${b.cashMult}×`:"—"}</div>
                      <div style={S.td}><span style={{...S.badge,...(b.isBot?S.badgeBlue:S.badgePurple)}}>{b.isBot?"Bot":"Real"}</span></div>
                    </div>
                  ))}
                  {(!liveData.activeBets||liveData.activeBets.length===0) && <div style={S.noData}>No active bets</div>}
                </div>
              </div>
              <div style={{...S.sectionTitle,marginTop:16}}>Recent History</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
                {(liveData.history||[]).map((v,i)=>(
                  <span key={i} style={{padding:"3px 8px",borderRadius:5,fontFamily:"monospace",fontSize:11,fontWeight:700,background:v<2?"rgba(79,142,247,0.15)":v>=10?"rgba(199,125,255,0.15)":"rgba(107,122,153,0.15)",color:v<2?"#6fa6f8":v>=10?"#c77dff":"#8a9ab8"}}>{Number(v).toFixed(2)}×</span>
                ))}
              </div>
            </div>
          )}

          {/* USERS LIST */}
          {tab==="users" && !selectedUser && (
            <div>
              <div style={S.filterRow}>
                <div style={{...S.searchWrap,maxWidth:"100%"}}>
                  <Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#6b7a99"}}/>
                  <input style={S.searchInput} placeholder="Search by name or phone..." value={userSearch} onChange={e=>{setUserSearch(e.target.value);setUserPage(1);}}/>
                </div>
                <div style={S.pageInfo}>{userTotal} users</div>
              </div>
              {/* Card layout on mobile, table on desktop */}
              <div style={{display:"none"}} className="mobile-cards">
                {users.map((u,i)=>(
                  <div key={u.id} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:12,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:13,fontWeight:700}}>{u.first_name} {u.last_name}</span>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{...S.badge,...(u.banned?S.badgeRed:S.badgeGreen)}}>{u.banned?"Banned":"Active"}</span>
                        <button style={S.iconBtn} onClick={()=>fetchUserDetail(u.id)}><Eye size={12}/></button>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      <div><div style={{fontSize:9,color:"#6b7a99"}}>Phone</div><div style={{fontSize:11,fontFamily:"monospace"}}>{u.phone}</div></div>
                      <div><div style={{fontSize:9,color:"#6b7a99"}}>Balance</div><div style={{fontSize:12,fontWeight:700,color:"#00e676"}}>{fKES(u.balance)}</div></div>
                      <div><div style={{fontSize:9,color:"#6b7a99"}}>Bets</div><div style={{fontSize:11}}>{fNum(u.total_bets)}</div></div>
                      <div><div style={{fontSize:9,color:"#6b7a99"}}>Joined</div><div style={{fontSize:10,color:"#6b7a99"}}>{fDate(u.created_at)}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{overflowX:"auto"}}>
                <div style={{...S.table,minWidth:500}}>
                  <div style={S.thead}>
                    <div style={S.th}>Name</div>
                    <div style={S.th}>Phone</div>
                    <div style={S.th}>Balance</div>
                    <div style={S.th}>Bets</div>
                    <div style={S.th}>Status</div>
                    <div style={S.th}>Joined</div>
                    <div style={S.th}>Action</div>
                  </div>
                  {users.map((u,i)=>(
                    <div key={u.id} style={{...S.trow,...(i%2===0?{}:{background:"rgba(255,255,255,0.01)"})}}>
                      <div style={S.td}>{u.first_name} {u.last_name}</div>
                      <div style={{...S.td,fontFamily:"monospace",fontSize:11}}>{u.phone}</div>
                      <div style={{...S.td,color:"#00e676",fontWeight:700}}>{fKES(u.balance)}</div>
                      <div style={S.td}>{fNum(u.total_bets)}</div>
                      <div style={S.td}><span style={{...S.badge,...(u.banned?S.badgeRed:S.badgeGreen)}}>{u.banned?"Banned":"Active"}</span></div>
                      <div style={{...S.td,fontSize:10,color:"#6b7a99"}}>{fDate(u.created_at)}</div>
                      <div style={S.td}><button style={S.iconBtn} onClick={()=>fetchUserDetail(u.id)}><Eye size={12}/></button></div>
                    </div>
                  ))}
                  {users.length===0 && <div style={S.noData}>No users found</div>}
                </div>
              </div>
              <div style={S.pagination}>
                <button style={S.pageBtn} disabled={userPage===1} onClick={()=>setUserPage(p=>p-1)}><ChevronLeft size={13}/></button>
                <span style={S.pageNum}>Page {userPage} of {Math.ceil(userTotal/20)||1}</span>
                <button style={S.pageBtn} disabled={userPage*20>=userTotal} onClick={()=>setUserPage(p=>p+1)}><ChevronRight size={13}/></button>
              </div>
            </div>
          )}

          {/* USER DETAIL */}
          {tab==="users" && selectedUser && (
            <div>
              <button style={S.backBtn} onClick={()=>setSelectedUser(null)}><ChevronLeft size={13}/> Back to Users</button>
              {actionMsg && <div style={S.okBox}>{actionMsg}</div>}
              <div style={{...S.detailGrid,gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))"}}>
                <div style={S.detailCard}>
                  <div style={S.detailTitle}>Account Info</div>
                  {[
                    ["Name",   `${selectedUser.user.first_name} ${selectedUser.user.last_name}`],
                    ["Phone",  selectedUser.user.phone],
                    ["Balance",fKES(selectedUser.user.balance)],
                    ["Status", selectedUser.user.banned?"BANNED":"Active"],
                    ["Joined", fDate(selectedUser.user.created_at)],
                  ].map(([k,v])=>(
                    <div key={k} style={S.detailRow}>
                      <span style={S.detailKey}>{k}</span>
                      <span style={{...S.detailVal,color:k==="Balance"?"#00e676":k==="Status"&&selectedUser.user.banned?"#ff4d6d":"inherit"}}>{v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:14}}>
                    <button style={{...S.actionBtn,background:selectedUser.user.banned?"rgba(0,230,118,0.1)":"rgba(255,77,109,0.1)",color:selectedUser.user.banned?"#00e676":"#ff4d6d",border:`1px solid ${selectedUser.user.banned?"rgba(0,230,118,0.3)":"rgba(255,77,109,0.3)"}`}} onClick={()=>banUser(selectedUser.user.id,!selectedUser.user.banned)}>
                      {selectedUser.user.banned?<><CheckCircle size={12}/> Unban User</>:<><Ban size={12}/> Ban User</>}
                    </button>
                  </div>
                </div>
                <div style={S.detailCard}>
                  <div style={S.detailTitle}>Adjust Balance</div>
                  <input style={{...S.input,marginBottom:8}} type="number" placeholder="Amount (negative to deduct)" value={adjustAmt} onChange={e=>setAdjustAmt(e.target.value)}/>
                  <input style={{...S.input,marginBottom:8}} placeholder="Note (optional)" value={adjustNote} onChange={e=>setAdjustNote(e.target.value)}/>
                  <button style={{...S.actionBtn,background:"rgba(79,142,247,0.1)",color:"#4f8ef7",border:"1px solid rgba(79,142,247,0.3)"}} onClick={()=>adjustBalance(selectedUser.user.id)}>
                    <DollarSign size={12}/> Apply Adjustment
                  </button>
                </div>
              </div>

              <div style={S.section}>
                <div style={S.sectionTitle}>Recent Transactions</div>
                <div style={{overflowX:"auto"}}>
                  <div style={{...S.table,minWidth:420}}>
                    <div style={S.thead}>
                      <div style={S.th}>Type</div><div style={S.th}>Label</div><div style={S.th}>Amount</div><div style={S.th}>Date</div>
                    </div>
                    {(selectedUser.transactions||[]).slice(0,20).map((t,i)=>(
                      <div key={i} style={S.trow}>
                        <div style={S.td}><span style={{...S.badge,...(t.type==="dep"?S.badgeGreen:t.type==="win"?S.badgeAmber:t.type==="wd"?S.badgeBlue:S.badgeRed)}}>{t.type}</span></div>
                        <div style={{...S.td,fontSize:11}}>{t.label}</div>
                        <div style={{...S.td,color:parseFloat(t.amount)>=0?"#00e676":"#ff4d6d",fontWeight:700}}>{parseFloat(t.amount)>=0?"+":""}{fKES(Math.abs(t.amount))}</div>
                        <div style={{...S.td,fontSize:10,color:"#6b7a99"}}>{fDate(t.created_at)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={S.section}>
                <div style={S.sectionTitle}>Recent Bets</div>
                <div style={{overflowX:"auto"}}>
                  <div style={{...S.table,minWidth:420}}>
                    <div style={S.thead}>
                      <div style={S.th}>Round</div><div style={S.th}>Amount</div><div style={S.th}>Result</div><div style={S.th}>Payout</div><div style={S.th}>Crash@</div>
                    </div>
                    {(selectedUser.bets||[]).slice(0,20).map((b,i)=>(
                      <div key={i} style={S.trow}>
                        <div style={{...S.td,fontFamily:"monospace",fontSize:11}}>#{b.round_id}</div>
                        <div style={S.td}>{fKES(b.amount)}</div>
                        <div style={S.td}><span style={{...S.badge,...(b.cashed_out?S.badgeGreen:S.badgeRed)}}>{b.cashed_out?"Won":"Lost"}</span></div>
                        <div style={{...S.td,color:"#00e676"}}>{b.payout>0?fKES(b.payout):"—"}</div>
                        <div style={{...S.td,color:"#ff4d6d"}}>{b.crash_point?`${b.crash_point}×`:"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS */}
          {tab==="transactions" && (
            <div>
              <div style={S.filterRow}>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {[["","All"],["dep","Deposits"],["win","Wins"],["wd","Withdrawals"],["bet","Bets"]].map(([k,l])=>(
                    <button key={k} style={{...S.pill,...(txnType===k?S.pillOn:{})}} onClick={()=>{setTxnType(k);setTxnPage(1);}}>{l}</button>
                  ))}
                </div>
                <div style={S.pageInfo}>{txnTotal} records</div>
              </div>
              <div style={{overflowX:"auto"}}>
                <div style={{...S.table,minWidth:480}}>
                  <div style={S.thead}>
                    <div style={S.th}>User</div><div style={S.th}>Type</div><div style={S.th}>Amount</div><div style={S.th}>Label</div><div style={S.th}>Date</div>
                  </div>
                  {txns.map((t,i)=>(
                    <div key={i} style={S.trow}>
                      <div style={S.td}>{t.first_name} {t.last_name}</div>
                      <div style={S.td}><span style={{...S.badge,...(t.type==="dep"?S.badgeGreen:t.type==="win"?S.badgeAmber:t.type==="wd"?S.badgeBlue:S.badgeRed)}}>{t.type}</span></div>
                      <div style={{...S.td,color:parseFloat(t.amount)>=0?"#00e676":"#ff4d6d",fontWeight:700}}>{parseFloat(t.amount)>=0?"+":""}{fKES(Math.abs(t.amount))}</div>
                      <div style={{...S.td,fontSize:11}}>{t.label}</div>
                      <div style={{...S.td,fontSize:10,color:"#6b7a99"}}>{fDate(t.created_at)}</div>
                    </div>
                  ))}
                  {txns.length===0 && <div style={S.noData}>No transactions</div>}
                </div>
              </div>
              <div style={S.pagination}>
                <button style={S.pageBtn} disabled={txnPage===1} onClick={()=>setTxnPage(p=>p-1)}><ChevronLeft size={13}/></button>
                <span style={S.pageNum}>Page {txnPage} of {Math.ceil(txnTotal/30)||1}</span>
                <button style={S.pageBtn} disabled={txnPage*30>=txnTotal} onClick={()=>setTxnPage(p=>p+1)}><ChevronRight size={13}/></button>
              </div>
            </div>
          )}

          {/* ROUNDS */}
          {tab==="rounds" && (
            <div>
              <div style={{...S.filterRow,marginBottom:10}}>
                <div style={S.pageInfo}>{roundTotal} rounds played</div>
              </div>
              <div style={{overflowX:"auto"}}>
                <div style={{...S.table,minWidth:480}}>
                  <div style={S.thead}>
                    <div style={S.th}>Round</div><div style={S.th}>Crash</div><div style={S.th}>Bets</div><div style={S.th}>Wagered</div><div style={S.th}>Paid</div><div style={S.th}>Edge</div><div style={S.th}>Date</div>
                  </div>
                  {rounds.map((r,i)=>{
                    const edge = parseFloat(r.total_wagered||0)-parseFloat(r.total_paid||0);
                    return (
                      <div key={i} style={S.trow}>
                        <div style={{...S.td,fontFamily:"monospace",fontSize:11}}>#{r.id}</div>
                        <div style={{...S.td,fontWeight:700,color:r.crash_point<2?"#6fa6f8":r.crash_point>=10?"#c77dff":"#8a9ab8"}}>{Number(r.crash_point).toFixed(2)}×</div>
                        <div style={S.td}>{r.bet_count}</div>
                        <div style={S.td}>{fKES(r.total_wagered)}</div>
                        <div style={{...S.td,color:"#ff4d6d"}}>{fKES(r.total_paid)}</div>
                        <div style={{...S.td,color:edge>=0?"#00e676":"#ff4d6d",fontWeight:700}}>{fKES(edge)}</div>
                        <div style={{...S.td,fontSize:10,color:"#6b7a99"}}>{fDate(r.created_at)}</div>
                      </div>
                    );
                  })}
                  {rounds.length===0 && <div style={S.noData}>No rounds yet</div>}
                </div>
              </div>
              <div style={S.pagination}>
                <button style={S.pageBtn} disabled={roundPage===1} onClick={()=>setRoundPage(p=>p-1)}><ChevronLeft size={13}/></button>
                <span style={S.pageNum}>Page {roundPage} of {Math.ceil(roundTotal/30)||1}</span>
                <button style={S.pageBtn} disabled={roundPage*30>=roundTotal} onClick={()=>setRoundPage(p=>p+1)}><ChevronRight size={13}/></button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

const S = {
  root:        {display:"flex",minHeight:"100vh",background:"#06080e",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif"},
  sidebar:     {width:190,background:"#0c0f1a",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"16px 10px",flexShrink:0,transition:"transform 0.25s ease"},
  sideTop:     {display:"flex",flexDirection:"column",gap:24},
  sideLogoRow: {display:"flex",alignItems:"center",gap:8,padding:"0 6px"},
  sideLogo:    {fontSize:15,fontWeight:800,letterSpacing:"-0.3px"},
  nav:         {display:"flex",flexDirection:"column",gap:3},
  navBtn:      {display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:8,border:"none",background:"transparent",color:"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left",transition:"all 0.12s"},
  navBtnOn:    {background:"rgba(79,142,247,0.1)",color:"#4f8ef7"},
  logoutBtn:   {display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:8,border:"1px solid rgba(255,77,109,0.2)",background:"transparent",color:"#ff4d6d",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"},
  main:        {flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"},
  topbar:      {height:48,borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",background:"rgba(12,15,26,0.8)",flexShrink:0},
  topTitle:    {fontSize:14,fontWeight:700,letterSpacing:"-0.2px"},
  topRight:    {display:"flex",alignItems:"center",gap:10},
  refreshBtn:  {display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"},
  content:     {flex:1,padding:"16px 20px",overflowY:"auto",overflowX:"hidden"},
  statGrid:    {display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginBottom:16},
  statCard:    {background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 12px 10px"},
  statIcon:    {marginBottom:6},
  statVal:     {fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,marginBottom:4,wordBreak:"break-all"},
  statLbl:     {fontSize:9,color:"#6b7a99",fontWeight:500},
  section:     {marginTop:20},
  sectionTitle:{fontSize:11,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:10},
  table:       {background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"},
  thead:       {display:"flex",background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"8px 12px"},
  th:          {flex:1,fontSize:9,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",minWidth:0},
  trow:        {display:"flex",padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.03)",alignItems:"center"},
  td:          {flex:1,fontSize:12,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
  noData:      {padding:"24px",textAlign:"center",color:"#6b7a99",fontSize:12},
  badge:       {display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:"0.3px"},
  badgeGreen:  {background:"rgba(0,230,118,0.1)",color:"#00e676"},
  badgeRed:    {background:"rgba(255,77,109,0.1)",color:"#ff4d6d"},
  badgeAmber:  {background:"rgba(255,183,3,0.1)",color:"#ffb703"},
  badgeBlue:   {background:"rgba(79,142,247,0.1)",color:"#4f8ef7"},
  badgePurple: {background:"rgba(199,125,255,0.1)",color:"#c77dff"},
  filterRow:   {display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,gap:10,flexWrap:"wrap"},
  searchWrap:  {position:"relative",flex:1,maxWidth:320},
  searchInput: {width:"100%",background:"#111827",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 12px 8px 32px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none"},
  pageInfo:    {fontSize:11,color:"#6b7a99",fontWeight:600,flexShrink:0},
  pagination:  {display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginTop:14},
  pageBtn:     {padding:"6px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"},
  pageNum:     {fontSize:12,color:"#6b7a99"},
  pill:        {padding:"5px 10px",borderRadius:16,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"},
  pillOn:      {background:"rgba(79,142,247,0.1)",borderColor:"rgba(79,142,247,0.3)",color:"#4f8ef7"},
  loginWrap:   {minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#06080e",padding:16},
  loginBox:    {width:"100%",maxWidth:360,background:"#111827",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"28px 20px"},
  loginLogo:   {display:"flex",alignItems:"center",gap:10,fontSize:20,fontWeight:800,marginBottom:6},
  loginSub:    {fontSize:12,color:"#6b7a99",marginBottom:20},
  loginBtn:    {width:"100%",padding:13,borderRadius:9,border:"none",background:"#4f8ef7",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:4},
  input:       {width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#f0f4ff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none"},
  errBox:      {background:"rgba(255,77,109,0.1)",border:"1px solid rgba(255,77,109,0.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#ff4d6d",marginBottom:12},
  okBox:       {background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#00e676",marginBottom:12},
  backBtn:     {display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",fontFamily:"'Space Grotesk',sans-serif",fontSize:12,cursor:"pointer",marginBottom:16},
  detailGrid:  {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16},
  detailCard:  {background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:14},
  detailTitle: {fontSize:11,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#6b7a99",marginBottom:12},
  detailRow:   {display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"},
  detailKey:   {color:"#6b7a99"},
  detailVal:   {fontWeight:600},
  actionBtn:   {display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:8,fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"},
  iconBtn:     {padding:"5px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#6b7a99",cursor:"pointer",display:"flex",alignItems:"center"},
  liveHeader:  {background:"#111827",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:16},
  liveBadge:   {fontSize:10,fontWeight:700,color:"#00e676"},
  liveState:   {fontSize:12,fontWeight:700,color:"#6b7a99"},
  liveMult:    {fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:700,color:"#ffffff"},
  liveInfo:    {fontSize:10,color:"#6b7a99",marginLeft:"auto"},
};