'use client';
import { useState } from 'react';

const C = {
  green:'#1F6F43', dark:'#165C35', gold:'#D4A017',
  body:'#1A1A1A', border:'#C9C9C0', bg:'#FAFAF7',
  red:'#C0392B', lightRed:'#FADBD8', amber:'#E67E22',
  lightAmber:'#FEF9E7', navy:'#1B2631',
};

export default function Layout({ activeModule, setActiveModule, data, currentUser, onLogout, allowedModules = [], children }) {
  const { sales=[], products=[], compliance=[] } = data || {};
  const [mobileOpen, setMobileOpen] = useState(false);

  const outstanding = sales.filter(s => s.status !== 'Paid').length;
  const lowStock    = products.filter(p => (p.stock||0) <= (p.reorder||20)).length;
  const compDue     = compliance.filter(c => Math.round((new Date(c.expiry)-new Date())/86400000) <= 90).length;

  // Only navigate to modules in allowedModules
  const handleNav = (id) => {
    const allowed = allowedModules.map(m => m.id);
    if (!allowed.includes(id)) return;
    setActiveModule(id);
    setMobileOpen(false);
  };

  const Sidebar = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:C.navy}}>
      {/* Brand */}
      <div style={{padding:'20px 16px 14px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:44,height:44,background:C.gold,borderRadius:'50%',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:900,color:'#fff',fontSize:16,flexShrink:0,overflow:'hidden',
            border:'2px solid rgba(255,255,255,0.2)'}}>
            <img src='/logo.png' alt='V'
              style={{width:'100%',height:'100%',objectFit:'cover'}}
              onError={e=>{e.target.style.display='none';}}/>
          </div>
          <div>
            <div style={{color:'#fff',fontWeight:800,fontSize:13,fontFamily:'sans-serif'}}>VEROCENT</div>
            <div style={{color:C.gold,fontWeight:600,fontSize:10,fontFamily:'sans-serif'}}>PURE ESSENCE ERP</div>
          </div>
        </div>
        <div style={{color:'rgba(255,255,255,0.35)',fontSize:10,fontFamily:'sans-serif',marginTop:8}}>
          🇳🇬 Kaduna, Nigeria
        </div>
      </div>

      {/* Navigation — ONLY shows allowedModules */}
      <nav style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
        {allowedModules.map(m => {
          const active = activeModule === m.id;
          return (
            <button key={m.id} onClick={() => handleNav(m.id)}
              style={{
                width:'100%', textAlign:'left', padding:'11px 16px',
                border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                background: active ? 'rgba(212,160,23,0.15)' : 'transparent',
                borderLeft: active ? `3px solid ${C.gold}` : '3px solid transparent',
              }}>
              <span style={{fontSize:17,flexShrink:0}}>{m.icon}</span>
              <span style={{
                color: active ? C.gold : 'rgba(255,255,255,0.8)',
                fontSize:13, fontWeight: active ? 700 : 400,
                flex:1, fontFamily:'sans-serif',
              }}>{m.label}</span>
              {m.id==='sales'      && outstanding>0 && <span style={{background:C.red,color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:800}}>{outstanding}</span>}
              {m.id==='inventory'  && lowStock>0    && <span style={{background:C.red,color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:800}}>{lowStock}</span>}
              {m.id==='compliance' && compDue>0     && <span style={{background:C.amber,color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:800}}>{compDue}</span>}
            </button>
          );
        })}
      </nav>

      {/* User + Sign out */}
      <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <div style={{width:34,height:34,background:C.gold,borderRadius:'50%',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff',fontWeight:800,fontSize:14,flexShrink:0}}>
            {currentUser?.full_name?.[0] || 'V'}
          </div>
          <div style={{minWidth:0}}>
            <div style={{color:'#fff',fontSize:12,fontWeight:700,fontFamily:'sans-serif',
              overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {currentUser?.full_name}
            </div>
            <div style={{color:C.gold,fontSize:10,fontFamily:'sans-serif'}}>
              {currentUser?.role}
            </div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{width:'100%',background:'rgba(192,57,43,0.2)',color:'#FADBD8',
            border:'1px solid rgba(192,57,43,0.5)',borderRadius:7,padding:'8px',
            fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'sans-serif'}}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );

  const currentMod = allowedModules.find(m => m.id === activeModule);

  return (
    <div style={{display:'flex',height:'100vh',background:C.bg,overflow:'hidden',fontFamily:'Arial,sans-serif'}}>

      {/* Desktop sidebar */}
      <div style={{width:220,minWidth:220,flexShrink:0}}>
        <Sidebar/>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={()=>setMobileOpen(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:100}}/>
      )}
      <div style={{
        position:'fixed',top:0,left:0,bottom:0,width:240,zIndex:101,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.25s',
      }}>
        <Sidebar/>
      </div>

      {/* Main content */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Top bar */}
        <div style={{background:'#fff',borderBottom:`1px solid ${C.border}`,
          padding:'10px 16px',display:'flex',alignItems:'center',
          justifyContent:'space-between',gap:12,flexShrink:0,
          boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
            <button onClick={()=>setMobileOpen(!mobileOpen)}
              style={{background:'none',border:'none',cursor:'pointer',
                fontSize:22,color:C.green,padding:4,borderRadius:6,lineHeight:1,flexShrink:0}}>
              ☰
            </button>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:800,fontSize:15,color:C.body,fontFamily:'sans-serif',
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {currentMod?.icon} {currentMod?.label || 'Dashboard'}
              </div>
              <div style={{fontSize:11,color:'#888',fontFamily:'sans-serif'}}>
                {new Date().toLocaleDateString('en-NG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
            {outstanding>0 && <div style={{background:'#FADBD8',color:C.red,borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700,fontFamily:'sans-serif',whiteSpace:'nowrap'}}>⚠️ {outstanding} Outstanding</div>}
            {lowStock>0    && <div style={{background:'#FEF9E7',color:C.amber,borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700,fontFamily:'sans-serif',whiteSpace:'nowrap'}}>📦 {lowStock} Low Stock</div>}
            <div style={{background:'#E8F5EE',color:C.dark,borderRadius:8,padding:'4px 10px',fontSize:11,fontFamily:'sans-serif',fontWeight:600,whiteSpace:'nowrap'}}>
              👤 {currentUser?.full_name?.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Page */}
        <div style={{flex:1,overflowY:'auto',padding:20}}>
          {children}
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:#f1f1f1;}
        ::-webkit-scrollbar-thumb{background:#1F6F43;border-radius:3px;}
      `}</style>
    </div>
  );
}
