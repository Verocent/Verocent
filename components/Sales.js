'use client';
import { useState } from 'react';
import { PAYMENT_METHODS, DELIVERY_STATUSES } from '@/lib/constants';

// ── Self-contained helpers ────────────────────────────────
const fmt   = n  => `₦${Number(n||0).toLocaleString()}`;
const today = () => new Date().toISOString().split('T')[0];
const invId = () => `INV-${new Date().toISOString().replace(/-/g,'').substr(0,8)}-${String(Math.floor(Math.random()*9000)+1000)}`;
const retId = () => `RET-${new Date().toISOString().replace(/-/g,'').substr(0,8)}-${String(Math.floor(Math.random()*9000)+1000)}`;

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
        fontFamily:'inherit',whiteSpace:'nowrap'}}>
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
      <textarea value={value||''} onChange={e=>onChange(e.target.value)}
        rows={rows} placeholder={placeholder}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,padding:'8px 10px',
          fontSize:13,boxSizing:'border-box',fontFamily:'inherit',resize:'vertical'}}/>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:680,
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

function KPI({ label, value, color='#165C35', bg='#E8F5EE', sub }) {
  return (
    <div style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${color}`}}>
      <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color,fontFamily:'sans-serif'}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:'#888',marginTop:3,fontFamily:'sans-serif'}}>{sub}</div>}
    </div>
  );
}

const exportCSV = (data, filename) => {
  if(!data?.length) return alert('No data to export.');
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(r=>Object.values(r).map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([headers+'\n'+rows],{type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
};

// Invoice printer
function printInvoice(sale) {
  const balance = (sale.total||0)-(sale.paid||0);
  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${sale.id}</title>
  <style>
    body{font-family:'Times New Roman',serif;padding:40px;max-width:740px;margin:0 auto;color:#1A1A1A}
    h1{color:#1F6F43;border-bottom:4px solid #D4A017;padding-bottom:12px;margin-bottom:8px}
    .sub{color:#666;font-size:13px;margin-bottom:20px}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    th{background:#165C35;color:#fff;padding:10px;text-align:left;font-size:12px}
    td{padding:9px;border-bottom:1px solid #e0e0d8}
    tr:nth-child(even)td{background:#E8F5EE}
    .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
    .grand{font-size:18px;font-weight:bold;color:#1F6F43;border-top:2px solid #1F6F43;margin-top:8px;padding-top:8px}
    .owing{color:#C0392B;font-weight:bold}
    .paid-full{color:#1F6F43;font-weight:bold}
    .footer{margin-top:32px;padding-top:12px;border-top:1px solid #ccc;font-size:12px;color:#888;font-style:italic}
    @media print{.no-print{display:none}}
  </style></head><body>
  <h1>🌿 VEROCENT PURE ESSENCE</h1>
  <div class="sub">Verocent Global Limited | Kaduna, Nigeria | NAFDAC Registered | 07037916561</div>
  <h2 style="color:#1F6F43">INVOICE</h2>
  <table>
    <tr><td><strong>Invoice No:</strong></td><td>${sale.id}</td><td><strong>Date:</strong></td><td>${sale.date}</td></tr>
    <tr><td><strong>Customer:</strong></td><td>${sale.customer}</td><td><strong>Phone:</strong></td><td>${sale.phone||'N/A'}</td></tr>
    <tr><td><strong>Payment:</strong></td><td>${sale.method||'N/A'}</td><td><strong>Delivery:</strong></td><td>${sale.delivery||'N/A'}</td></tr>
  </table>
  <table>
    <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr>
    <tr><td>${sale.product}</td><td style="text-align:center">${sale.qty}</td>
    <td>₦${Number(sale.price||0).toLocaleString()}</td>
    <td style="color:#C0392B">-₦${Number(sale.discount||0).toLocaleString()}</td>
    <td style="font-weight:bold">₦${Number(sale.total||0).toLocaleString()}</td></tr>
  </table>
  <div style="border-top:2px solid #1F6F43;padding-top:12px">
    <div class="total-row"><span>Total Amount:</span><span style="font-weight:bold">₦${Number(sale.total||0).toLocaleString()}</span></div>
    <div class="total-row"><span>Amount Paid:</span><span class="paid-full">₦${Number(sale.paid||0).toLocaleString()}</span></div>
    <div class="total-row grand"><span>Balance:</span>
      <span class="${balance>0?'owing':'paid-full'}">${balance>0?'₦'+Number(balance).toLocaleString()+' OUTSTANDING':'FULLY PAID ✓'}</span>
    </div>
  </div>
  <div class="footer"><p>Pure Care with Verocent — Nature's Touch for Healthy Hair 🌿</p></div>
  <div class="no-print" style="margin-top:20px;display:flex;gap:12px">
    <button onclick="window.print()" style="background:#1F6F43;color:white;padding:10px 24px;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:bold">🖨️ Print</button>
    <button onclick="window.close()" style="background:#eee;color:#333;padding:10px 24px;border:none;border-radius:6px;cursor:pointer;font-size:14px">Close</button>
  </div>
  </body></html>`);
  w.document.close();
}

