'use client';
import { useState } from 'react';
import { COLORS as C } from '@/lib/constants';

// ── Simple helpers (no import from ui.js needed) ──────────
const fmt = n => `₦${Number(n||0).toLocaleString()}`;
const daysTo = d => Math.round((new Date(d) - new Date()) / 86400000);

function Badge({ label, color='green' }) {
  const map = {
    green: { b:'#E8F5EE', t:'#165C35' },
    red:   { b:'#FADBD8', t:'#C0392B' },
    amber: { b:'#FEF9E7', t:'#E67E22' },
    gold:  { b:'#FDF6E3', t:'#7D4E00' },
  };
  const s = map[color] || map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bg = { green:'#1F6F43', red:'#C0392B', gold:'#D4A017', blue:'#1A56DB', amber:'#E67E22', grey:'#e0e0e0' }[color] || '#1F6F43';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:outline?'transparent':bg, color:outline?bg:'#fff',
        border:outline?`2px solid ${bg}`:'none', borderRadius:7,
        padding:small?'4px 10px':'8px 16px', fontWeight:700,
        fontSize:small?11:13, cursor:'pointer', fontFamily:'inherit'}}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type='text', placeholder='' }) {
  return (
    <div style={{marginBottom:12}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,padding:'8px 10px',fontSize:13,boxSizing:'border-box',fontFamily:'inherit'}}/>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:600,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0'}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:15}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

export default function Compliance({ compliance=[], setCompliance }) {
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const alertLabel = d => d<0?'🚨 EXPIRED':d<=30?'🔴 DUE IN 30 DAYS':d<=60?'🟡 60 DAYS':d<=90?'🟡 90 DAYS':'✅ OK';
  const alertColor = d => d<0||d<=30?'red':d<=90?'amber':'green';

  const save = async () => {
    if (!form.document||!form.expiry) return alert('Document name and expiry date are required.');
    setSaving(true);
    try {
      const { db } = await import('@/lib/supabase');
      if (modal==='add') {
        const row = await db.addCompliance(form).catch(()=>null);
        setCompliance(prev=>[...prev, row||{...form,id:Date.now()}]);
      } else {
        await db.updateCompliance(form.id, form).catch(()=>{});
        setCompliance(prev=>prev.map(c=>c.id===form.id?{...form}:c));
      }
      setModal(null);
    } catch(e) { alert('Error: '+e.message); }
    setSaving(false);
  };

  const del = async (id, doc) => {
    if (!window.confirm(`Remove "${doc}"?`)) return;
    try {
      const { db } = await import('@/lib/supabase');
      await db.deleteCompliance(id).catch(()=>{});
    } catch(e){}
    setCompliance(prev=>prev.filter(c=>c.id!==id));
  };

  const expired = compliance.filter(c=>daysTo(c.expiry)<0);
  const urgent  = compliance.filter(c=>{ const d=daysTo(c.expiry); return d>=0&&d<=90; });

  return (
    <div>
      {expired.length>0&&(
        <div style={{background:'#FADBD8',border:'1px solid #C0392B',borderRadius:8,padding:'10px 14px',marginBottom:10,fontSize:13,color:'#C0392B',fontWeight:700}}>
          🚨 {expired.length} document(s) EXPIRED — renew immediately before NAFDAC inspection!
        </div>
      )}
      {urgent.length>0&&(
        <div style={{background:'#FEF9E7',border:'1px solid #E67E22',borderRadius:8,padding:'10px 14px',marginBottom:10,fontSize:13,color:'#7D4E00'}}>
          ⚠️ {urgent.length} document(s) expiring within 90 days — schedule renewal now.
        </div>
      )}

      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        {[
          ['Total Documents', compliance.length,                                     '#165C35','#E8F5EE'],
          ['Expired',         expired.length,                                         '#C0392B','#FADBD8'],
          ['Due Within 90 Days', urgent.length,                                       '#E67E22','#FEF9E7'],
          ['All Clear',       compliance.filter(c=>daysTo(c.expiry)>90).length,       '#165C35','#E8F5EE'],
        ].map(([l,v,c,bg])=>(
          <div key={l} style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${c}`}}>
            <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
        <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:'#fff',fontWeight:700,fontSize:14}}>📜 NAFDAC & Compliance Register</span>
          <Btn small color='gold' onClick={()=>{setForm({document:'',body:'',reg_no:'',expiry:''});setModal('add');}}>+ Add Document</Btn>
        </div>
        <div style={{padding:20,overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr>
              {['Document / Licence','Issuing Body','Reg. Number','Expiry Date','Days Remaining','Status','Actions'].map(h=>(
                <th key={h} style={{background:'#165C35',color:'#fff',padding:'10px 14px',textAlign:'left',fontSize:11,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {compliance.map((c,i)=>{
                const d = daysTo(c.expiry);
                return (
                  <tr key={c.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                    <td style={{padding:'10px 14px',fontWeight:600}}>{c.document}</td>
                    <td style={{padding:'10px 14px'}}>{c.body}</td>
                    <td style={{padding:'10px 14px'}}><code style={{fontSize:11,background:'#FDF6E3',padding:'2px 6px',borderRadius:4}}>{c.reg_no||'[Fill in]'}</code></td>
                    <td style={{padding:'10px 14px'}}>{c.expiry}</td>
                    <td style={{padding:'10px 14px',fontWeight:700,color:d<0?'#C0392B':d<=90?'#E67E22':'#165C35'}}>
                      {d<0?`${Math.abs(d)} days overdue`:`${d} days`}
                    </td>
                    <td style={{padding:'10px 14px'}}><Badge label={alertLabel(d)} color={alertColor(d)}/></td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',gap:6}}>
                        <Btn small color='blue' onClick={()=>{setForm({...c});setModal('edit');}}>Edit</Btn>
                        <Btn small color='red'  onClick={()=>del(c.id,c.document)}>Del</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {compliance.length===0&&(
                <tr><td colSpan={7} style={{padding:24,textAlign:'center',color:'#888'}}>No compliance documents yet. Click + Add Document to start.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal&&(
        <Modal title={modal==='add'?'Add Compliance Document':'Edit Document'} onClose={()=>setModal(null)}>
          <Input label='Document / Licence Name *' value={form.document} onChange={v=>f('document',v)}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Issuing Body' value={form.body} onChange={v=>f('body',v)} placeholder='e.g. NAFDAC, CAC, FIPO'/>
            <Input label='Reg. / Cert. Number' value={form.reg_no} onChange={v=>f('reg_no',v)}/>
            <Input label='Expiry Date *' type='date' value={form.expiry} onChange={v=>f('expiry',v)}/>
          </div>
          {form.expiry&&(
            <div style={{background:'#E8F5EE',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}}>
              Days remaining after saving: <strong style={{color:daysTo(form.expiry)<=90?'#C0392B':'#165C35'}}>{daysTo(form.expiry)}</strong>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={save} color='green' disabled={saving}>{saving?'Saving…':'Save Document'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
