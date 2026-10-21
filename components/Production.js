'use client';
import { useState, useEffect } from 'react';

const today = () => new Date().toISOString().split('T')[0];
const fmt   = n  => `₦${Number(n||0).toLocaleString()}`;

function Badge({ label, color='green' }) {
  const map = {
    green:{b:'#E8F5EE',t:'#165C35'}, red:{b:'#FADBD8',t:'#C0392B'},
    amber:{b:'#FEF9E7',t:'#E67E22'}, gold:{b:'#FDF6E3',t:'#7D4E00'},
    blue:{b:'#EBF5FB',t:'#1A56DB'}, purple:{b:'#F5EEF8',t:'#7D3C98'},
    grey:{b:'#F4F3EE',t:'#555555'},
  };
  const s = map[color] || map.green;
  return (
    <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',
      fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>
      {label}
    </span>
  );
}

function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bg = {green:'#1F6F43',red:'#C0392B',gold:'#D4A017',blue:'#1A56DB',
    amber:'#E67E22',grey:'#e0e0e0',purple:'#7D3C98'}[color]||'#1F6F43';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:outline?'transparent':bg,
        color:outline?bg:color==='grey'?'#333':'#fff',
        border:outline?`2px solid ${bg}`:'none',borderRadius:7,
        padding:small?'4px 10px':'8px 16px',fontWeight:700,
        fontSize:small?11:13,cursor:disabled?'not-allowed':'pointer',
        fontFamily:'inherit',whiteSpace:'nowrap',opacity:disabled?0.6:1}}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type='text', placeholder='', readOnly }) {
  return (
    <div style={{marginBottom:12}}>
      {label && (
        <label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
          textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>
          {label}
        </label>
      )}
      <input type={type} value={value||''} onChange={e=>onChange&&onChange(e.target.value)}
        placeholder={placeholder} readOnly={readOnly}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,
          padding:'8px 10px',fontSize:13,boxSizing:'border-box',fontFamily:'inherit',
          background:readOnly?'#f5f5f5':'#fff'}}/>
    </div>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <div style={{marginBottom:12}}>
      {label && (
        <label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
          textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>
          {label}
        </label>
      )}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,
          padding:'8px 10px',fontSize:13,background:'#fff',fontFamily:'inherit'}}>
        <option value=''>— Select —</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',
        maxWidth:640,maxHeight:'90vh',overflow:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',
          justifyContent:'space-between',alignItems:'center',
          borderRadius:'14px 14px 0 0',position:'sticky',top:0,zIndex:10}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:15,fontFamily:'sans-serif'}}>{title}</span>
          <button onClick={onClose}
            style={{background:'none',border:'none',color:'#fff',fontSize:24,cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

function KPI({ label, value, color='#165C35', bg='#E8F5EE', sub }) {
  return (
    <div style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,
      minWidth:130,borderLeft:`4px solid ${color}`}}>
      <div style={{fontSize:10,color:'#666',textTransform:'uppercase',
        letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color,fontFamily:'sans-serif'}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:'#888',marginTop:3,fontFamily:'sans-serif'}}>{sub}</div>}
    </div>
  );
}

const QC_OPTIONS = ['Pending','Pass','Fail','Rework'];
const QC_COLORS  = { Pass:'green', Fail:'red', Pending:'amber', Rework:'purple' };

const blankBatch = {
  date: today(), product:'', batch_no:'', quantity:'',
  yield_qty:'', status:'In Progress', notes:'',
};