// ── Blank forms ───────────────────────────────────────────
const blankSale = { date:today(),customer:'',phone:'',product:'',qty:'1',price:'',discount:'0',paid:'',method:'Bank Transfer',delivery:'Pending' };
const blankCust = { name:'',type:'Retail',phone:'',email:'',address:'',category:'New' };
const blankReturn = {
  date:today(), return_id:'', customer:'', phone:'', product:'', qty:'1',
  original_invoice:'', reason:'', condition:'', action:'Refund',
  refund_amount:'0', recorded_by:'Veronica', notes:''
};

export default function Sales({ sales, setSales, customers, setCustomers, products }) {
  const [tab,     setTab]     = useState('log');
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [invSale, setInvSale] = useState(null);
  const [filter,  setFilter]  = useState('All');
  const [returns, setReturns] = useState([]);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const calcTotal = fm => Math.max(0,(Number(fm.qty||1)*Number(fm.price||0))-Number(fm.discount||0));

  // ── SALES CRUD ────────────────────────────────────────
  const saveSale = async () => {
    if(!form.customer||!form.product||!form.price) return alert('Customer, Product, and Price are required.');
    setSaving(true);
    const total  = calcTotal(form);
    const paid   = Number(form.paid||0);
    const status = paid>=total?'Paid':paid>0?'Partial':'Unpaid';
    const payload = { ...form, id:form.id||invId(), total, paid, status,
      qty:Number(form.qty)||1, price:Number(form.price)||0, discount:Number(form.discount||0) };
    try {
      const { db } = await import('@/lib/supabase');
      if(modal==='add-sale') {
        const row = await db.addSale(payload).catch(()=>null);
        setSales(prev=>[...prev, row||payload]);
      } else {
        await db.updateSale(form.id, payload).catch(()=>{});
        setSales(prev=>prev.map(s=>s.id===form.id?payload:s));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const delSale = async (id) => {
    if(!window.confirm('Delete this sale record? This cannot be undone.')) return;
    try { const { db } = await import('@/lib/supabase'); await db.deleteSale(id).catch(()=>{}); } catch(e){}
    setSales(prev=>prev.filter(s=>s.id!==id));
  };

  // ── CUSTOMER CRUD ─────────────────────────────────────
  const saveCust = async () => {
    if(!form.name) return alert('Customer name is required.');
    setSaving(true);
    const payload = {...form, id:form.id||`CUST-${String(customers.length+1).padStart(4,'0')}`};
    try {
      const { db } = await import('@/lib/supabase');
      if(modal==='add-cust') {
        const row = await db.addCustomer(payload).catch(()=>null);
        setCustomers(prev=>[...prev, row||payload]);
      } else {
        await db.updateCustomer(form.id, payload).catch(()=>{});
        setCustomers(prev=>prev.map(c=>c.id===form.id?payload:c));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const delCust = async (id,name) => {
    if(!window.confirm(`Remove customer "${name}"?`)) return;
    try { const { db } = await import('@/lib/supabase'); await db.deleteCustomer(id).catch(()=>{}); } catch(e){}
    setCustomers(prev=>prev.filter(c=>c.id!==id));
  };

  // ── RETURNS CRUD ──────────────────────────────────────
  const saveReturn = () => {
    if(!form.customer||!form.product) return alert('Customer and Product are required.');
    const payload = {
      ...form,
      return_id: form.return_id||retId(),
      qty: Number(form.qty)||1,
      refund_amount: Number(form.refund_amount)||0,
      id: form.id||Date.now(),
    };
    if(modal==='add-return') {
      setReturns(prev=>[...prev, payload]);
    } else {
      setReturns(prev=>prev.map(r=>r.id===form.id?payload:r));
    }
    setModal(null);
  };

  const delReturn = (id, retId) => {
    if(!window.confirm(`Delete return record ${retId}?`)) return;
    setReturns(prev=>prev.filter(r=>r.id!==id));
  };

  // ── Computed values ───────────────────────────────────
  const totalRev    = sales.reduce((s,x)=>s+(x.total||0),0);
  const totalPaid   = sales.reduce((s,x)=>s+(x.paid||0),0);
  const totalOut    = sales.reduce((s,x)=>s+((x.total||0)-(x.paid||0)),0);
  const totalRefund = returns.reduce((s,r)=>s+(r.refund_amount||0),0);
  const filtered    = filter==='All'?sales:sales.filter(s=>s.status===filter);

  const TH = ({children,center}) => (
    <th style={{background:'#165C35',color:'#fff',padding:'9px 12px',
      textAlign:center?'center':'left',fontSize:11,textTransform:'uppercase',
      whiteSpace:'nowrap',fontFamily:'sans-serif'}}>{children}</th>
  );
  const TD = ({children,center,bold,green,red,amber}) => (
    <td style={{padding:'9px 12px',textAlign:center?'center':'left',
      fontWeight:bold?700:400,
      color:green?'#165C35':red?'#C0392B':amber?'#E67E22':'#1A1A1A',
      verticalAlign:'middle',fontFamily:'sans-serif',fontSize:13}}>{children}</td>
  );

  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[
          ['log','💰 Sales Log'],
          ['customers','👥 Customers'],
          ['returns',`↩️ Returns${returns.length>0?` (${returns.length})`:''}`],
        ].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',
              fontWeight:700,fontSize:13,fontFamily:'sans-serif',
              background:tab===k?'#1F6F43':'#eee',color:tab===k?'#fff':'#1A1A1A'}}>
            {l}
          </button>
        ))}
      </div>

      {/* ══ SALES LOG ══ */}
      {tab==='log'&&(
        <>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
            <KPI label='Total Revenue'  value={fmt(totalRev)}   sub={`${sales.length} orders`}/>
            <KPI label='Cash Collected' value={fmt(totalPaid)}/>
            <KPI label='Outstanding'    value={fmt(totalOut)}   color='#C0392B' bg='#FADBD8' sub={`${sales.filter(s=>s.status!=='Paid').length} orders`}/>
            <KPI label='Avg Order'      value={fmt(totalRev/Math.max(sales.length,1))}/>
          </div>

          <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
            <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>💰 Sales Log</span>
              <div style={{display:'flex',gap:8}}>
                <Btn small color='gold' onClick={()=>{setForm({...blankSale});setModal('add-sale');}}>+ New Sale</Btn>
                <Btn small color='blue' onClick={()=>exportCSV(sales,'sales-log.csv')}>⬇️ Export CSV</Btn>
              </div>
            </div>

            {/* Filter bar */}
            <div style={{padding:'12px 20px',borderBottom:'1px solid #C9C9C0',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:700,fontFamily:'sans-serif',color:'#666'}}>Filter:</span>
              {['All','Paid','Partial','Unpaid'].map(fil=>(
                <button key={fil} onClick={()=>setFilter(fil)}
                  style={{padding:'4px 14px',borderRadius:20,
                    border:`2px solid ${filter===fil?'#1F6F43':'#C9C9C0'}`,
                    background:filter===fil?'#E8F5EE':'#fff',
                    fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'sans-serif',
                    color:filter===fil?'#165C35':'#1A1A1A'}}>
                  {fil} {fil!=='All'&&`(${sales.filter(s=>s.status===fil).length})`}
                </button>
              ))}
            </div>

            <div style={{padding:20,overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead><tr>
                  <TH>Invoice No.</TH><TH>Date</TH><TH>Customer</TH><TH>Product</TH>
                  <TH center>Qty</TH><TH center>Total</TH><TH center>Paid</TH>
                  <TH center>Balance</TH><TH center>Status</TH><TH center>Delivery</TH><TH>Actions</TH>
                </tr></thead>
                <tbody>
                  {filtered.length===0?(
                    <tr><td colSpan={11} style={{padding:32,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                      No sales records yet. Click + New Sale to start.
                    </td></tr>
                  ):filtered.map((s,i)=>(
                    <tr key={s.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                      <TD><code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4,fontWeight:700,color:'#7D4E00'}}>{s.id}</code></TD>
                      <TD>{s.date}</TD>
                      <TD bold>{s.customer}</TD>
                      <TD>{s.product}</TD>
                      <TD center>{s.qty}</TD>
                      <TD center bold green>{fmt(s.total)}</TD>
                      <TD center green>{fmt(s.paid)}</TD>
                      <TD center red={((s.total||0)-(s.paid||0))>0} green={((s.total||0)-(s.paid||0))===0}>
                        <span style={{fontWeight:700}}>{fmt((s.total||0)-(s.paid||0))}</span>
                      </TD>
                      <TD center><Badge label={s.status} color={s.status==='Paid'?'green':s.status==='Partial'?'amber':'red'}/></TD>
                      <TD center><Badge label={s.delivery} color={s.delivery==='Delivered'?'green':s.delivery==='In Transit'?'blue':'amber'}/></TD>
                      <td style={{padding:'9px 12px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          <Btn small color='green' onClick={()=>{ setInvSale(s); }}>🧾 Invoice</Btn>
                          <Btn small color='blue'  onClick={()=>{ setForm({...s,qty:String(s.qty),price:String(s.price),discount:String(s.discount||0),paid:String(s.paid)}); setModal('edit-sale'); }}>✏️ Edit</Btn>
                          <Btn small color='red'   onClick={()=>delSale(s.id)}>🗑 Del</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══ CUSTOMERS ══ */}
      {tab==='customers'&&(
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>👥 Customer Register</span>
            <div style={{display:'flex',gap:8}}>
              <Btn small color='gold' onClick={()=>{setForm({...blankCust});setModal('add-cust');}}>+ Add Customer</Btn>
              <Btn small color='blue' onClick={()=>exportCSV(customers,'customers.csv')}>⬇️ Export CSV</Btn>
            </div>
          </div>
          <div style={{padding:'10px 16px',background:'#E8F5EE',fontSize:13,color:'#165C35',fontFamily:'sans-serif',borderBottom:'1px solid #C9C9C0'}}>
            💡 Click <strong>Export CSV</strong> to download all customer contacts for WhatsApp or email marketing.
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
              <thead><tr>
                <TH>ID</TH><TH>Name</TH><TH>Type</TH><TH>Phone</TH>
                <TH>Email</TH><TH>Address</TH><TH center>Category</TH><TH>Actions</TH>
              </tr></thead>
              <tbody>
                {customers.length===0?(
                  <tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                    No customers yet. Click + Add Customer to start.
                  </td></tr>
                ):customers.map((c,i)=>(
                  <tr key={c.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                    <TD><code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4}}>{c.id}</code></TD>
                    <TD bold>{c.name}</TD>
                    <TD>{c.type}</TD>
                    <TD>{c.phone}</TD>
                    <TD>{c.email||'—'}</TD>
                    <TD>{c.address}</TD>
                    <TD center><Badge label={c.category} color={c.category==='VIP'?'gold':c.category==='New'?'green':'blue'}/></TD>
                    <td style={{padding:'9px 12px'}}>
                      <div style={{display:'flex',gap:4}}>
                        <Btn small color='blue' onClick={()=>{setForm({...c});setModal('edit-cust');}}>✏️ Edit</Btn>
                        <Btn small color='red'  onClick={()=>delCust(c.id,c.name)}>🗑 Del</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ RETURNS ══ */}
      {tab==='returns'&&(
        <div>
          {/* Returns KPIs */}
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
            <KPI label='Total Returns'   value={returns.length}/>
            <KPI label='Total Refunded'  value={fmt(totalRefund)} color='#C0392B' bg='#FADBD8'/>
            <KPI label='Refund'          value={returns.filter(r=>r.action==='Refund').length} color='#C0392B' bg='#FADBD8'/>
            <KPI label='Exchange'        value={returns.filter(r=>r.action==='Exchange').length} color='#E67E22' bg='#FEF9E7'/>
            <KPI label='Store Credit'    value={returns.filter(r=>r.action==='Store Credit').length} color='#1A56DB' bg='#EBF5FB'/>
          </div>

          <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
            <div style={{background:'#1F6F43',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>↩️ Returns & Damages Log</span>
              <div style={{display:'flex',gap:8}}>
                <Btn small color='gold' onClick={()=>{setForm({...blankReturn,return_id:retId()});setModal('add-return');}}>+ Log Return</Btn>
                <Btn small color='blue' onClick={()=>exportCSV(returns,'returns-log.csv')}>⬇️ Export CSV</Btn>
              </div>
            </div>

            {/* How returns work */}
            <div style={{padding:'12px 16px',background:'#FEF9E7',fontSize:13,color:'#92400E',fontFamily:'sans-serif',borderBottom:'1px solid #C9C9C0'}}>
              ℹ️ <strong>How Returns Work:</strong> Log every product return here — whether it is a refund, exchange, or store credit. This keeps your records clean and helps track product quality issues.
            </div>

            <div style={{padding:20,overflowX:'auto'}}>
              {returns.length===0?(
                <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                  <div style={{fontSize:40,marginBottom:12}}>✅</div>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>No returns recorded</div>
                  <div style={{fontSize:13,marginBottom:20,color:'#aaa'}}>This is great! When a customer returns a product, click the button below to log it.</div>
                  <Btn color='gold' onClick={()=>{setForm({...blankReturn,return_id:retId()});setModal('add-return');}}>+ Log First Return</Btn>
                </div>
              ):(
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                  <thead><tr>
                    <TH>Return ID</TH><TH>Date</TH><TH>Customer</TH><TH>Product</TH>
                    <TH center>Qty</TH><TH>Reason</TH><TH center>Condition</TH>
                    <TH center>Action</TH><TH center>Refund Amt</TH><TH>Recorded By</TH><TH>Actions</TH>
                  </tr></thead>
                  <tbody>
                    {returns.map((r,i)=>(
                      <tr key={r.id} style={{background:i%2===0?'#FADBD8':'#fff'}}>
                        <TD><code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4,fontWeight:700,color:'#C0392B'}}>{r.return_id}</code></TD>
                        <TD>{r.date}</TD>
                        <TD bold>{r.customer}</TD>
                        <TD>{r.product}</TD>
                        <TD center>{r.qty}</TD>
                        <TD>{r.reason}</TD>
                        <TD center><Badge label={r.condition||'—'} color={r.condition==='Good'?'green':r.condition==='Damaged'?'red':'amber'}/></TD>
                        <TD center><Badge label={r.action} color={r.action==='Refund'?'red':r.action==='Exchange'?'amber':'blue'}/></TD>
                        <TD center red bold>{fmt(r.refund_amount)}</TD>
                        <TD>{r.recorded_by}</TD>
                        <td style={{padding:'9px 12px'}}>
                          <div style={{display:'flex',gap:4}}>
                            <Btn small color='blue' onClick={()=>{setForm({...r,qty:String(r.qty),refund_amount:String(r.refund_amount)});setModal('edit-return');}}>✏️ Edit</Btn>
                            <Btn small color='red'  onClick={()=>delReturn(r.id,r.return_id)}>🗑 Del</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ INVOICE POPUP ══ */}
      {invSale&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:640,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0'}}>
              <span style={{color:'#fff',fontWeight:800,fontSize:15,fontFamily:'sans-serif'}}>🧾 Invoice — {invSale.id}</span>
              <button onClick={()=>setInvSale(null)} style={{background:'none',border:'none',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
            </div>
            <div style={{padding:24}}>
              {/* Invoice preview */}
              <div style={{border:'2px solid #1F6F43',borderRadius:10,padding:20,marginBottom:20}}>
                <div style={{borderBottom:'3px solid #D4A017',paddingBottom:12,marginBottom:16}}>
                  <div style={{fontSize:18,fontWeight:800,color:'#1F6F43',fontFamily:'sans-serif'}}>🌿 VEROCENT PURE ESSENCE</div>
                  <div style={{fontSize:11,color:'#666',fontFamily:'sans-serif'}}>Verocent Global Limited | Kaduna | NAFDAC Registered</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                  {[['Invoice No.',invSale.id],['Date',invSale.date],['Customer',invSale.customer],
                    ['Phone',invSale.phone||'N/A'],['Payment',invSale.method],['Delivery',invSale.delivery]].map(([k,v])=>(
                    <div key={k}>
                      <span style={{fontSize:11,color:'#888',fontWeight:700,fontFamily:'sans-serif'}}>{k}: </span>
                      <span style={{fontSize:13,fontWeight:600,fontFamily:'sans-serif'}}>{v}</span>
                    </div>
                  ))}
                </div>
                <table style={{width:'100%',borderCollapse:'collapse',marginBottom:12}}>
                  <thead><tr>
                    {['Product','Qty','Unit Price','Discount','Total'].map(h=>(
                      <th key={h} style={{background:'#165C35',color:'#fff',padding:'8px 10px',textAlign:'left',fontSize:11,fontFamily:'sans-serif'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody><tr style={{background:'#E8F5EE'}}>
                    <td style={{padding:'9px 10px',fontFamily:'sans-serif',fontSize:13}}>{invSale.product}</td>
                    <td style={{padding:'9px 10px',textAlign:'center',fontFamily:'sans-serif'}}>{invSale.qty}</td>
                    <td style={{padding:'9px 10px',fontFamily:'sans-serif'}}>{fmt(invSale.price)}</td>
                    <td style={{padding:'9px 10px',color:'#C0392B',fontFamily:'sans-serif'}}>-{fmt(invSale.discount||0)}</td>
                    <td style={{padding:'9px 10px',fontWeight:700,color:'#165C35',fontFamily:'sans-serif'}}>{fmt(invSale.total)}</td>
                  </tr></tbody>
                </table>
                <div style={{borderTop:'2px solid #C9C9C0',paddingTop:10}}>
                  {[['Total Amount',fmt(invSale.total),'#165C35'],
                    ['Amount Paid',fmt(invSale.paid),'#1F6F43'],
                    [(invSale.total-invSale.paid)>0?'Balance Owing':'Status',
                     (invSale.total-invSale.paid)>0?fmt(invSale.total-invSale.paid):'FULLY PAID ✓',
                     (invSale.total-invSale.paid)>0?'#C0392B':'#1F6F43']
                  ].map(([k,v,c],i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:i<2?'1px solid #C9C9C0':'none'}}>
                      <span style={{fontFamily:'sans-serif',fontSize:i===2?14:13,fontWeight:i===2?800:600}}>{k}</span>
                      <span style={{fontFamily:'sans-serif',fontSize:i===2?16:13,fontWeight:800,color:c}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <Btn color='green' onClick={()=>printInvoice(invSale)}>🖨️ Print Invoice</Btn>
                <Btn color='blue'  onClick={()=>printInvoice(invSale)}>⬇️ Save as PDF</Btn>
                <Btn color='gold'  onClick={()=>{
                  const balance=(invSale.total||0)-(invSale.paid||0);
                  const text=`*VEROCENT PURE ESSENCE — INVOICE*\nInvoice: ${invSale.id}\nCustomer: ${invSale.customer}\nProduct: ${invSale.product}\nTotal: ${fmt(invSale.total)}\nPaid: ${fmt(invSale.paid)}\nBalance: ${balance>0?fmt(balance)+' OUTSTANDING':'FULLY PAID ✓'}`;
                  if(navigator.share){navigator.share({title:'Invoice',text});}
                  else{navigator.clipboard.writeText(text).then(()=>alert('Copied — paste into WhatsApp!'));}
                }}>📤 Share WhatsApp</Btn>
                <Btn color='grey' outline onClick={()=>setInvSale(null)}>Close</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: ADD / EDIT SALE ══ */}
      {(modal==='add-sale'||modal==='edit-sale')&&(
        <Modal title={modal==='add-sale'?'New Sale / Invoice':'Edit Sale'} onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Date *' type='date' value={form.date} onChange={v=>f('date',v)}/>
            <Input label='Customer Name *' value={form.customer} onChange={v=>f('customer',v)}/>
            <Input label='Customer Phone' value={form.phone} onChange={v=>f('phone',v)}/>
            <Select label='Product *' value={form.product} onChange={v=>{
              const p=products.find(x=>x.name===v);
              setForm(prev=>({...prev,product:v,price:p?String(p.price):''}));
            }} options={[...products.map(p=>p.name),'Bundle (All 3)','Other']}/>
            <Input label='Quantity' type='number' value={form.qty} onChange={v=>f('qty',v)}/>
            <Input label='Unit Price (₦) *' type='number' value={form.price} onChange={v=>f('price',v)}/>
            <Input label='Discount (₦)' type='number' value={form.discount} onChange={v=>f('discount',v)}/>
            <Input label='Amount Paid (₦)' type='number' value={form.paid} onChange={v=>f('paid',v)}/>
            <Select label='Payment Method' value={form.method} onChange={v=>f('method',v)} options={PAYMENT_METHODS||['Bank Transfer','Cash','POS','Flutterwave','Paystack','WhatsApp Order']}/>
            <Select label='Delivery Status' value={form.delivery} onChange={v=>f('delivery',v)} options={DELIVERY_STATUSES||['Pending','In Transit','Delivered','Cancelled']}/>
          </div>
          {form.qty&&form.price&&(
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,fontFamily:'sans-serif'}}>
              <strong>Total: {fmt(calcTotal(form))}</strong>
              {' '}| Paid: {fmt(form.paid||0)}
              {' '}| Balance: <span style={{color:'#C0392B',fontWeight:700}}>{fmt(calcTotal(form)-Number(form.paid||0))}</span>
              {' '}| Status: <strong>{Number(form.paid||0)>=calcTotal(form)?'✅ Paid':Number(form.paid||0)>0?'⏳ Partial':'❌ Unpaid'}</strong>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveSale} color='green' disabled={saving}>{saving?'Saving…':'Save & Generate Invoice'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* ══ MODAL: ADD / EDIT CUSTOMER ══ */}
      {(modal==='add-cust'||modal==='edit-cust')&&(
        <Modal title={modal==='add-cust'?'Add Customer':'Edit Customer'} onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Full Name *' value={form.name} onChange={v=>f('name',v)}/>
            <Select label='Business Type' value={form.type} onChange={v=>f('type',v)} options={['Retail','Wholesaler','Distributor','Walk-In','Online','Corporate']}/>
            <Input label='Phone' value={form.phone} onChange={v=>f('phone',v)}/>
            <Input label='Email' value={form.email} onChange={v=>f('email',v)}/>
            <Input label='Address' value={form.address} onChange={v=>f('address',v)}/>
            <Select label='Category' value={form.category} onChange={v=>f('category',v)} options={['VIP','Regular','New','Inactive']}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <Btn onClick={saveCust} color='green' disabled={saving}>{saving?'Saving…':'Save Customer'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* ══ MODAL: ADD / EDIT RETURN ══ */}
      {(modal==='add-return'||modal==='edit-return')&&(
        <Modal title={modal==='add-return'?'↩️ Log New Return':'✏️ Edit Return Record'} onClose={()=>setModal(null)}>
          <div style={{background:'#FADBD8',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,fontFamily:'sans-serif',color:'#C0392B'}}>
            ℹ️ Record the full details of this return so your stock and financial records stay accurate.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Return ID' value={form.return_id} onChange={v=>f('return_id',v)}/>
            <Input label='Date *' type='date' value={form.date} onChange={v=>f('date',v)}/>
            <Input label='Customer Name *' value={form.customer} onChange={v=>f('customer',v)}/>
            <Input label='Customer Phone' value={form.phone} onChange={v=>f('phone',v)}/>
            <Select label='Product *' value={form.product} onChange={v=>f('product',v)} options={[...products.map(p=>p.name),'Other']}/>
            <Input label='Quantity Returned' type='number' value={form.qty} onChange={v=>f('qty',v)}/>
            <Input label='Original Invoice No.' value={form.original_invoice} onChange={v=>f('original_invoice',v)} placeholder='e.g. INV-20260820-0001'/>
            <Select label='Return Action *' value={form.action} onChange={v=>f('action',v)} options={['Refund','Exchange','Store Credit','Reject Return']}/>
            <Input label='Refund Amount (₦)' type='number' value={form.refund_amount} onChange={v=>f('refund_amount',v)}/>
            <Select label='Product Condition' value={form.condition} onChange={v=>f('condition',v)} options={['Good','Slightly Used','Damaged','Unopened']}/>
            <Select label='Reason for Return' value={form.reason} onChange={v=>f('reason',v)} options={['Wrong Product Delivered','Product Damaged','Customer Changed Mind','Allergic Reaction','Expired Product','Other']}/>
            <Input label='Recorded By' value={form.recorded_by} onChange={v=>f('recorded_by',v)}/>
          </div>
          <Textarea label='Additional Notes' value={form.notes} onChange={v=>f('notes',v)} placeholder='Any additional observations about this return...'/>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveReturn} color='green' disabled={saving}>{saving?'Saving…':modal==='add-return'?'Log Return':'Save Changes'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}