'use client';
import { useState } from 'react';

const C = {
  green:'#1F6F43', dark:'#165C35', gold:'#D4A017',
  lightGreen:'#E8F5EE', lightGold:'#FDF6E3', white:'#FFFFFF',
  body:'#1A1A1A', border:'#C9C9C0', bg:'#FAFAF7',
  red:'#C0392B', lightRed:'#FADBD8', amber:'#E67E22',
  lightAmber:'#FEF9E7', blue:'#1A56DB', navy:'#1B2631',
};

function Badge({ count, color=C.red }) {
  if(!count||count<=0) return null;
  return (
    <span style={{background:color,color:'#fff',borderRadius:10,
      padding:'1px 7px',fontSize:10,fontWeight:800,marginLeft:'auto'}}>
      {count}
    </span>
  );
}

export default function Layout({
  activeModule, setActiveModule, data,
  currentUser, onLogout, allowedModules=[],
  children
}) {
  const { sales=[], products=[], compliance=[] } = data||{};
  const [mobileOpen, setMobileOpen] = useState(false);

  const outstanding = sales.filter(s=>s.status!=='Paid').length;
  const lowStock    = products.filter(p=>(p.stock||0)<=(p.reorder||20)).length;
  const compDue     = compliance.filter(c=>Math.round((new Date(c.expiry)-new Date())/86400000)<=90).length;

  const handleNav = (id) => {
    setActiveModule(id);
    setMobileOpen(false);
  };

  const getRoleColor = (level) => {
    if(level==='Founder / CEO')      return C.gold;
    if(level==='Production Manager') return C.green;
    if(level==='Accountant')         return C.blue;
    return 'rgba(255,255,255,0.7)';
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{padding:'20px 16px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <div style={{width:44,height:44,background:C.gold,borderRadius:'50%',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:18,fontWeight:900,color:'#fff',flexShrink:0,overflow:'hidden',
            border:'2px solid rgba(255,255,255,0.3)'}}>
            <img src='/logo.png' alt='V'
              style={{width:'100%',height:'100%',objectFit:'cover'}}
              onError={e=>{e.target.style.display='none';}}/>
          </div>
          <div>
            <div style={{color:'#fff',fontWeight:800,fontSize:13,fontFamily:'sans-serif',letterSpacing:0.5}}>VEROCENT</div>
            <div style={{color:C.gold,fontWeight:600,fontSize:10,fontFamily:'sans-serif'}}>PURE ESSENCE ERP</div>
          </div>
        </div>
        <div style={{color:'rgba(255,255,255,0.4)',fontSize:10,fontFamily:'sans-serif'}}>🇳🇬 Kaduna, Nigeria</div>
      </div>

      {/* Nav — only shows modules user has access to */}
      <nav style={{flex:1,padding:'10px 0',overflowY:'auto'}}>
        {allowedModules.map(m=>{
          const active = activeModule===m.id;
          return (
            <button key={m.id} onClick={()=>handleNav(m.id)}
              style={{width:'100%',textAlign:'left',padding:'11px 16px',border:'none',
                cursor:'pointer',display:'flex',alignItems:'center',gap:10,
                background:active?'rgba(212,160,23,0.15)':'transparent',
                borderLeft:active?`3px solid ${C.gold}`:'3px solid transparent'}}>
              <span style={{fontSize:17,flexShrink:0}}>{m.icon}</span>
              <span style={{color:active?C.gold:'rgba(255,255,255,0.85)',fontSize:13,
                fontWeight:active?700:400,flex:1,fontFamily:'sans-serif'}}>{m.label}</span>
              {m.id==='sales'      && <Badge count={outstanding}/>}
              {m.id==='inventory'  && <Badge count={lowStock}/>}
              {m.id==='compliance' && <Badge count={compDue} color={C.amber}/>}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <div style={{width:34,height:34,background:C.gold,borderRadius:'50%',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff',fontWeight:800,fontSize:13,flexShrink:0}}>
            {currentUser?.full_name?.[0]||'V'}
          </div>
          <div style={{minWidth:0}}>
            <div style={{color:'#fff',fontSize:12,fontWeight:700,fontFamily:'sans-serif',
              overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {currentUser?.full_name||'User'}
            </div>
            <div style={{color:getRoleColor(currentUser?.access_level),fontSize:10,fontFamily:'sans-serif'}}>
              {currentUser?.role||'Staff'}
            </div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{width:'100%',background:'rgba(192,57,43,0.2)',color:'#FADBD8',
            border:'1px solid rgba(192,57,43,0.4)',borderRadius:7,padding:'7px',
            fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'sans-serif'}}>
          🚪 Sign Out
        </button>
      </div>
    </>
  );

  const currentModule = allowedModules.find(m=>m.id===activeModule);

  return (
    <div style={{display:'flex',height:'100vh',background:C.bg,overflow:'hidden',fontFamily:'Arial,sans-serif'}}>

      {/* Desktop Sidebar */}
      <div style={{width:220,minWidth:220,background:C.navy,
        display:'flex',flexDirection:'column',boxShadow:'2px 0 12px rgba(0,0,0,0.15)'}}>
        <SidebarContent/>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen&&(
        <div onClick={()=>setMobileOpen(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:100}}/>
      )}
      <div style={{position:'fixed',top:0,left:0,bottom:0,width:240,background:C.navy,
        display:'flex',flexDirection:'column',
        transform:mobileOpen?'translateX(0)':'translateX(-100%)',
        transition:'transform 0.25s',zIndex:101,boxShadow:'4px 0 20px rgba(0,0,0,0.3)'}}>
        <SidebarContent/>
      </div>

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Top Bar */}
        <div style={{background:'#fff',borderBottom:`1px solid ${C.border}`,
          padding:'10px 16px',display:'flex',alignItems:'center',
          justifyContent:'space-between',gap:12,
          boxShadow:'0 1px 4px rgba(0,0,0,0.06)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
            <button onClick={()=>setMobileOpen(!mobileOpen)}
              style={{background:'none',border:'none',cursor:'pointer',
                fontSize:22,color:C.green,padding:4,borderRadius:6,lineHeight:1}}>☰</button>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:800,fontSize:15,color:C.body,fontFamily:'sans-serif',
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {currentModule?.icon} {currentModule?.label||'Dashboard'}
              </div>
              <div style={{fontSize:11,color:'#888',fontFamily:'sans-serif'}}>
                {new Date().toLocaleDateString('en-NG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0,flexWrap:'wrap'}}>
            {outstanding>0&&<div style={{background:C.lightRed,color:C.red,borderRadius:8,
              padding:'4px 10px',fontSize:11,fontWeight:700,fontFamily:'sans-serif',whiteSpace:'nowrap'}}>
              ⚠️ {outstanding} Outstanding</div>}
            {lowStock>0&&<div style={{background:C.lightAmber,color:C.amber,borderRadius:8,
              padding:'4px 10px',fontSize:11,fontWeight:700,fontFamily:'sans-serif',whiteSpace:'nowrap'}}>
              📦 {lowStock} Low Stock</div>}
            {/* Logged in user chip */}
            <div style={{background:C.lightGold,color:'#7D4E00',borderRadius:8,
              padding:'4px 10px',fontSize:11,fontFamily:'sans-serif',fontWeight:600,whiteSpace:'nowrap'}}>
              👤 {currentUser?.full_name?.split(' ')[0]||'User'}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{flex:1,overflowY:'auto',padding:'clamp(12px,2vw,24px)'}}>
          {children}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#f1f1f1; }
        ::-webkit-scrollbar-thumb { background:#1F6F43; border-radius:3px; }
        @media(max-width:767px){
          .desktop-sidebar{ display:none!important; }
        }
      `}</style>
    </div>
  );
}