export default function Production({ production=[], setProduction, products=[] }) {
  const [tab,    setTab]    = useState('log');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const f = (k,v) => setForm(p => ({...p,[k]:v}));

  // ── AUTO-GENERATE BATCH NUMBER ──────────────────────────────────────────
  const genBatchNo = (productName) => {
    const product = products.find(p => p.name === productName);
    const prefix  = product?.prefix || 'VPE';
    const d       = new Date();
    const yymmdd  = String(d.getFullYear()).slice(2)
      + String(d.getMonth()+1).padStart(2,'0')
      + String(d.getDate()).padStart(2,'0');
    const seq     = String(production.filter(b => b.product === productName).length + 1).padStart(3,'0');
    return `${prefix}-${yymmdd}-${seq}`;
  };

  // ── SAVE NEW BATCH ─────────────────────────────────────────────────────
  const saveBatch = async () => {
    if (!form.product || !form.quantity)
      return alert('Product and quantity are required.');
    const qty = Number(form.quantity);
    if (isNaN(qty) || qty < 1)
      return alert('Quantity must be a positive number.');

    const batchNo = form.batch_no || genBatchNo(form.product);
    const payload = {
      date:      form.date     || today(),
      product:   form.product,
      batch_no:  batchNo,
      quantity:  qty,
      yield_qty: Number(form.yield_qty) || qty,
      status:    form.status   || 'In Progress',
      qc_status: 'Pending',
      notes:     form.notes    || '',
      created_at: new Date().toISOString(),
    };

    setSaving(true);
    try {
      const { db } = await import('@/lib/supabase');

      // ✅ NO silent catch — if this fails we will know
      const row = await db.addProduction(payload);

      // Use what Supabase returned (it has the real id)
      setProduction(prev => [...prev, row]);
      setModal(null);
      alert(`Batch ${batchNo} saved successfully!`);
    } catch(e) {
      // ✅ Show the real error — never swallow it
      alert(
        'Batch could not be saved to the database.\n\n' +
        'Your data was NOT saved — please try again.\n\n' +
        'Error: ' + e.message
      );
    }
    setSaving(false);
  };

  // ── DELETE BATCH ───────────────────────────────────────────────────────
  const delBatch = async (id, batchNo) => {
    if (!window.confirm(`Delete batch "${batchNo}"? This cannot be undone.`)) return;
    try {
      const { db } = await import('@/lib/supabase');

      // ✅ NO silent catch — if this fails we will know
      await db.deleteProduction(id);
      setProduction(prev => prev.filter(b => b.id !== id));
    } catch(e) {
      alert('Could not delete batch from database.\n\nError: ' + e.message);
    }
  };

  // ── UPDATE QC STATUS ───────────────────────────────────────────────────
  const updateQC = async (id, qc_status) => {
    try {
      const { db } = await import('@/lib/supabase');

      // ✅ NO silent catch — if this fails we will know
      await db.updateProduction(id, { qc_status });
      setProduction(prev => prev.map(b => b.id === id ? { ...b, qc_status } : b));
    } catch(e) {
      alert('Could not update QC status.\n\nError: ' + e.message);
    }
  };

  // ── UPDATE BATCH STATUS ────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      const { db } = await import('@/lib/supabase');
      await db.updateProduction(id, { status });
      setProduction(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch(e) {
      alert('Could not update batch status.\n\nError: ' + e.message);
    }
  };

  // ── TABLE HELPERS ──────────────────────────────────────────────────────
  const TH = ({children, center}) => (
    <th style={{background:'#165C35',color:'#fff',padding:'9px 12px',
      textAlign:center?'center':'left',fontSize:11,textTransform:'uppercase',
      whiteSpace:'nowrap',fontFamily:'sans-serif'}}>{children}</th>
  );
  const TD = ({children, center, bold, green, red}) => (
    <td style={{padding:'9px 12px',textAlign:center?'center':'left',
      fontWeight:bold?700:400,color:green?'#165C35':red?'#C0392B':'#1A1A1A',
      verticalAlign:'middle',fontFamily:'sans-serif',fontSize:13}}>
      {children}
    </td>
  );

  // ── DERIVED STATS ──────────────────────────────────────────────────────
  const totalBatches    = production.length;
  const completedBatches= production.filter(b => b.status === 'Complete').length;
  const inProgressCount = production.filter(b => b.status === 'In Progress').length;
  const qcPassCount     = production.filter(b => b.qc_status === 'Pass').length;
  const totalUnits      = production.reduce((s,b) => s + Number(b.yield_qty||b.quantity||0), 0);

  const filtered = production.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (b.product||'').toLowerCase().includes(q)
      || (b.batch_no||'').toLowerCase().includes(q)
      || (b.status||'').toLowerCase().includes(q)
      || (b.notes||'').toLowerCase().includes(q);
  });

  // Group by product for the Batches tab
  const byProduct = {};
  production.forEach(b => {
    const key = b.product || 'Unknown';
    if (!byProduct[key]) byProduct[key] = [];
    byProduct[key].push(b);
  });

  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[
          ['log',     '📋 Production Log'],
          ['batches', '📦 Batch Summary'],
          ['qc',      '🔬 Quality Control'],
        ].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',
              fontWeight:700,fontSize:13,fontFamily:'sans-serif',
              background:tab===k?'#1F6F43':'#eee',
              color:tab===k?'#fff':'#1A1A1A'}}>
            {l}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        <KPI label='Total Batches'    value={totalBatches}/>
        <KPI label='Completed'        value={completedBatches}
          color={completedBatches>0?'#165C35':'#888'}
          bg={completedBatches>0?'#E8F5EE':'#F4F3EE'}/>
        <KPI label='In Progress'      value={inProgressCount}
          color={inProgressCount>0?'#E67E22':'#888'}
          bg={inProgressCount>0?'#FEF9E7':'#F4F3EE'}/>
        <KPI label='QC Passed'        value={qcPassCount}
          color='#1A56DB' bg='#EBF5FB'/>
        <KPI label='Total Units Made' value={totalUnits.toLocaleString()}
          color='#7D4E00' bg='#FDF6E3'/>
      </div>

      {/* ══ PRODUCTION LOG TAB ══════════════════════════════════════════════ */}
      {tab==='log' && (
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',
            display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>
              📋 Production Log
            </span>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder='Search batches…'
                style={{border:'none',borderRadius:6,padding:'6px 12px',fontSize:12,
                  fontFamily:'sans-serif',minWidth:160}}/>
              <Btn small color='gold' onClick={() => { setForm({...blankBatch}); setModal('add'); }}>
                + Log New Batch
              </Btn>
            </div>
          </div>

          <div style={{padding:20,overflowX:'auto'}}>
            {filtered.length === 0 ? (
              <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                <div style={{fontSize:32,marginBottom:8}}>🏭</div>
                <div style={{fontWeight:700,marginBottom:8}}>
                  {production.length === 0 ? 'No batches recorded yet' : 'No batches match your search'}
                </div>
                {production.length === 0 && (
                  <div style={{marginBottom:16,fontSize:13}}>
                    Start tracking your production runs — every batch saved here
                    is stored permanently in the database.
                  </div>
                )}
                {production.length === 0 && (
                  <Btn color='gold' onClick={() => { setForm({...blankBatch}); setModal('add'); }}>
                    + Log First Batch
                  </Btn>
                )}
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
                <thead>
                  <tr>
                    <TH>Date</TH><TH>Product</TH><TH>Batch No.</TH>
                    <TH center>Target Qty</TH><TH center>Yield Qty</TH>
                    <TH center>Efficiency</TH><TH center>Status</TH>
                    <TH center>QC</TH><TH>Notes</TH><TH>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map((b, i) => {
                    const eff = b.quantity > 0
                      ? Math.round((Number(b.yield_qty||b.quantity)/Number(b.quantity))*100)+'%'
                      : '—';
                    return (
                      <tr key={b.id||i} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                        <TD>{b.date}</TD>
                        <TD bold>{b.product}</TD>
                        <TD>
                          <code style={{fontSize:11,background:'#FDF6E3',
                            padding:'2px 6px',borderRadius:4}}>{b.batch_no}</code>
                        </TD>
                        <TD center>{Number(b.quantity||0).toLocaleString()}</TD>
                        <TD center bold green>{Number(b.yield_qty||b.quantity||0).toLocaleString()}</TD>
                        <TD center>
                          <span style={{fontWeight:700,
                            color:Number(eff)>=95?'#165C35':Number(eff)>=80?'#E67E22':'#C0392B'}}>
                            {eff}
                          </span>
                        </TD>
                        <TD center>
                          <select value={b.status||'In Progress'}
                            onChange={e=>updateStatus(b.id, e.target.value)}
                            style={{border:'1px solid #C9C9C0',borderRadius:6,padding:'3px 6px',
                              fontSize:11,fontFamily:'sans-serif',background:'#fff',cursor:'pointer'}}>
                            {['In Progress','Complete','On Hold','Cancelled'].map(s=>(
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </TD>
                        <TD center>
                          <Badge label={b.qc_status||'Pending'}
                            color={QC_COLORS[b.qc_status]||'amber'}/>
                        </TD>
                        <TD>{b.notes||'—'}</TD>
                        <td style={{padding:'9px 12px'}}>
                          <Btn small color='red'
                            onClick={() => delBatch(b.id, b.batch_no)}>
                            Del
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══ BATCH SUMMARY TAB ═══════════════════════════════════════════════ */}
      {tab==='batches' && (
        <div>
          {Object.keys(byProduct).length === 0 ? (
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #C9C9C0',
              padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
              No production records yet. Log your first batch above.
            </div>
          ) : Object.entries(byProduct).map(([productName, batches]) => {
            const totalQty   = batches.reduce((s,b) => s+Number(b.quantity||0), 0);
            const totalYield = batches.reduce((s,b) => s+Number(b.yield_qty||b.quantity||0), 0);
            const passCount  = batches.filter(b => b.qc_status==='Pass').length;
            const avgEff     = totalQty > 0 ? Math.round((totalYield/totalQty)*100) : 0;

            return (
              <div key={productName} style={{background:'#fff',borderRadius:14,
                border:'1px solid #C9C9C0',overflow:'hidden',marginBottom:16}}>
                <div style={{background:'#1B2631',padding:'12px 20px',
                  display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                  <div>
                    <span style={{color:'#D4A017',fontWeight:800,fontSize:15,fontFamily:'sans-serif'}}>
                      {productName}
                    </span>
                    <span style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginLeft:12,fontFamily:'sans-serif'}}>
                      {batches.length} batch{batches.length!==1?'es':''}
                    </span>
                  </div>
                  <div style={{display:'flex',gap:20,color:'#fff',fontSize:12,fontFamily:'sans-serif'}}>
                    <span>Total: <strong>{totalYield.toLocaleString()} units</strong></span>
                    <span>Avg efficiency: <strong style={{color:avgEff>=95?'#4CD964':avgEff>=80?'#FFD60A':'#FF453A'}}>
                      {avgEff}%
                    </strong></span>
                    <span>QC passed: <strong>{passCount}/{batches.length}</strong></span>
                  </div>
                </div>
                <div style={{padding:20,overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr>
                      <TH>Batch No.</TH><TH>Date</TH>
                      <TH center>Target</TH><TH center>Yield</TH>
                      <TH center>Efficiency</TH><TH center>Status</TH>
                      <TH center>QC</TH>
                    </tr></thead>
                    <tbody>
                      {[...batches].reverse().map((b,i) => {
                        const eff = b.quantity>0
                          ? Math.round((Number(b.yield_qty||b.quantity)/Number(b.quantity))*100)
                          : 100;
                        return (
                          <tr key={b.id||i} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                            <TD>
                              <code style={{fontSize:11,background:'#FDF6E3',
                                padding:'2px 6px',borderRadius:4}}>{b.batch_no}</code>
                            </TD>
                            <TD>{b.date}</TD>
                            <TD center>{Number(b.quantity||0).toLocaleString()}</TD>
                            <TD center bold green>{Number(b.yield_qty||b.quantity||0).toLocaleString()}</TD>
                            <TD center>
                              <span style={{fontWeight:700,
                                color:eff>=95?'#165C35':eff>=80?'#E67E22':'#C0392B'}}>
                                {eff}%
                              </span>
                            </TD>
                            <TD center>
                              <Badge label={b.status||'In Progress'}
                                color={b.status==='Complete'?'green':b.status==='In Progress'?'amber':'grey'}/>
                            </TD>
                            <TD center>
                              <Badge label={b.qc_status||'Pending'} color={QC_COLORS[b.qc_status]||'amber'}/>
                            </TD>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ QUALITY CONTROL TAB ═════════════════════════════════════════════ */}
      {tab==='qc' && (
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#7D3C98',padding:'12px 20px',
            display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>
              🔬 Quality Control — All Batches
            </span>
            <div style={{display:'flex',gap:12,color:'#fff',fontSize:12,fontFamily:'sans-serif'}}>
              <span>Pass: <strong>{production.filter(b=>b.qc_status==='Pass').length}</strong></span>
              <span>Fail: <strong style={{color:'#FF453A'}}>{production.filter(b=>b.qc_status==='Fail').length}</strong></span>
              <span>Pending: <strong>{production.filter(b=>!b.qc_status||b.qc_status==='Pending').length}</strong></span>
            </div>
          </div>
          <div style={{padding:'12px 20px',background:'#F5EEF8',
            borderBottom:'1px solid #E8D5F8',fontSize:13,fontFamily:'sans-serif',color:'#7D3C98'}}>
            <strong>How to use:</strong> Select a QC result from the dropdown for each batch.
            QC status is saved immediately to the database — no refresh needed.
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            {production.length === 0 ? (
              <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                No batches to review. Log production batches first.
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
                <thead><tr>
                  <TH>Date</TH><TH>Product</TH><TH>Batch No.</TH>
                  <TH center>Yield Qty</TH><TH center>Prod Status</TH>
                  <TH center>Set QC Result</TH><TH>Notes</TH>
                </tr></thead>
                <tbody>
                  {[...production].reverse().map((b,i) => (
                    <tr key={b.id||i}
                      style={{background:
                        b.qc_status==='Pass'?'#E8F5EE':
                        b.qc_status==='Fail'?'#FADBD8':
                        i%2===0?'#F9F9F7':'#fff'}}>
                      <TD>{b.date}</TD>
                      <TD bold>{b.product}</TD>
                      <TD>
                        <code style={{fontSize:11,background:'#FDF6E3',
                          padding:'2px 6px',borderRadius:4}}>{b.batch_no}</code>
                      </TD>
                      <TD center bold green>{Number(b.yield_qty||b.quantity||0).toLocaleString()}</TD>
                      <TD center>
                        <Badge label={b.status||'In Progress'}
                          color={b.status==='Complete'?'green':b.status==='In Progress'?'amber':'grey'}/>
                      </TD>
                      <td style={{padding:'9px 12px',textAlign:'center'}}>
                        <select
                          value={b.qc_status||'Pending'}
                          onChange={e => updateQC(b.id, e.target.value)}
                          style={{border:'2px solid',borderRadius:7,padding:'5px 10px',
                            fontWeight:700,fontSize:12,fontFamily:'sans-serif',cursor:'pointer',
                            borderColor:
                              b.qc_status==='Pass'  ? '#165C35':
                              b.qc_status==='Fail'  ? '#C0392B':
                              b.qc_status==='Rework'? '#7D3C98':'#E67E22',
                            color:
                              b.qc_status==='Pass'  ? '#165C35':
                              b.qc_status==='Fail'  ? '#C0392B':
                              b.qc_status==='Rework'? '#7D3C98':'#E67E22',
                            background:'#fff'}}>
                          {QC_OPTIONS.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </td>
                      <TD>{b.notes||'—'}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL: LOG NEW BATCH ════════════════════════════════════════════ */}
      {modal==='add' && (
        <Modal title='Log New Production Batch' onClose={() => { setModal(null); setSaving(false); }}>
          <div style={{background:'#E8F5EE',borderRadius:8,padding:'10px 14px',
            marginBottom:16,fontSize:13,fontFamily:'sans-serif',color:'#165C35'}}>
            <strong>Important:</strong> Every batch you log here is saved permanently to the database.
            You will see it even after a page refresh.
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Production Date' type='date'
              value={form.date} onChange={v=>f('date',v)}/>

            <Select label='Product *' value={form.product}
              onChange={v => {
                f('product', v);
                f('batch_no', genBatchNo(v));
              }}
              options={products.map(p=>p.name)}/>

            <Input label='Batch Number (auto-generated)'
              value={form.batch_no} onChange={v=>f('batch_no',v)}
              placeholder='e.g. VPE-261021-001'/>

            <Select label='Status' value={form.status} onChange={v=>f('status',v)}
              options={['In Progress','Complete','On Hold']}/>

            <Input label='Target Quantity (units) *' type='number'
              value={form.quantity} onChange={v=>f('quantity',v)} placeholder='e.g. 500'/>

            <Input label='Yield Quantity (actual output)' type='number'
              value={form.yield_qty} onChange={v=>f('yield_qty',v)}
              placeholder='Leave blank = same as target'/>
          </div>

          {/* Efficiency preview */}
          {form.quantity && form.yield_qty && (
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'10px 14px',
              marginBottom:12,fontSize:13,fontFamily:'sans-serif'}}>
              Production efficiency:{' '}
              <strong style={{
                color: (Number(form.yield_qty)/Number(form.quantity))>=0.95 ? '#165C35' :
                       (Number(form.yield_qty)/Number(form.quantity))>=0.80 ? '#E67E22' : '#C0392B'
              }}>
                {Math.round((Number(form.yield_qty)/Number(form.quantity))*100)}%
              </strong>
              {' '}({form.yield_qty} of {form.quantity} units)
            </div>
          )}

          <div style={{marginBottom:12}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
              textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>
              Notes (Optional)
            </label>
            <textarea value={form.notes||''} onChange={e=>f('notes',e.target.value)}
              placeholder='Raw material lot numbers, issues encountered, special instructions…'
              rows={3}
              style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,
                padding:'8px 10px',fontSize:13,boxSizing:'border-box',
                fontFamily:'inherit',resize:'vertical'}}/>
          </div>

          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveBatch} color='green' disabled={saving}>
              {saving ? 'Saving to Database…' : 'Save Batch'}
            </Btn>
            <Btn onClick={() => { setModal(null); setSaving(false); }} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}