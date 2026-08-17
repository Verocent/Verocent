'use client';
import { useState } from 'react';
import { db } from '@/lib/supabase';
import { PAYMENT_METHODS, DELIVERY_STATUSES } from '@/lib/constants';
import { Card, Table, Badge, Btn, Input, Select, Modal, KPI, AlertBox, Grid, exportCSV, fmt, today, invId } from './ui';
import Invoice from './Invoice';

const blankSale = { date:today(), customer:'', phone:'', product:'', qty:'1', price:'', discount:'0', paid:'', method:'Bank Transfer', delivery:'Pending' };
const blankCust = { name:'', type:'Retail', phone:'', email:'', address:'', category:'New' };

export default function Sales({ sales, setSales, customers, setCustomers, products }) {
  const [tab,     setTab]     = useState('log');
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [invSale, setInvSale] = useState(null);
  const [filter,  setFilter]  = useState('All');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const calcTotal = (fm) => Math.max(0, (Number(fm.qty||1)*Number(fm.price||0)) - Number(fm.discount||0));

  // Sales CRUD
  const saveSale = async () => {
    if (!form.customer||!form.product||!form.price) return alert('Customer, Product, and Price are required.');
    setSaving(true);
    const total  = calcTotal(form);
    const paid   = Number(form.paid||0);
    const status = paid>=total?'Paid':paid>0?'Partial':'Unpaid';
    const payload = { ...form, id:form.id||invId(), total, paid, status,
      qty:Number(form.qty)||1, price:Number(form.price)||0, discount:Number(form.discount||0) };
    try {
      if (modal==='add-sale') {
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
    if (!window.confirm('Delete this sale record?')) return;
    await db.deleteSale(id).catch(()=>{});
    setSales(prev=>prev.filter(s=>s.id!==id));
  };

  // Customer CRUD
  const saveCust = async () => {
    if (!form.name) return alert('Customer name required.');
    setSaving(true);
    const payload = { ...form, id: form.id || `CUST-${String(customers.length+1).padStart(4,'0')}` };
    try {
      if (modal==='add-cust') {
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

  const delCust = async (id, name) => {
    if (!window.confirm(`Remove customer "${name}"?`)) return;
    await db.deleteCustomer(id).catch(()=>{});
    setCustomers(prev=>prev.filter(c=>c.id!==id));
  };

  const totalRev  = sales.reduce((s,x)=>s+(x.total||0),0);
  const totalPaid = sales.reduce((s,x)=>s+(x.paid||0),0);
  const totalOut  = sales.reduce((s,x)=>s+((x.total||0)-(x.paid||0)),0);
  const filtered  = filter==='All' ? sales : sales.filter(s=>s.status===filter);

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['log','💰 Sales Log'],['customers','👥 Customers'],['returns','↩️ Returns']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,
              background:tab===k?'#1F6F43':'#eee',color:tab===k?'#fff':'#1A1A1A'}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── SALES LOG ── */}
      {tab==='log' && (
        <>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
            <KPI label='Total Revenue'  value={fmt(totalRev)}   color='#165C35' bg='#E8F5EE' sub={`${sales.length} orders`}/>
            <KPI label='Cash Collected' value={fmt(totalPaid)}  color='#165C35' bg='#E8F5EE'/>
            <KPI label='Outstanding'    value={fmt(totalOut)}   color='#C0392B' bg='#FADBD8' sub={`${sales.filter(s=>s.status!=='Paid').length} orders`}/>
            <KPI label='Avg Order'      value={fmt(totalRev/Math.max(sales.length,1))} color='#165C35' bg='#E8F5EE'/>
          </div>
          <Card title='Sales Log' icon='💰'
            actions={[
              <Btn key='a' small color='gold' onClick={()=>{setForm({...blankSale});setModal('add-sale');}}>+ New Sale</Btn>,
              <Btn key='e' small color='blue' onClick={()=>exportCSV(sales,'sales-log.csv')}>⬇️ Export CSV</Btn>,
            ]}>
            <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:700}}>Filter:</span>
              {['All','Paid','Partial','Unpaid'].map(fil=>(
                <button key={fil} onClick={()=>setFilter(fil)}
                  style={{padding:'4px 14px',borderRadius:20,border:`2px solid ${filter===fil?'#1F6F43':'#C9C9C0'}`,
                    background:filter===fil?'#E8F5EE':'#fff',fontSize:12,fontWeight:700,cursor:'pointer',
                    color:filter===fil?'#165C35':'#1A1A1A'}}>
                  {fil} {fil!=='All'&&`(${sales.filter(s=>s.status===fil).length})`}
                </button>
              ))}
            </div>
            <Table
              headers={['Invoice No.','Date','Customer','Product','Qty','Total','Paid','Balance','Status','Delivery','Actions']}
              rows={filtered.map(s=>[
                <code style={{fontSize:11,background:'#FDF6E3',padding:'2px 5px',borderRadius:4}}>{s.id}</code>,
                s.date, s.customer, s.product, s.qty,
                <span style={{fontWeight:700,color:'#165C35'}}>{fmt(s.total)}</span>,
                <span style={{fontWeight:700,color:'#1F6F43'}}>{fmt(s.paid)}</span>,
                <span style={{fontWeight:700,color:(s.total-s.paid)>0?'#C0392B':'#1F6F43'}}>{fmt((s.total||0)-(s.paid||0))}</span>,
                <Badge label={s.status} color={s.status==='Paid'?'green':s.status==='Partial'?'amber':'red'}/>,
                <Badge label={s.delivery} color={s.delivery==='Delivered'?'green':s.delivery==='In Transit'?'blue':'amber'}/>,
                <div style={{display:'flex',gap:4}}>
                  <Btn small color='green' onClick={()=>setInvSale(s)}>🧾</Btn>
                  <Btn small color='blue'  onClick={()=>{setForm({...s,qty:String(s.qty),price:String(s.price),discount:String(s.discount||0),paid:String(s.paid)});setModal('edit-sale');}}>Edit</Btn>
                  <Btn small color='red'   onClick={()=>delSale(s.id)}>Del</Btn>
                </div>,
              ])}
            />
          </Card>
        </>
      )}

      {/* ── CUSTOMERS ── */}
      {tab==='customers' && (
        <Card title='Customer Register' icon='👥'
          actions={[
            <Btn key='a' small color='gold' onClick={()=>{setForm({...blankCust});setModal('add-cust');}}>+ Add Customer</Btn>,
            <Btn key='e' small color='blue' onClick={()=>exportCSV(customers,'customers.csv')}>⬇️ Export CSV</Btn>,
          ]}>
          <AlertBox type='info'>
            Click <strong>Export CSV</strong> to download all customer contacts — import directly into WhatsApp Business, email tools, or your marketing platform.
          </AlertBox>
          <Table
            headers={['ID','Name','Type','Phone','Email','Address','Category','Actions']}
            rows={customers.map(c=>[
              <code style={{fontSize:11,background:'#FDF6E3',padding:'2px 5px',borderRadius:4}}>{c.id}</code>,
              <span style={{fontWeight:700,color:'#165C35'}}>{c.name}</span>,
              c.type, c.phone, c.email||'—', c.address,
              <Badge label={c.category} color={c.category==='VIP'?'gold':c.category==='New'?'green':'blue'}/>,
              <div style={{display:'flex',gap:6}}>
                <Btn small color='blue' onClick={()=>{setForm({...c});setModal('edit-cust');}}>Edit</Btn>
                <Btn small color='red'  onClick={()=>delCust(c.id,c.name)}>Del</Btn>
              </div>,
            ])}
          />
        </Card>
      )}

      {/* ── RETURNS ── */}
      {tab==='returns' && (
        <Card title='Returns & Damages' icon='↩️'>
          <AlertBox type='success'>No returns recorded this period.</AlertBox>
          <Btn color='amber' onClick={()=>alert('Contact your admin to log a return.')}>+ Log a Return</Btn>
        </Card>
      )}

      {/* Invoice */}
      {invSale && <Invoice sale={invSale} onClose={()=>setInvSale(null)}/>}

      {/* Add/Edit Sale */}
      {(modal==='add-sale'||modal==='edit-sale')&&(
        <Modal title={modal==='add-sale'?'New Sale / Invoice':'Edit Sale'} onClose={()=>setModal(null)}>
          <Grid cols={2}>
            <Input label='Date' type='date' value={form.date} onChange={v=>f('date',v)} required/>
            <Input label='Customer Name' value={form.customer} onChange={v=>f('customer',v)} required/>
            <Input label='Customer Phone' value={form.phone} onChange={v=>f('phone',v)}/>
            <Select label='Product' value={form.product} onChange={v=>{
              const p = products.find(x=>x.name===v);
              setForm(prev=>({...prev,product:v,price:p?String(p.price):''}));
            }} options={[...products.map(p=>p.name),'Bundle (All 3)']} required/>
            <Input label='Quantity' type='number' value={form.qty} onChange={v=>f('qty',v)}/>
            <Input label='Unit Price (₦)' type='number' value={form.price} onChange={v=>f('price',v)} required/>
            <Input label='Discount (₦)' type='number' value={form.discount} onChange={v=>f('discount',v)}/>
            <Input label='Amount Paid (₦)' type='number' value={form.paid} onChange={v=>f('paid',v)}/>
            <Select label='Payment Method' value={form.method} onChange={v=>f('method',v)} options={PAYMENT_METHODS}/>
            <Select label='Delivery Status' value={form.delivery} onChange={v=>f('delivery',v)} options={DELIVERY_STATUSES}/>
          </Grid>
          {form.qty&&form.price&&(
            <div style={{background:'#FDF6E3',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}}>
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

      {/* Add/Edit Customer */}
      {(modal==='add-cust'||modal==='edit-cust')&&(
        <Modal title={modal==='add-cust'?'Add Customer':'Edit Customer'} onClose={()=>setModal(null)}>
          <Grid cols={2}>
            <Input label='Full Name' value={form.name} onChange={v=>f('name',v)} required/>
            <Select label='Business Type' value={form.type} onChange={v=>f('type',v)} options={['Retail','Wholesaler','Distributor','Walk-In','Online','Corporate']}/>
            <Input label='Phone' value={form.phone} onChange={v=>f('phone',v)}/>
            <Input label='Email' value={form.email} onChange={v=>f('email',v)}/>
            <Input label='Address' value={form.address} onChange={v=>f('address',v)}/>
            <Select label='Category' value={form.category} onChange={v=>f('category',v)} options={['VIP','Regular','New','Inactive']}/>
          </Grid>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <Btn onClick={saveCust} color='green' disabled={saving}>{saving?'Saving…':'Save Customer'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
