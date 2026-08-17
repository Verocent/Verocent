'use client';
import { COLORS as C } from '@/lib/constants';

// ── BADGE ─────────────────────────────────────────────────
export function Badge({ label, color = 'green' }) {
  const map = {
    green:  { b: C.lightGreen,  t: C.dark  },
    red:    { b: C.lightRed,    t: C.red   },
    amber:  { b: C.lightAmber,  t: C.amber },
    gold:   { b: C.lightGold,   t: '#7D4E00' },
    blue:   { b: '#EBF5FB',     t: C.blue  },
    navy:   { b: '#E8ECF0',     t: C.navy  },
  };
  const s = map[color] || map.green;
  return (
    <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',
      fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>
  );
}

// ── BUTTON ────────────────────────────────────────────────
export function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bgMap = { green:C.green, red:C.red, gold:C.gold, blue:C.blue, amber:C.amber, grey:'#e0e0e0' };
  const bg  = disabled ? '#ccc' : (bgMap[color] || C.green);
  const tc  = color === 'grey' ? C.body : '#fff';
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{background:outline?'transparent':bg, color:outline?bg:tc,
        border:outline?`2px solid ${bg}`:'none', borderRadius:7,
        padding:small?'4px 10px':'8px 16px', fontWeight:700,
        fontSize:small?11:13, cursor:disabled?'not-allowed':'pointer',
        opacity:disabled?.7:1, fontFamily:'inherit'}}>
      {children}
    </button>
  );
}

// ── KPI ───────────────────────────────────────────────────
export function KPI({ label, value, color=C.green, bg=C.lightGreen, sub }) {
  return (
    <div style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,
      minWidth:130,borderLeft:`4px solid ${color}`}}>
      <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color}}>{value}</div>
      {sub && <div style={{fontSize:11,color:'#888',marginTop:3}}>{sub}</div>}
    </div>
  );
}

// ── CARD ─────────────────────────────────────────────────
export function Card({ title, icon, children, actions }) {
  return (
    <div style={{background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',marginBottom:20}}>
      <div style={{background:C.green,padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'#fff',fontWeight:700,fontSize:14}}>{icon} {title}</span>
        <div style={{display:'flex',gap:8}}>{actions}</div>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  );
}

// ── INPUT ─────────────────────────────────────────────────
export function Input({ label, value, onChange, type='text', placeholder='', required }) {
  return (
    <div style={{marginBottom:12}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:C.dark,
        textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>
        {label}{required && <span style={{color:C.red}}> *</span>}
      </label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{width:'100%',border:`1px solid ${C.border}`,borderRadius:6,
          padding:'8px 10px',fontSize:13,boxSizing:'border-box',fontFamily:'inherit'}}/>
    </div>
  );
}

// ── SELECT ────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{marginBottom:12}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:C.dark,
        textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>
        {label}{required && <span style={{color:C.red}}> *</span>}
      </label>}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',border:`1px solid ${C.border}`,borderRadius:6,
          padding:'8px 10px',fontSize:13,background:'#fff',fontFamily:'inherit'}}>
        <option value=''>— Select —</option>
        {options.map(o => (
          <option key={o.value||o} value={o.value||o}>{o.label||o}</option>
        ))}
      </select>
    </div>
  );
}

// ── TEXTAREA ──────────────────────────────────────────────
export function Textarea({ label, value, onChange, rows=3, placeholder='' }) {
  return (
    <div style={{marginBottom:12}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:C.dark,
        textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{label}</label>}
      <textarea value={value||''} onChange={e=>onChange(e.target.value)}
        rows={rows} placeholder={placeholder}
        style={{width:'100%',border:`1px solid ${C.border}`,borderRadius:6,
          padding:'8px 10px',fontSize:13,boxSizing:'border-box',
          fontFamily:'inherit',resize:'vertical'}}/>
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',
        maxWidth:wide?900:680,maxHeight:'90vh',overflow:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{background:C.green,padding:'14px 20px',display:'flex',
          justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0'}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:15}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',
            color:'#fff',fontSize:24,cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

// ── TABLE ─────────────────────────────────────────────────
export function Table({ headers, rows, compact }) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:compact?12:13}}>
        <thead>
          <tr>{headers.map((h,i)=>(
            <th key={i} style={{background:C.dark,color:'#fff',padding:compact?'7px 10px':'10px 14px',
              textAlign:'left',fontWeight:700,fontSize:11,textTransform:'uppercase',
              letterSpacing:0.5,whiteSpace:'nowrap'}}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>{rows.map((row,i)=>(
          <tr key={i} style={{background:i%2===0?C.lightGreen:'#fff'}}>
            {row.map((cell,j)=>(
              <td key={j} style={{padding:compact?'7px 10px':'10px 14px',
                borderBottom:`1px solid ${C.border}`,verticalAlign:'middle'}}>{cell}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ── ALERT BOX ─────────────────────────────────────────────
export function AlertBox({ type='warning', children }) {
  const s = {
    warning: { bg:C.lightAmber, border:C.amber, icon:'⚠️', c:'#7D4E00' },
    danger:  { bg:C.lightRed,   border:C.red,   icon:'🚨', c:C.red     },
    success: { bg:C.lightGreen, border:C.green,  icon:'✅', c:C.dark    },
    info:    { bg:'#EBF5FB',    border:C.blue,   icon:'ℹ️', c:C.blue    },
  }[type] || {};
  return (
    <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:8,
      padding:'10px 14px',marginBottom:10,fontSize:13,color:s.c,
      display:'flex',gap:8,alignItems:'flex-start'}}>
      <span>{s.icon}</span><span>{children}</span>
    </div>
  );
}

// ── GRID ──────────────────────────────────────────────────
export function Grid({ cols=2, children }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:12}}>
      {children}
    </div>
  );
}

// ── CSV EXPORT ────────────────────────────────────────────
export function exportCSV(data, filename) {
  if (!data?.length) return alert('No data to export.');
  const headers = Object.keys(data[0]).join(',');
  const rows    = data.map(r => Object.values(r).map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob    = new Blob([headers+'\n'+rows], {type:'text/csv'});
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── HELPERS ───────────────────────────────────────────────
export const fmt    = n  => `₦${Number(n||0).toLocaleString()}`;
export const today  = () => new Date().toISOString().split('T')[0];
export const invId  = () => `INV-${new Date().toISOString().replace(/-/g,'').substr(0,8)}-${String(Math.floor(Math.random()*9000)+1000)}`;
export const expId  = (prefix,n) => `${prefix}-${String(n).padStart(3,'0')}`;
export const daysTo = (d) => Math.round((new Date(d)-new Date())/86400000);
