'use client';
import { useState } from 'react';

// ── Self-contained helpers ────────────────────────────────
const fmt   = n  => `₦${Number(n||0).toLocaleString()}`;
const today = () => new Date().toISOString().split('T')[0];

function Badge({ label, color='green' }) {
  const map = { green:{b:'#E8F5EE',t:'#165C35'}, red:{b:'#FADBD8',t:'#C0392B'}, amber:{b:'#FEF9E7',t:'#E67E22'}, gold:{b:'#FDF6E3',t:'#7D4E00'} };
  const s = map[color]||map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bg = {green:'#1F6F43',red:'#C0392B',gold:'#D4A017',blue:'#1A56DB',amber:'#E67E22',grey:'#e0e0e0'}[color]||'#1F6F43';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:outline?'transparent':bg,color:outline?bg:'#fff',
        border:outline?`2px solid ${bg}`:'none',borderRadius:7,
        padding:small?'4px 10px':'8px 16px',fontWeight:700,fontSize:small?11:13,cursor:'pointer',fontFamily:'inherit'}}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type='text', placeholder='' }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,padding:'8px 10px',fontSize:13,boxSizing:'border-box',fontFamily:'inherit'}}/>
    </div>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{label}</label>}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,padding:'8px 10px',fontSize:13,background:'#fff',fontFamily:'inherit'}}>
        <option value=''>— Select —</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:700,maxHeight:'90vh',overflow:'auto'}}>
        <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0'}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:15}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

const addExpiryYears = (date, years=2) => {
  if (!date) return '';
  const d = new Date(date);
  d.setFullYear(d.getFullYear()+years);
  return d.toISOString().split('T')[0];
};

