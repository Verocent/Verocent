'use client';
import { useState } from 'react';

const fmt   = n  => `₦${Number(n||0).toLocaleString()}`;
const today = () => new Date().toISOString().split('T')[0];

function Badge({ label, color='green' }) {
  const map = {
    green:{b:'#E8F5EE',t:'#165C35'}, red:{b:'#FADBD8',t:'#C0392B'},
    amber:{b:'#FEF9E7',t:'#E67E22'}, gold:{b:'#FDF6E3',t:'#7D4E00'},
    blue:{b:'#EBF5FB',t:'#1A56DB'},
  };
  const s = map[color]||map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bg = {green:'#1F6F43',red:'#C0392B',gold:'#D4A017',blue:'#1A56DB',amber:'#E67E22',grey:'#e0e0e0'}[color]||'#1F6F43';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:outline?'transparent':bg,color:outline?bg:'#fff',
        border:outline?`2px solid ${bg}`:'none',borderRadius:7,
        padding:small?'4px 10px':'8px 16px',fontWeight:700,
        fontSize:small?11:13,cursor:disabled?'not-allowed':'pointer',
        fontFamily:'inherit',opacity:disabled?.7:1,whiteSpace:'nowrap'}}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type='text', placeholder='' }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
        textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,padding:'8px 10px',
          fontSize:13,boxSizing:'border-box',fontFamily:'inherit'}}/>
    </div>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
        textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{label}</label>}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,padding:'8px 10px',
          fontSize:13,background:'#fff',fontFamily:'inherit'}}>
        <option value=''>— Select —</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, rows=3, placeholder='' }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
        textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{label}</label>}
      <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,padding:'8px 10px',
          fontSize:13,boxSizing:'border-box',fontFamily:'inherit',resize:'vertical'}}/>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:720,
        maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',
          justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0'}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:15,fontFamily:'sans-serif'}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

