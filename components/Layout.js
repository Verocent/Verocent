'use client';
import { COLORS as C, MODULES } from '@/lib/constants';

const badge = (count, color=C.red) => count > 0 ? (
  <span style={{background:color,color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:10,fontWeight:800,marginLeft:'auto'}}>{count}</span>
) : null;

export default function Layout({ activeModule, setActiveModule, data, children }) {
  const { sales=[], products=[], compliance=[] } = data || {};
  const outstanding = sales.filter(s => s.status !== 'Paid').length;
  const lowStock    = products.filter(p => p.stock <= p.reorder).length;
  const compDue     = compliance.filter(c => {
    const days = Math.round((new Date(c.expiry) - new Date()) / 86400000);
    return days <= 90;
  }).length;

  return (
    <div style={{display:'flex',height:'100vh',background:C.bg,overflow:'hidden',fontFamily:'Arial,sans-serif'}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:220,minWidth:220,background:C.navy,display:'flex',flexDirection:'column',boxShadow:'2px 0 12px rgba(0,0,0,0.15)'}}>

        {/* Logo */}
        <div style={{padding:'18px 14px 14px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
            <div style={{width:38,height:38,background:C.gold,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#fff'}}>V</div>
            <div>
              <div style={{color:'#fff',fontWeight:800,fontSize:13}}>VEROCENT</div>
              <div style={{color:C.gold,fontWeight:600,fontSize:10}}>PURE ESSENCE ERP</div>
            </div>
          </div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:10,marginTop:4}}>Kaduna, Nigeria 🇳🇬</div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'10px 0',overflowY:'auto'}}>
          {MODULES.map(m => {
            const active = activeModule === m.id;
            return (
              <button key={m.id} onClick={() => setActiveModule(m.id)}
                style={{width:'100%',textAlign:'left',padding:'10px 14px',border:'none',
                  background:active?'rgba(212,160,23,0.15)':'transparent',
                  borderLeft:active?`3px solid ${C.gold}`:'3px solid transparent',
                  cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:17}}>{m.icon}</span>
                <span style={{color:active?C.gold:'#fff',fontSize:13,fontWeight:active?700:400,flex:1}}>{m.label}</span>
                {m.id==='sales'      && badge(outstanding)}
                {m.id==='inventory' && badge(lowStock)}
                {m.id==='compliance'&& badge(compDue, C.amber)}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,background:C.gold,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:13}}>V</div>
          <div>
            <div style={{color:'#fff',fontSize:12,fontWeight:700}}>Veronica</div>
            <div style={{color:C.gold,fontSize:10}}>Founder & CEO</div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Top Bar */}
        <div style={{background:'#fff',borderBottom:`1px solid ${C.border}`,padding:'11px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
          <div>
            <div style={{fontWeight:800,fontSize:15,color:C.body}}>{MODULES.find(m=>m.id===activeModule)?.icon} {MODULES.find(m=>m.id===activeModule)?.label}</div>
            <div style={{fontSize:11,color:'#888'}}>{new Date().toLocaleDateString('en-NG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            {outstanding>0 && <div style={{background:C.lightRed,color:C.red,borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700}}>⚠️ {outstanding} Outstanding</div>}
            {lowStock>0    && <div style={{background:C.lightAmber,color:C.amber,borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700}}>📦 {lowStock} Low Stock</div>}
            <div style={{background:C.lightGold,color:'#7D4E00',borderRadius:8,padding:'5px 12px',fontSize:11,fontWeight:600}}>🌿 Verocent ERP v2</div>
          </div>
        </div>

        {/* Page */}
        <div style={{flex:1,overflowY:'auto',padding:24}}>{children}</div>
      </div>
    </div>
  );
}
