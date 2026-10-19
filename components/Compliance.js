'use client';
import { useState } from 'react';

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

// ── Prominent buttons ─────────────────────────────────────
function Btn({ children, onClick, color='green', small, outline, disabled, fullWidth }) {
  const bg = { green:'#1F6F43', red:'#C0392B', gold:'#D4A017', blue:'#1A56DB', amber:'#E67E22', grey:'#e0e0e0' }[color] || '#1F6F43';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        background: outline ? 'transparent' : bg,
        color: outline ? bg : '#fff',
        border: outline ? `2px solid ${bg}` : 'none',
        borderRadius: 8,
        padding: small ? '6px 14px' : '10px 20px',
        fontWeight: 800,
        fontSize: small ? 12 : 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'sans-serif',
        opacity: disabled ? 0.65 : 1,
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: outline ? 'none' : '0 2px 6px rgba(0,0,0,0.15)',
      }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type='text', placeholder='' }) {
  return (
    <div style={{marginBottom:14}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
        textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',border:'2px solid #C9C9C0',borderRadius:7,padding:'10px 12px',
          fontSize:13,boxSizing:'border-box',fontFamily:'inherit',
          outline:'none',transition:'border-color 0.2s'}}
        onFocus={e=>e.target.style.borderColor='#1F6F43'}
        onBlur={e=>e.target.style.borderColor='#C9C9C0'}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows=3, placeholder='' }) {
  return (
    <div style={{marginBottom:14}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
        textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{label}</label>}
      <textarea value={value||''} onChange={e=>onChange(e.target.value)}
        rows={rows} placeholder={placeholder}
        style={{width:'100%',border:'2px solid #C9C9C0',borderRadius:7,padding:'10px 12px',
          fontSize:13,boxSizing:'border-box',fontFamily:'inherit',resize:'vertical'}}/>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:600,
        maxHeight:'92vh',overflow:'auto',boxShadow:'0 25px 70px rgba(0,0,0,0.35)'}}>
        <div style={{background:'#1F6F43',padding:'16px 22px',display:'flex',
          justifyContent:'space-between',alignItems:'center',borderRadius:'16px 16px 0 0'}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:16,fontFamily:'sans-serif'}}>{title}</span>
          <button onClick={onClose}
            style={{background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',
              width:32,height:32,borderRadius:'50%',fontSize:20,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>
            ×
          </button>
        </div>
        <div style={{padding:26}}>{children}</div>
      </div>
    </div>
  );
}