function KPI({ label, value, color='#165C35', bg='#E8F5EE' }) {
  return (
    <div style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${color}`}}>
      <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color,fontFamily:'sans-serif'}}>{value}</div>
    </div>
  );
}

const addYears = (date,yrs=2) => {
  if(!date) return '';
  const d = new Date(date);
  d.setFullYear(d.getFullYear()+yrs);
  return d.toISOString().split('T')[0];
};

const blankBatch = {
  date:today(), product:'', qty:'', mfg_date:today(),
  labour_cost:'5000', pkg_cost:'500', util_cost:'2000',
  produced_by:'', approved_by:'Veronica', qc_status:'Pending', notes:''
};

const blankQC = {
  batch_id:'', product:'', qc_date:today(),
  qc_inspector:'', ph_level:'', viscosity:'', appearance:'',
  odour:'', microbiological:'', packaging_integrity:'',
  qc_status:'Pending', qc_notes:'', approved_by:'Veronica'
};

export default function Production({ production=[], setProduction, products=[] }) {
  const [tab,      setTab]    = useState('log');
  const [modal,    setModal]  = useState(null); // 'add-batch'|'edit-batch'|'add-qc'|'edit-qc'|'view-batch'
  const [form,     setForm]   = useState({});
  const [saving,   setSaving] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  // ── Generate batch ID ─────────────────────────────────
  const genBatchId = (product, date) => {
    const p = products.find(x=>x.name===product);
    const prefix = p?.prefix||'VPE';
    const d = (date||today()).replace(/-/g,'');
    const n = String(production.length+1).padStart(4,'0');
    return `${prefix}-${d}-${n}`;
  };

  // ── Save batch ────────────────────────────────────────
  const saveBatch = async () => {
    if(!form.product||!form.qty) return alert('Product and Quantity are required.');
    setSaving(true);
    const labour = Number(form.labour_cost)||0;
    const pkg    = Number(form.pkg_cost)||0;
    const util   = Number(form.util_cost)||0;
    const total  = labour+pkg+util;
    const qty    = Number(form.qty)||1;
    const payload = {
      ...form,
      qty, labour_cost:labour, pkg_cost:pkg, util_cost:util,
      total_cost:total,
      cost_per_unit:Number((total/qty).toFixed(2)),
      batch_id: form.batch_id || genBatchId(form.product, form.date),
      expiry_date: addYears(form.mfg_date||form.date),
      id: form.id || Date.now(),
    };
    try {
      const { db } = await import('@/lib/supabase');
      if(modal==='add-batch') {
        const row = await db.addProduction(payload).catch(()=>null);
        setProduction(prev=>[...prev, row||payload]);
      } else {
        await db.updateProduction(form.id, payload).catch(()=>{});
        setProduction(prev=>prev.map(p=>p.id===form.id?payload:p));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  // ── Delete batch ──────────────────────────────────────
  const delBatch = async (id, batchId) => {
    if(!window.confirm(`Delete batch ${batchId}? This cannot be undone.`)) return;
    try { const { db } = await import('@/lib/supabase'); await db.deleteProduction(id).catch(()=>{}); } catch(e){}
    setProduction(prev=>prev.filter(p=>p.id!==id));
  };

  // ── Update QC status inline ───────────────────────────
  const updateQC = async (id, qc_status) => {
    try { const { db } = await import('@/lib/supabase'); await db.updateProduction(id,{qc_status}).catch(()=>{}); } catch(e){}
    setProduction(prev=>prev.map(p=>p.id===id?{...p,qc_status}:p));
  };

  // ── Update QC notes ───────────────────────────────────
  const saveQCUpdate = async () => {
    if(!form.id) return;
    setSaving(true);
    const payload = { ...production.find(p=>p.id===form.id), ...form };
    try {
      const { db } = await import('@/lib/supabase');
      await db.updateProduction(form.id, payload).catch(()=>{});
      setProduction(prev=>prev.map(p=>p.id===form.id?payload:p));
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  // ── Stats ─────────────────────────────────────────────
  const totalUnits   = production.reduce((s,p)=>s+(p.qty||0),0);
  const totalCost    = production.reduce((s,p)=>s+(p.total_cost||0),0);
  const passRate     = production.length ? Math.round(production.filter(p=>p.qc_status==='Pass').length/production.length*100) : 0;
  const failCount    = production.filter(p=>p.qc_status==='Fail').length;
  const pendingCount = production.filter(p=>p.qc_status==='Pending').length;

  // ── Table styles ──────────────────────────────────────
  const TH = ({children,center}) => (
    <th style={{background:'#165C35',color:'#fff',padding:'9px 12px',textAlign:center?'center':'left',
      fontSize:11,textTransform:'uppercase',whiteSpace:'nowrap',fontFamily:'sans-serif'}}>{children}</th>
  );
  const TD = ({children,center,bold,green,red}) => (
    <td style={{padding:'9px 12px',textAlign:center?'center':'left',fontWeight:bold?700:400,
      color:green?'#165C35':red?'#C0392B':'#1A1A1A',verticalAlign:'middle',fontFamily:'sans-serif',fontSize:13}}>
      {children}
    </td>
  );

  // ── Export CSV ────────────────────────────────────────
  const exportCSV = (data, filename) => {
    if(!data.length) return alert('No data to export.');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(r=>Object.values(r).map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([headers+'\n'+rows],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['log','🏭 Production Log'],['batches','📋 Batch Tracking'],['qc','🔬 QC Log']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',
              fontWeight:700,fontSize:13,fontFamily:'sans-serif',
              background:tab===k?'#1F6F43':'#eee',color:tab===k?'#fff':'#1A1A1A'}}>
            {l}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        <KPI label='Total Batches'     value={production.length}/>
        <KPI label='Total Units'       value={totalUnits}/>
        <KPI label='Total Prod. Cost'  value={fmt(totalCost)}    color='#7D4E00' bg='#FDF6E3'/>
        <KPI label='QC Pass Rate'      value={passRate+'%'}      color={passRate>=95?'#165C35':'#C0392B'} bg={passRate>=95?'#E8F5EE':'#FADBD8'}/>
        <KPI label='QC Pending'        value={pendingCount}       color='#E67E22' bg='#FEF9E7'/>
        <KPI label='QC Failed'         value={failCount}          color={failCount>0?'#C0392B':'#165C35'} bg={failCount>0?'#FADBD8':'#E8F5EE'}/>
      </div>

      {/* ══ PRODUCTION LOG TAB ══ */}
      {tab==='log'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>🏭 Production Log</span>
            <div style={{display:'flex',gap:8}}>
              <Btn small color='gold' onClick={()=>{setForm({...blankBatch});setModal('add-batch');}}>+ New Batch</Btn>
              <Btn small color='blue' onClick={()=>exportCSV(production,'production-log.csv')}>⬇️ Export CSV</Btn>
            </div>
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            {production.length===0?(
              <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                <div style={{fontSize:40,marginBottom:12}}>🏭</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>No production batches yet</div>
                <div style={{fontSize:13,marginBottom:16}}>Click + New Batch to record your first production run</div>
                <Btn color='gold' onClick={()=>{setForm({...blankBatch});setModal('add-batch');}}>+ Record First Batch</Btn>
              </div>
            ):(
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead><tr>
                  <TH>Batch ID</TH><TH>Date</TH><TH>Product</TH><TH center>Qty</TH>
                  <TH>MFG Date</TH><TH>Expiry</TH><TH center>Total Cost</TH>
                  <TH center>Cost/Unit</TH><TH center>QC Status</TH><TH>Approved By</TH><TH>Actions</TH>
                </tr></thead>
                <tbody>
                  {[...production].reverse().map((p,i)=>(
                    <tr key={p.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                      <TD><code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4,fontWeight:700}}>{p.batch_id}</code></TD>
                      <TD>{p.date}</TD>
                      <TD bold>{p.product}</TD>
                      <TD center>{p.qty}</TD>
                      <TD>{p.mfg_date}</TD>
                      <TD>{p.expiry_date||'—'}</TD>
                      <TD center green bold>{fmt(p.total_cost)}</TD>
                      <TD center>{fmt(p.cost_per_unit)}</TD>
                      <TD center><Badge label={p.qc_status} color={p.qc_status==='Pass'?'green':p.qc_status==='Fail'?'red':'amber'}/></TD>
                      <TD>{p.approved_by}</TD>
                      <td style={{padding:'9px 12px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          <Btn small color='blue' onClick={()=>{setViewItem(p);setModal('view-batch');}}>👁 View</Btn>
                          <Btn small color='blue' onClick={()=>{setForm({...p,qty:String(p.qty),labour_cost:String(p.labour_cost),pkg_cost:String(p.pkg_cost),util_cost:String(p.util_cost)});setModal('edit-batch');}}>✏️ Edit</Btn>
                          <Btn small color='red'  onClick={()=>delBatch(p.id,p.batch_id)}>🗑 Del</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══ BATCH TRACKING TAB ══ */}
      {tab==='batches'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>📋 Batch Tracking — NAFDAC Traceability</span>
            <div style={{display:'flex',gap:8}}>
              <Btn small color='gold' onClick={()=>{setForm({...blankBatch});setModal('add-batch');}}>+ New Batch</Btn>
              <Btn small color='blue' onClick={()=>exportCSV(production,'batch-tracking.csv')}>⬇️ Export</Btn>
            </div>
          </div>
          <div style={{padding:'10px 16px',background:'#EBF5FB',fontSize:13,color:'#1A56DB',fontFamily:'sans-serif'}}>
            ℹ️ Every batch is traceable by batch number for full NAFDAC compliance. Use the buttons to view, edit, or delete any batch record.
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            {production.length===0?(
              <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                <div style={{fontSize:40,marginBottom:12}}>📋</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>No batch records yet</div>
                <Btn color='gold' onClick={()=>{setForm({...blankBatch});setModal('add-batch');}}>+ Record First Batch</Btn>
              </div>
            ):(
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
                <thead><tr>
                  <TH>Batch Number</TH><TH>Product</TH><TH>Production Date</TH>
                  <TH center>Units</TH><TH>MFG Date</TH><TH>Expiry Date</TH>
                  <TH center>QC Status</TH><TH>Approved By</TH><TH>Actions</TH>
                </tr></thead>
                <tbody>
                  {[...production].reverse().map((p,i)=>(
                    <tr key={p.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                      <td style={{padding:'10px 14px'}}>
                        <code style={{fontSize:11,background:'#FDF6E3',padding:'2px 6px',borderRadius:4,fontWeight:700,color:'#7D4E00'}}>{p.batch_id}</code>
                      </td>
                      <TD bold>{p.product}</TD>
                      <TD>{p.date}</TD>
                      <TD center>{p.qty}</TD>
                      <TD>{p.mfg_date}</TD>
                      <TD>{p.expiry_date||'—'}</TD>
                      <TD center><Badge label={p.qc_status} color={p.qc_status==='Pass'?'green':p.qc_status==='Fail'?'red':'amber'}/></TD>
                      <TD>{p.approved_by}</TD>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          <Btn small color='blue'  onClick={()=>{setViewItem(p);setModal('view-batch');}}>👁 View</Btn>
                          <Btn small color='blue'  onClick={()=>{setForm({...p,qty:String(p.qty),labour_cost:String(p.labour_cost),pkg_cost:String(p.pkg_cost),util_cost:String(p.util_cost)});setModal('edit-batch');}}>✏️ Edit</Btn>
                          <Btn small color='green' onClick={()=>updateQC(p.id,'Pass')}>✅ Pass</Btn>
                          <Btn small color='red'   onClick={()=>updateQC(p.id,'Fail')}>❌ Fail</Btn>
                          <Btn small color='red'   onClick={()=>delBatch(p.id,p.batch_id)}>🗑 Del</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══ QC LOG TAB ══ */}
      {tab==='qc'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>🔬 Quality Control Log</span>
            <div style={{display:'flex',gap:8}}>
              <Btn small color='gold' onClick={()=>{setForm({...blankBatch});setModal('add-batch');}}>+ New Batch</Btn>
              <Btn small color='blue' onClick={()=>exportCSV(production,'qc-log.csv')}>⬇️ Export</Btn>
            </div>
          </div>

          {/* QC Status summary bar */}
          <div style={{display:'flex',gap:0,borderBottom:'1px solid #C9C9C0'}}>
            {[
              ['✅ Passed',production.filter(p=>p.qc_status==='Pass').length,'#E8F5EE','#165C35'],
              ['⏳ Pending',pendingCount,'#FEF9E7','#E67E22'],
              ['❌ Failed',failCount,'#FADBD8','#C0392B'],
            ].map(([l,v,bg,c])=>(
              <div key={l} style={{flex:1,padding:'12px 16px',background:bg,textAlign:'center',borderRight:'1px solid #C9C9C0'}}>
                <div style={{fontSize:11,color:'#666',fontFamily:'sans-serif',marginBottom:4}}>{l}</div>
                <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:'sans-serif'}}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{padding:20,overflowX:'auto'}}>
            {production.length===0?(
              <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                <div style={{fontSize:40,marginBottom:12}}>🔬</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>No QC records yet</div>
                <div style={{fontSize:13,marginBottom:16}}>Record a production batch first to start QC logging</div>
                <Btn color='gold' onClick={()=>{setForm({...blankBatch});setModal('add-batch');}}>+ Record First Batch</Btn>
              </div>
            ):(
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
                <thead><tr>
                  <TH>Batch ID</TH><TH>Product</TH><TH>Date</TH>
                  <TH center>Qty</TH><TH center>Total Cost</TH>
                  <TH center>QC Status</TH><TH>Approved By</TH><TH>Notes</TH><TH>Actions</TH>
                </tr></thead>
                <tbody>
                  {[...production].reverse().map((p,i)=>(
                    <tr key={p.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                      <td style={{padding:'10px 12px'}}>
                        <code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4,fontWeight:700,color:'#7D4E00'}}>{p.batch_id}</code>
                      </td>
                      <TD bold>{p.product}</TD>
                      <TD>{p.date}</TD>
                      <TD center>{p.qty}</TD>
                      <TD center green bold>{fmt(p.total_cost)}</TD>
                      <TD center><Badge label={p.qc_status} color={p.qc_status==='Pass'?'green':p.qc_status==='Fail'?'red':'amber'}/></TD>
                      <TD>{p.approved_by}</TD>
                      <TD>{p.notes||'—'}</TD>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {/* Quick QC buttons */}
                          {p.qc_status!=='Pass'&&<Btn small color='green' onClick={()=>updateQC(p.id,'Pass')}>✅ Pass</Btn>}
                          {p.qc_status!=='Fail'&&<Btn small color='red'   onClick={()=>updateQC(p.id,'Fail')}>❌ Fail</Btn>}
                          {p.qc_status!=='Pending'&&<Btn small color='amber' onClick={()=>updateQC(p.id,'Pending')}>⏳ Pending</Btn>}
                          {/* Edit QC notes */}
                          <Btn small color='blue' onClick={()=>{
                            setForm({id:p.id,qc_status:p.qc_status,notes:p.notes||'',approved_by:p.approved_by,batch_id:p.batch_id,product:p.product});
                            setModal('edit-qc');
                          }}>✏️ Edit Notes</Btn>
                          {/* Delete */}
                          <Btn small color='red' onClick={()=>delBatch(p.id,p.batch_id)}>🗑 Del</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL: VIEW BATCH ══ */}
      {modal==='view-batch'&&viewItem&&(
        <Modal title={`Batch Details — ${viewItem.batch_id}`} onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            {[
              ['Batch ID',viewItem.batch_id],['Product',viewItem.product],
              ['Production Date',viewItem.date],['Qty Produced',viewItem.qty+' units'],
              ['MFG Date',viewItem.mfg_date],['Expiry Date',viewItem.expiry_date||'—'],
              ['Labour Cost',fmt(viewItem.labour_cost)],['Packaging Cost',fmt(viewItem.pkg_cost)],
              ['Utility Cost',fmt(viewItem.util_cost)],['Total Cost',fmt(viewItem.total_cost)],
              ['Cost per Unit',fmt(viewItem.cost_per_unit)],['Produced By',viewItem.produced_by||'—'],
              ['Approved By',viewItem.approved_by],['QC Status',viewItem.qc_status],
            ].map(([l,v])=>(
              <div key={l} style={{background:'#F9F9F7',borderRadius:8,padding:'10px 14px'}}>
                <div style={{fontSize:10,color:'#888',textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:'#165C35',fontFamily:'sans-serif'}}>{v}</div>
              </div>
            ))}
          </div>
          {viewItem.notes&&(
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'12px 16px',marginBottom:16,fontFamily:'sans-serif',fontSize:13}}>
              <strong>Notes:</strong> {viewItem.notes}
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <Btn color='blue' onClick={()=>{setForm({...viewItem,qty:String(viewItem.qty),labour_cost:String(viewItem.labour_cost),pkg_cost:String(viewItem.pkg_cost),util_cost:String(viewItem.util_cost)});setModal('edit-batch');}}>✏️ Edit This Batch</Btn>
            <Btn color='green' onClick={()=>updateQC(viewItem.id,'Pass')}>✅ Mark QC Pass</Btn>
            <Btn color='red' outline onClick={()=>setModal(null)}>Close</Btn>
          </div>
        </Modal>
      )}

      {/* ══ MODAL: ADD / EDIT BATCH ══ */}
      {(modal==='add-batch'||modal==='edit-batch')&&(
        <Modal title={modal==='add-batch'?'🏭 Record New Production Batch':'✏️ Edit Production Batch'} onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Production Date' type='date' value={form.date} onChange={v=>f('date',v)}/>
            <Select label='Product *' value={form.product} onChange={v=>f('product',v)} options={products.map(p=>p.name)}/>
            <Input label='Quantity Produced (units) *' type='number' value={form.qty} onChange={v=>f('qty',v)}/>
            <Input label='Manufacturing Date' type='date' value={form.mfg_date} onChange={v=>f('mfg_date',v)}/>
            <Input label='Labour Cost (₦)' type='number' value={form.labour_cost} onChange={v=>f('labour_cost',v)}/>
            <Input label='Packaging Cost (₦)' type='number' value={form.pkg_cost} onChange={v=>f('pkg_cost',v)}/>
            <Input label='Utility Cost (₦)' type='number' value={form.util_cost} onChange={v=>f('util_cost',v)}/>
            <Input label='Produced By' value={form.produced_by} onChange={v=>f('produced_by',v)} placeholder='Staff name'/>
            <Input label='Approved By' value={form.approved_by} onChange={v=>f('approved_by',v)}/>
            <Select label='QC Status' value={form.qc_status} onChange={v=>f('qc_status',v)} options={['Pass','Fail','Pending']}/>
          </div>
          <Textarea label='Notes / Remarks' value={form.notes} onChange={v=>f('notes',v)} placeholder='Any production notes, issues, or observations...'/>

          {/* Cost preview */}
          {form.qty&&(Number(form.labour_cost)||Number(form.pkg_cost)||Number(form.util_cost))?(
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'12px 16px',marginBottom:16,fontFamily:'sans-serif',fontSize:13}}>
              <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                <span>Total Cost: <strong style={{color:'#165C35'}}>{fmt((Number(form.labour_cost)||0)+(Number(form.pkg_cost)||0)+(Number(form.util_cost)||0))}</strong></span>
                <span>Cost/Unit: <strong style={{color:'#165C35'}}>{fmt(((Number(form.labour_cost)||0)+(Number(form.pkg_cost)||0)+(Number(form.util_cost)||0))/Number(form.qty||1))}</strong></span>
                <span>Batch ID: <strong style={{color:'#D4A017'}}>{modal==='edit-batch'?form.batch_id:genBatchId(form.product,form.date)}</strong></span>
                <span>Expiry: <strong style={{color:'#165C35'}}>{addYears(form.mfg_date||form.date)}</strong></span>
              </div>
            </div>
          ):null}

          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveBatch} color='green' disabled={saving}>{saving?'Saving…':modal==='add-batch'?'Record Batch':'Save Changes'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* ══ MODAL: EDIT QC NOTES ══ */}
      {modal==='edit-qc'&&(
        <Modal title={`🔬 Edit QC Record — ${form.batch_id}`} onClose={()=>setModal(null)}>
          <div style={{background:'#E8F5EE',borderRadius:8,padding:'12px 16px',marginBottom:16,fontFamily:'sans-serif',fontSize:13}}>
            <strong>Batch:</strong> {form.batch_id} &nbsp;|&nbsp; <strong>Product:</strong> {form.product}
          </div>
          <Select label='QC Status *' value={form.qc_status} onChange={v=>f('qc_status',v)} options={['Pass','Fail','Pending']}/>
          <Input label='Approved By' value={form.approved_by} onChange={v=>f('approved_by',v)}/>
          <Textarea label='QC Notes / Observations' value={form.notes} onChange={v=>f('notes',v)}
            placeholder='Record your QC findings — pH level, viscosity, appearance, odour, microbiological results, packaging check...' rows={5}/>

          {/* QC quick guide */}
          <div style={{background:'#FDF6E3',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:12,fontFamily:'sans-serif',color:'#92400E'}}>
            <strong>QC Checklist reminder:</strong> pH range (Conditioner: 4.0–5.5, Shampoo: 5.0–6.5) · Viscosity · Colour & appearance · Odour · Packaging integrity · Label correctness · Batch number visible
          </div>

          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveQCUpdate} color='green' disabled={saving}>{saving?'Saving…':'Save QC Record'}</Btn>
            <Btn onClick={()=>{ updateQC(form.id,'Pass'); setModal(null); }} color='green' outline>✅ Quick Pass</Btn>
            <Btn onClick={()=>{ updateQC(form.id,'Fail'); setModal(null); }} color='red' outline>❌ Quick Fail</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}