export default function Production({ production=[], setProduction, products=[] }) {
  const [tab,    setTab]    = useState('log');
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const blank = {
    date:today(), product:'', qty:'', mfg_date:today(),
    labour_cost:'5000', pkg_cost:'500', util_cost:'2000',
    produced_by:'', approved_by:'Veronica', qc_status:'Pending', notes:''
  };

  const genBatchId = (prefix, date) => {
    const d = (date||today()).replace(/-/g,'');
    const n = String(production.length+1).padStart(4,'0');
    return `${prefix}-${d}-${n}`;
  };

  const save = async () => {
    if (!form.product||!form.qty) return alert('Product and Quantity are required.');
    setSaving(true);
    const prod = products.find(p=>p.name===form.product);
    const prefix = prod?.prefix||'VPE';
    const labour  = Number(form.labour_cost)||0;
    const pkg     = Number(form.pkg_cost)||0;
    const util    = Number(form.util_cost)||0;
    const total   = labour+pkg+util;
    const qty     = Number(form.qty)||1;
    const payload = {
      ...form,
      qty, labour_cost:labour, pkg_cost:pkg, util_cost:util,
      total_cost:total,
      cost_per_unit:Number((total/qty).toFixed(2)),
      batch_id: genBatchId(prefix, form.date),
      expiry_date: addExpiryYears(form.mfg_date||form.date),
    };
    try {
      const { db } = await import('@/lib/supabase');
      const row = await db.addProduction(payload).catch(()=>null);
      setProduction(prev=>[...prev, row||{...payload,id:Date.now()}]);
      setModal(false);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this production record?')) return;
    try { const { db } = await import('@/lib/supabase'); await db.deleteProduction(id).catch(()=>{}); } catch(e){}
    setProduction(prev=>prev.filter(p=>p.id!==id));
  };

  const updateQC = async (id, qc_status) => {
    try { const { db } = await import('@/lib/supabase'); await db.updateProduction(id,{qc_status}).catch(()=>{}); } catch(e){}
    setProduction(prev=>prev.map(p=>p.id===id?{...p,qc_status}:p));
  };

  const totalUnits = production.reduce((s,p)=>s+(p.qty||0),0);
  const totalCost  = production.reduce((s,p)=>s+(p.total_cost||0),0);
  const passRate   = production.length ? Math.round(production.filter(p=>p.qc_status==='Pass').length/production.length*100) : 0;

  const TH = ({children}) => <th style={{background:'#165C35',color:'#fff',padding:'9px 12px',textAlign:'left',fontSize:11,textTransform:'uppercase',whiteSpace:'nowrap'}}>{children}</th>;
  const TD = ({children,bold,green}) => <td style={{padding:'9px 12px',fontWeight:bold?700:400,color:green?'#165C35':'#1A1A1A',verticalAlign:'middle'}}>{children}</td>;

  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['log','🏭 Production Log'],['batches','📋 Batch Tracking'],['qc','🔬 QC Log']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,
              background:tab===k?'#1F6F43':'#eee',color:tab===k?'#fff':'#1A1A1A'}}>
            {l}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        {[
          ['Total Batches',    production.length, '#165C35','#E8F5EE'],
          ['Total Units',      totalUnits,         '#165C35','#E8F5EE'],
          ['Total Prod. Cost', fmt(totalCost),      '#7D4E00','#FDF6E3'],
          ['QC Pass Rate',     passRate+'%',        '#165C35','#E8F5EE'],
        ].map(([l,v,c,bg])=>(
          <div key={l} style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${c}`}}>
            <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>{l}</div>
            <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>

      {/* PRODUCTION LOG */}
      {tab==='log'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14}}>🏭 Production Log</span>
            <Btn small color='gold' onClick={()=>{setForm({...blank});setModal(true);}}>+ New Batch</Btn>
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr>
                <TH>Batch ID</TH><TH>Date</TH><TH>Product</TH><TH>Qty</TH>
                <TH>MFG Date</TH><TH>Expiry</TH><TH>Labour</TH><TH>Pkg</TH>
                <TH>Utility</TH><TH>Total Cost</TH><TH>Cost/Unit</TH>
                <TH>QC Status</TH><TH>Approved</TH><TH>Actions</TH>
              </tr></thead>
              <tbody>
                {production.map((p,i)=>(
                  <tr key={p.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                    <TD><code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4}}>{p.batch_id}</code></TD>
                    <TD>{p.date}</TD>
                    <TD bold>{p.product}</TD>
                    <TD>{p.qty}</TD>
                    <TD>{p.mfg_date}</TD>
                    <TD>{p.expiry_date||'—'}</TD>
                    <TD>{fmt(p.labour_cost)}</TD>
                    <TD>{fmt(p.pkg_cost)}</TD>
                    <TD>{fmt(p.util_cost)}</TD>
                    <TD bold green>{fmt(p.total_cost)}</TD>
                    <TD>{fmt(p.cost_per_unit)}</TD>
                    <TD><Badge label={p.qc_status} color={p.qc_status==='Pass'?'green':p.qc_status==='Fail'?'red':'amber'}/></TD>
                    <TD>{p.approved_by}</TD>
                    <td style={{padding:'9px 12px'}}>
                      <div style={{display:'flex',gap:4}}>
                        <Btn small color='green' onClick={()=>updateQC(p.id,'Pass')}>✅ Pass</Btn>
                        <Btn small color='red'   onClick={()=>updateQC(p.id,'Fail')}>❌ Fail</Btn>
                        <Btn small color='red'   onClick={()=>del(p.id)}>Del</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {production.length===0&&<tr><td colSpan={14} style={{padding:24,textAlign:'center',color:'#888'}}>No production records yet. Click + New Batch to start.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BATCH TRACKING */}
      {tab==='batches'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px'}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14}}>📋 Batch Tracking — NAFDAC Traceability</span>
          </div>
          <div style={{padding:'10px 16px',background:'#EBF5FB',fontSize:13,color:'#1A56DB'}}>
            ℹ️ Every batch is traceable by batch number for full NAFDAC compliance.
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <TH>Batch Number</TH><TH>Product</TH><TH>Date</TH>
                <TH>Units Produced</TH><TH>MFG Date</TH><TH>Expiry Date</TH>
                <TH>QC Status</TH><TH>Approved By</TH>
              </tr></thead>
              <tbody>
                {production.map((p,i)=>(
                  <tr key={p.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                    <td style={{padding:'10px 14px'}}><code style={{fontSize:11,background:'#FDF6E3',padding:'2px 6px',borderRadius:4}}>{p.batch_id}</code></td>
                    <TD bold>{p.product}</TD>
                    <TD>{p.date}</TD>
                    <TD>{p.qty}</TD>
                    <TD>{p.mfg_date}</TD>
                    <TD>{p.expiry_date||'—'}</TD>
                    <TD><Badge label={p.qc_status} color={p.qc_status==='Pass'?'green':p.qc_status==='Fail'?'red':'amber'}/></TD>
                    <TD>{p.approved_by}</TD>
                  </tr>
                ))}
                {production.length===0&&<tr><td colSpan={8} style={{padding:24,textAlign:'center',color:'#888'}}>No batches recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QC LOG */}
      {tab==='qc'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px'}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14}}>🔬 Quality Control Log</span>
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <TH>Batch ID</TH><TH>Product</TH><TH>Date</TH>
                <TH>Qty</TH><TH>Total Cost</TH><TH>Cost/Unit</TH>
                <TH>QC Status</TH><TH>Approved By</TH><TH>Update QC</TH>
              </tr></thead>
              <tbody>
                {production.map((p,i)=>(
                  <tr key={p.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                    <td style={{padding:'10px 14px'}}><code style={{fontSize:11,background:'#FDF6E3',padding:'2px 6px',borderRadius:4}}>{p.batch_id}</code></td>
                    <TD bold>{p.product}</TD>
                    <TD>{p.date}</TD>
                    <TD>{p.qty}</TD>
                    <TD bold green>{fmt(p.total_cost)}</TD>
                    <TD>{fmt(p.cost_per_unit)}</TD>
                    <TD><Badge label={p.qc_status} color={p.qc_status==='Pass'?'green':p.qc_status==='Fail'?'red':'amber'}/></TD>
                    <TD>{p.approved_by}</TD>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{display:'flex',gap:4}}>
                        <Btn small color='green' onClick={()=>updateQC(p.id,'Pass')}>✅ Pass</Btn>
                        <Btn small color='red'   onClick={()=>updateQC(p.id,'Fail')}>❌ Fail</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {production.length===0&&<tr><td colSpan={9} style={{padding:24,textAlign:'center',color:'#888'}}>No QC records yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW BATCH MODAL */}
      {modal&&(
        <Modal title='New Production Batch' onClose={()=>setModal(false)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Production Date' type='date' value={form.date} onChange={v=>f('date',v)}/>
            <Select label='Product *' value={form.product} onChange={v=>f('product',v)} options={products.map(p=>p.name)}/>
            <Input label='Quantity Produced (units) *' type='number' value={form.qty} onChange={v=>f('qty',v)}/>
            <Input label='Manufacturing Date' type='date' value={form.mfg_date} onChange={v=>f('mfg_date',v)}/>
            <Input label='Labour Cost (₦)' type='number' value={form.labour_cost} onChange={v=>f('labour_cost',v)}/>
            <Input label='Packaging Cost (₦)' type='number' value={form.pkg_cost} onChange={v=>f('pkg_cost',v)}/>
            <Input label='Utility Cost (₦)' type='number' value={form.util_cost} onChange={v=>f('util_cost',v)}/>
            <Input label='Produced By' value={form.produced_by} onChange={v=>f('produced_by',v)}/>
            <Input label='Approved By' value={form.approved_by} onChange={v=>f('approved_by',v)}/>
            <Select label='QC Status' value={form.qc_status} onChange={v=>f('qc_status',v)} options={['Pass','Fail','Pending']}/>
          </div>
          {form.qty&&(
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}}>
              Total Cost: <strong style={{color:'#165C35'}}>{fmt((Number(form.labour_cost)||0)+(Number(form.pkg_cost)||0)+(Number(form.util_cost)||0))}</strong>
              {' '}| Cost per unit: <strong style={{color:'#165C35'}}>{fmt(((Number(form.labour_cost)||0)+(Number(form.pkg_cost)||0)+(Number(form.util_cost)||0))/Number(form.qty))}</strong>
              {' '}| Batch ID will be: <strong style={{color:'#D4A017'}}>{genBatchId(products.find(p=>p.name===form.product)?.prefix||'VPE', form.date)}</strong>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={save} color='green' disabled={saving}>{saving?'Saving…':'Record Batch'}</Btn>
            <Btn onClick={()=>setModal(false)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