export default function Compliance({ compliance=[], setCompliance }) {
  const [modal,  setModal]  = useState(null); // 'add' | 'edit'
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const alertLabel = d => d<0?'🚨 EXPIRED':d<=30?'🔴 Due in 30 days':d<=60?'🟡 60 days':d<=90?'🟡 90 days':'✅ OK';
  const alertColor = d => d<0||d<=30?'red':d<=90?'amber':'green';

  const openAdd = () => {
    setForm({ document:'', body:'', reg_no:'', expiry:'', notes:'' });
    setModal('add');
  };

  const openEdit = (c) => {
    setForm({ ...c });
    setModal('edit');
  };

  const save = async () => {
    if (!form.document || !form.expiry) return alert('Document name and expiry date are required.');
    setSaving(true);
    try {
      const { db } = await import('@/lib/supabase');
      if (modal === 'add') {
        const row = await db.addCompliance(form).catch(() => null);
        setCompliance(prev => [...prev, row || { ...form, id: Date.now() }]);
      } else {
        await db.updateCompliance(form.id, form).catch(() => {});
        setCompliance(prev => prev.map(c => c.id === form.id ? { ...form } : c));
      }
      setModal(null);
    } catch(e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const del = async (id, doc) => {
    if (!window.confirm(`Delete "${doc}"? This cannot be undone.`)) return;
    try {
      const { db } = await import('@/lib/supabase');
      await db.deleteCompliance(id).catch(() => {});
    } catch(e) {}
    setCompliance(prev => prev.filter(c => c.id !== id));
  };

  const expired = compliance.filter(c => daysTo(c.expiry) < 0);
  const urgent  = compliance.filter(c => { const d = daysTo(c.expiry); return d >= 0 && d <= 90; });

  return (
    <div>
      {/* ── Alert banners ── */}
      {expired.length > 0 && (
        <div style={{background:'#FADBD8',border:'2px solid #C0392B',borderRadius:10,
          padding:'12px 18px',marginBottom:12,fontSize:13,color:'#C0392B',fontWeight:700,fontFamily:'sans-serif'}}>
          🚨 {expired.length} document(s) EXPIRED — renew immediately before NAFDAC inspection!
        </div>
      )}
      {urgent.length > 0 && (
        <div style={{background:'#FEF9E7',border:'2px solid #E67E22',borderRadius:10,
          padding:'12px 18px',marginBottom:12,fontSize:13,color:'#7D4E00',fontFamily:'sans-serif'}}>
          ⚠️ {urgent.length} document(s) expiring within 90 days — schedule renewal now.
        </div>
      )}

      {/* ── KPIs ── */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        {[
          ['Total Documents',    compliance.length,                                      '#165C35','#E8F5EE'],
          ['Expired',           expired.length,                                          '#C0392B','#FADBD8'],
          ['Due Within 90 Days',urgent.length,                                           '#E67E22','#FEF9E7'],
          ['All Clear',         compliance.filter(c => daysTo(c.expiry) > 90).length,   '#165C35','#E8F5EE'],
        ].map(([l,v,c,bg]) => (
          <div key={l} style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${c}`}}>
            <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{l}</div>
            <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:'sans-serif'}}>{v}</div>
          </div>
        ))}
      </div>

      {/* ── Main card ── */}
      <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>

        {/* Header with prominent Add button */}
        <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',
          justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <span style={{color:'#fff',fontWeight:700,fontSize:15,fontFamily:'sans-serif'}}>
            📜 NAFDAC & Compliance Register
          </span>
          <Btn color='gold' onClick={openAdd}>
            ➕ Add Document
          </Btn>
        </div>

        {/* Help tip */}
        <div style={{background:'#E8F5EE',padding:'10px 20px',borderBottom:'1px solid #C9C9C0',
          fontSize:13,color:'#165C35',fontFamily:'sans-serif'}}>
          💡 <strong>Tip:</strong> Click <strong>✏️ Edit</strong> to update a document's details or renew its expiry date.
          Click <strong>🗑 Delete</strong> to remove it. Use <strong>➕ Add Document</strong> to register a new licence.
        </div>

        {/* Table */}
        <div style={{padding:20,overflowX:'auto'}}>
          {compliance.length === 0 ? (
            <div style={{padding:60,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
              <div style={{fontSize:48,marginBottom:16}}>📜</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:'#165C35'}}>No compliance documents yet</div>
              <div style={{fontSize:13,color:'#aaa',marginBottom:24}}>
                Add your NAFDAC registration, CAC certificate, and other licences here to track their expiry dates.
              </div>
              <Btn color='gold' onClick={openAdd}>➕ Add First Document</Btn>
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr>
                  {['Document / Licence','Issuing Body','Reg. Number','Expiry Date','Days Left','Status','Actions'].map(h => (
                    <th key={h} style={{background:'#165C35',color:'#fff',padding:'11px 14px',
                      textAlign:'left',fontSize:11,textTransform:'uppercase',
                      whiteSpace:'nowrap',fontFamily:'sans-serif'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compliance.map((c, i) => {
                  const d = daysTo(c.expiry);
                  return (
                    <tr key={c.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                      <td style={{padding:'11px 14px',fontWeight:700,fontFamily:'sans-serif',fontSize:13}}>
                        {c.document}
                      </td>
                      <td style={{padding:'11px 14px',fontFamily:'sans-serif',fontSize:13}}>
                        {c.body || <span style={{color:'#bbb',fontStyle:'italic'}}>—</span>}
                      </td>
                      <td style={{padding:'11px 14px'}}>
                        <code style={{fontSize:11,background:'#FDF6E3',padding:'3px 8px',borderRadius:4,fontWeight:700,color:'#7D4E00'}}>
                          {c.reg_no || '[Fill in]'}
                        </code>
                      </td>
                      <td style={{padding:'11px 14px',fontFamily:'sans-serif',fontSize:13,fontWeight:600}}>
                        {c.expiry}
                      </td>
                      <td style={{padding:'11px 14px',fontWeight:800,fontFamily:'sans-serif',fontSize:13,
                        color:d<0?'#C0392B':d<=90?'#E67E22':'#165C35'}}>
                        {d < 0 ? `${Math.abs(d)} days OVERDUE` : `${d} days`}
                      </td>
                      <td style={{padding:'11px 14px'}}>
                        <Badge label={alertLabel(d)} color={alertColor(d)}/>
                      </td>
                      <td style={{padding:'11px 14px'}}>
                        {/* Edit and Delete clearly visible */}
                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          <Btn small color='blue' onClick={() => openEdit(c)}>
                            ✏️ Edit
                          </Btn>
                          <Btn small color='red' outline onClick={() => del(c.id, c.document)}>
                            🗑 Delete
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modal && (
        <Modal
          title={modal === 'add' ? '➕ Add Compliance Document' : `✏️ Edit: ${form.document}`}
          onClose={() => setModal(null)}
        >
          {/* What is being saved */}
          <div style={{background:'#E8F5EE',borderRadius:8,padding:'10px 14px',
            marginBottom:18,fontSize:13,color:'#165C35',fontFamily:'sans-serif'}}>
            {modal === 'add'
              ? '📌 Fill in the details below and click Save. This document will be saved permanently to the database.'
              : '📌 Update the details below and click Save Changes. The updated record will be saved permanently.'}
          </div>

          <Input label='Document / Licence Name *' value={form.document} onChange={v=>f('document',v)}
            placeholder='e.g. NAFDAC Product Registration'/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Input label='Issuing Body' value={form.body} onChange={v=>f('body',v)}
              placeholder='e.g. NAFDAC, CAC, FIPO'/>
            <Input label='Registration / Certificate Number' value={form.reg_no} onChange={v=>f('reg_no',v)}
              placeholder='e.g. A7-1234'/>
            <Input label='Expiry Date *' type='date' value={form.expiry} onChange={v=>f('expiry',v)}/>
            <div/>
          </div>

          {form.expiry && (
            <div style={{background: daysTo(form.expiry) < 0 ? '#FADBD8' : daysTo(form.expiry) <= 90 ? '#FEF9E7' : '#E8F5EE',
              borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,fontFamily:'sans-serif',
              color: daysTo(form.expiry) < 0 ? '#C0392B' : daysTo(form.expiry) <= 90 ? '#E67E22' : '#165C35',fontWeight:700}}>
              {daysTo(form.expiry) < 0
                ? `🚨 Already expired ${Math.abs(daysTo(form.expiry))} days ago — renew immediately!`
                : daysTo(form.expiry) <= 90
                  ? `⚠️ Expires in ${daysTo(form.expiry)} days — schedule renewal soon.`
                  : `✅ ${daysTo(form.expiry)} days remaining — document is current.`}
            </div>
          )}

          <Textarea label='Notes (optional)' value={form.notes} onChange={v=>f('notes',v)}
            placeholder='Any notes about this document, renewal contacts, etc.'/>

          {/* Action buttons — prominent and clear */}
          <div style={{display:'flex',gap:12,marginTop:6,flexWrap:'wrap'}}>
            <Btn color='green' onClick={save} disabled={saving}>
              {saving ? '⏳ Saving…' : modal === 'add' ? '💾 Save Document' : '💾 Save Changes'}
            </Btn>
            <Btn color='grey' outline onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}