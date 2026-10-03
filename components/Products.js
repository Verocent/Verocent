'use client';
import { useState } from 'react';

const fmt   = n  => `₦${Number(n||0).toLocaleString()}`;
const today = () => new Date().toISOString().split('T')[0];

const DEFAULT_LOCATIONS = [
  'Kaduna (HQ)',
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Warri',
  'Benin',
  'Anambra',
];

function Badge({ label, color='green' }) {
  const map = {
    green:{b:'#E8F5EE',t:'#165C35'}, red:{b:'#FADBD8',t:'#C0392B'},
    amber:{b:'#FEF9E7',t:'#E67E22'}, gold:{b:'#FDF6E3',t:'#7D4E00'},
    blue:{b:'#EBF5FB',t:'#1A56DB'},
  };
  const s = map[color]||map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',
    fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bg = {green:'#1F6F43',red:'#C0392B',gold:'#D4A017',blue:'#1A56DB',
    amber:'#E67E22',grey:'#e0e0e0'}[color]||'#1F6F43';
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
        textTransform:'uppercase',letterSpacing:1,marginBottom:4,
        fontFamily:'sans-serif'}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,
          padding:'8px 10px',fontSize:13,boxSizing:'border-box',fontFamily:'inherit'}}/>
    </div>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:'#165C35',
        textTransform:'uppercase',letterSpacing:1,marginBottom:4,
        fontFamily:'sans-serif'}}>{label}</label>}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',border:'1px solid #C9C9C0',borderRadius:6,
          padding:'8px 10px',fontSize:13,background:'#fff',fontFamily:'inherit'}}>
        <option value=''>— Select —</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',
        maxWidth:wide?900:680,maxHeight:'90vh',overflow:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',
          justifyContent:'space-between',alignItems:'center',
          borderRadius:'14px 14px 0 0'}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:15,
            fontFamily:'sans-serif'}}>{title}</span>
          <button onClick={onClose}
            style={{background:'none',border:'none',color:'#fff',
              fontSize:24,cursor:'pointer'}}>x</button>
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
      {sub&&<div style={{fontSize:11,color:'#888',marginTop:3,
        fontFamily:'sans-serif'}}>{sub}</div>}
    </div>
  );
}

const exportCSV = (data, filename) => {
  if(!data||!data.length) return alert('No data to export.');
  const h = Object.keys(data[0]).join(',');
  const r = data.map(row=>Object.values(row)
    .map(v=>`"${String(v||'').replace(/"/g,'""')}"`)
    .join(',')).join('\n');
  const blob = new Blob([h+'\n'+r],{type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
};

const blankProduct = {
  name:'', code:'', prefix:'', size:'', cost:'',
  price:'', stock:'0', reorder:'20', status:'Active',
  nafdac_no:'', description:''
};

const blankDispatch = {
  date: today(), product:'', from_location:'Kaduna (HQ)',
  to_location:'', qty:'', notes:'', dispatched_by:''
};

const blankLocationSale = {
  date: today(), product:'', location:'', qty:'1',
  price:'', customer:'', notes:''
};

export default function Products({ products, setProducts }) {
  const [tab,      setTab]      = useState('catalog');
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);

  // Distribution state
  const [dispatches,     setDispatches]     = useState([]);
  const [locationSales,  setLocationSales]  = useState([]);
  const [locations,      setLocations]      = useState(DEFAULT_LOCATIONS);
  const [newLocation,    setNewLocation]    = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterProduct,  setFilterProduct]  = useState('All');

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  // ── PRODUCT CRUD ──────────────────────────────────────
  const saveProduct = async () => {
    if(!form.name||!form.price) return alert('Product name and price are required.');
    setSaving(true);
    const payload = {
      ...form,
      cost:   Number(form.cost)||0,
      price:  Number(form.price)||0,
      stock:  Number(form.stock)||0,
      reorder:Number(form.reorder)||20,
    };
    try {
      const { db } = await import('@/lib/supabase');
      if(modal==='add-product') {
        const row = await db.addProduct(payload).catch(()=>null);
        setProducts(prev=>[...prev, row||{...payload,id:Date.now()}]);
      } else {
        await db.updateProduct(form.id, payload).catch(()=>{});
        setProducts(prev=>prev.map(p=>p.id===form.id?{...payload,id:form.id}:p));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const delProduct = async (id, name) => {
    if(!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const { db } = await import('@/lib/supabase');
      await db.deleteProduct(id).catch(()=>{});
    } catch(e){}
    setProducts(prev=>prev.filter(p=>p.id!==id));
  };

  // ── DISPATCH STOCK TO LOCATION ─────────────────────────
  const saveDispatch = async () => {
    if(!form.product||!form.to_location||!form.qty)
      return alert('Product, destination, and quantity are required.');
    const qty = Number(form.qty);
    const src = products.find(p=>p.name===form.product);
    if(!src) return alert('Product not found.');
    if((src.stock||0) < qty)
      return alert(`Not enough stock. Available: ${src.stock} units.`);
    setSaving(true);

    // Deduct from main stock
    const newStock = (src.stock||0) - qty;
    try {
      const { db } = await import('@/lib/supabase');
      await db.updateProduct(src.id,{...src,stock:newStock}).catch(()=>{});
      setProducts(prev=>prev.map(p=>
        p.id===src.id?{...p,stock:newStock}:p
      ));
    } catch(e){}

    const dispatch = {
      ...form,
      id: Date.now(),
      qty,
      status: 'In Transit',
    };
    setDispatches(prev=>[...prev, dispatch]);
    setModal(null);
    setSaving(false);
    alert(`Dispatched! ${qty} units of ${form.product} sent to ${form.to_location}`);
  };

  // Mark dispatch as delivered
  const markDelivered = (id) => {
    setDispatches(prev=>prev.map(d=>
      d.id===id?{...d,status:'Delivered'}:d
    ));
  };

  // ── RECORD SALE FROM LOCATION ──────────────────────────
  const saveLocationSale = () => {
    if(!form.product||!form.location||!form.qty)
      return alert('Product, location, and quantity are required.');

    const locationStock = getLocationStock(form.product, form.location);
    const qty = Number(form.qty);
    if(locationStock < qty)
      return alert(`Not enough stock at ${form.location}. Available: ${locationStock} units.`);

    const sale = {
      ...form,
      id: Date.now(),
      qty,
      price: Number(form.price)||0,
      total: qty * (Number(form.price)||0),
    };
    setLocationSales(prev=>[...prev, sale]);
    setModal(null);
    alert(`Sale recorded! ${qty} units sold at ${form.location}`);
  };

  // ── CALCULATE LOCATION STOCK ──────────────────────────
  const getLocationStock = (productName, location) => {
    const dispatched = dispatches
      .filter(d=>d.product===productName && d.to_location===location && d.status==='Delivered')
      .reduce((s,d)=>s+(d.qty||0),0);
    const sold = locationSales
      .filter(s=>s.product===productName && s.location===location)
      .reduce((s,x)=>s+(x.qty||0),0);
    return Math.max(0, dispatched - sold);
  };

  // ── LOCATION SUMMARY ──────────────────────────────────
  const getLocationSummary = () => {
    const summary = {};
    locations.forEach(loc=>{
      summary[loc] = {};
      products.forEach(p=>{
        const dispatched = dispatches
          .filter(d=>d.product===p.name && d.to_location===loc && d.status==='Delivered')
          .reduce((s,d)=>s+(d.qty||0),0);
        const sold = locationSales
          .filter(s=>s.product===p.name && s.location===loc)
          .reduce((s,x)=>s+(x.qty||0),0);
        const revenue = locationSales
          .filter(s=>s.product===p.name && s.location===loc)
          .reduce((s,x)=>s+(x.total||0),0);
        if(dispatched>0||sold>0) {
          summary[loc][p.name] = {
            dispatched, sold,
            remaining: Math.max(0,dispatched-sold),
            revenue
          };
        }
      });
    });
    return summary;
  };

  const TH = ({children,center}) => (
    <th style={{background:'#165C35',color:'#fff',padding:'9px 12px',
      textAlign:center?'center':'left',fontSize:11,textTransform:'uppercase',
      whiteSpace:'nowrap',fontFamily:'sans-serif'}}>{children}</th>
  );
  const TD = ({children,center,bold,green,red}) => (
    <td style={{padding:'9px 12px',textAlign:center?'center':'left',
      fontWeight:bold?700:400,color:green?'#165C35':red?'#C0392B':'#1A1A1A',
      verticalAlign:'middle',fontFamily:'sans-serif',fontSize:13}}>
      {children}
    </td>
  );

  const summary = getLocationSummary();
  const totalLocationSales  = locationSales.reduce((s,x)=>s+(x.total||0),0);
  const totalDispatched     = dispatches.reduce((s,d)=>s+(d.qty||0),0);
  const inTransitCount      = dispatches.filter(d=>d.status==='In Transit').length;

  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[
          ['catalog',   'Product Catalog'],
          ['dispatch',  'Dispatch Stock'],
          ['movement',  'Location Tracker'],
          ['locsales',  'Location Sales'],
          ['locations', 'Manage Locations'],
        ].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 16px',borderRadius:8,border:'none',
              cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'sans-serif',
              background:tab===k?'#1F6F43':'#eee',
              color:tab===k?'#fff':'#1A1A1A'}}>
            {l}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        <KPI label='Total Products'    value={products.length}/>
        <KPI label='Total Stock (HQ)'
          value={products.reduce((s,p)=>s+(p.stock||0),0)+' units'}/>
        <KPI label='Dispatched'
          value={totalDispatched+' units'} color='#1A56DB' bg='#EBF5FB'/>
        <KPI label='In Transit'
          value={inTransitCount+' batches'}
          color={inTransitCount>0?'#E67E22':'#165C35'}
          bg={inTransitCount>0?'#FEF9E7':'#E8F5EE'}/>
        <KPI label='Location Revenue'
          value={fmt(totalLocationSales)} color='#7D4E00' bg='#FDF6E3'/>
      </div>

      {/* PRODUCT CATALOG TAB */}
      {tab==='catalog'&&(
        <div style={{background:'#fff',borderRadius:14,
          border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',
            display:'flex',justifyContent:'space-between',
            alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,
              fontFamily:'sans-serif'}}>Product Catalog</span>
            <div style={{display:'flex',gap:8}}>
              <Btn small color='gold'
                onClick={()=>{setForm({...blankProduct});setModal('add-product');}}>
                + Add Product
              </Btn>
              <Btn small color='blue'
                onClick={()=>exportCSV(products,'products.csv')}>
                Export CSV
              </Btn>
            </div>
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
              <thead><tr>
                <TH>Product Name</TH><TH>Code</TH><TH>NAFDAC No.</TH>
                <TH>Size</TH><TH>Cost</TH><TH>Price</TH>
                <TH center>HQ Stock</TH><TH center>Reorder</TH>
                <TH center>Margin</TH><TH center>Status</TH><TH>Actions</TH>
              </tr></thead>
              <tbody>
                {products.length===0?(
                  <tr><td colSpan={11}
                    style={{padding:32,textAlign:'center',
                      color:'#888',fontFamily:'sans-serif'}}>
                    No products yet. Click + Add Product to start.
                  </td></tr>
                ):products.map((p,i)=>{
                  const margin = p.price>0
                    ?(((p.price-p.cost)/p.price)*100).toFixed(0)+'%':'—';
                  const low = (p.stock||0)<=(p.reorder||20);
                  return (
                    <tr key={p.id}
                      style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                      <TD bold>{p.name}</TD>
                      <TD><code style={{fontSize:10,background:'#FDF6E3',
                        padding:'2px 5px',borderRadius:4}}>{p.code}</code></TD>
                      <TD>{p.nafdac_no||'—'}</TD>
                      <TD>{p.size||'—'}</TD>
                      <TD>{fmt(p.cost)}</TD>
                      <TD green bold>{fmt(p.price)}</TD>
                      <td style={{padding:'9px 12px',textAlign:'center'}}>
                        <span style={{fontWeight:800,fontSize:15,
                          color:p.stock===0?'#C0392B':low?'#E67E22':'#165C35'}}>
                          {p.stock||0}
                        </span>
                        {' '}
                        {p.stock===0
                          ?<Badge label='OUT' color='red'/>
                          :low
                            ?<Badge label='LOW' color='amber'/>
                            :<Badge label='OK' color='green'/>}
                      </td>
                      <TD center>{p.reorder||20}</TD>
                      <TD center>
                        <span style={{fontWeight:700,color:'#165C35'}}>
                          {margin}
                        </span>
                      </TD>
                      <TD center>
                        <Badge label={p.status||'Active'}
                          color={p.status==='Active'?'green':'amber'}/>
                      </TD>
                      <td style={{padding:'9px 12px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          <Btn small color='blue' onClick={()=>{
                            setForm({...p,cost:String(p.cost),
                              price:String(p.price),stock:String(p.stock),
                              reorder:String(p.reorder)});
                            setModal('edit-product');
                          }}>Edit</Btn>
                          <Btn small color='green' onClick={()=>{
                            setForm({...blankDispatch,product:p.name});
                            setModal('dispatch');
                          }}>Send</Btn>
                          <Btn small color='red'
                            onClick={()=>delProduct(p.id,p.name)}>
                            Del
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPATCH STOCK TAB */}
      {tab==='dispatch'&&(
        <div>
          <div style={{background:'#EBF5FB',border:'1px solid #1A56DB',
            borderRadius:8,padding:'12px 16px',marginBottom:16,
            fontSize:13,fontFamily:'sans-serif',color:'#1A56DB'}}>
            <strong>How dispatching works:</strong> Select a product and destination.
            Stock will be deducted from Kaduna HQ automatically.
            When stock arrives, mark it as Delivered.
            Then record sales from that location under Location Sales.
          </div>

          <div style={{background:'#fff',borderRadius:14,
            border:'1px solid #C9C9C0',overflow:'hidden'}}>
            <div style={{background:'#1F6F43',padding:'12px 20px',
              display:'flex',justifyContent:'space-between',
              alignItems:'center',flexWrap:'wrap',gap:8}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:14,
                fontFamily:'sans-serif'}}>Stock Dispatch Log</span>
              <Btn small color='gold'
                onClick={()=>{setForm({...blankDispatch});setModal('dispatch');}}>
                + Dispatch Stock
              </Btn>
            </div>
            <div style={{padding:20,overflowX:'auto'}}>
              {dispatches.length===0?(
                <div style={{padding:40,textAlign:'center',
                  color:'#888',fontFamily:'sans-serif'}}>
                  <div style={{fontSize:13,marginBottom:16}}>
                    No dispatches yet. Send stock to your locations across Nigeria.
                  </div>
                  <Btn color='gold'
                    onClick={()=>{setForm({...blankDispatch});setModal('dispatch');}}>
                    + Dispatch First Stock
                  </Btn>
                </div>
              ):(
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
                  <thead><tr>
                    <TH>Date</TH><TH>Product</TH><TH>From</TH><TH>To</TH>
                    <TH center>Qty</TH><TH>Dispatched By</TH>
                    <TH center>Status</TH><TH>Action</TH>
                  </tr></thead>
                  <tbody>
                    {[...dispatches].reverse().map((d,i)=>(
                      <tr key={d.id}
                        style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                        <TD>{d.date}</TD>
                        <TD bold>{d.product}</TD>
                        <TD>{d.from_location}</TD>
                        <TD bold>{d.to_location}</TD>
                        <TD center>{d.qty}</TD>
                        <TD>{d.dispatched_by||'—'}</TD>
                        <TD center>
                          <Badge
                            label={d.status}
                            color={d.status==='Delivered'?'green':'amber'}/>
                        </TD>
                        <td style={{padding:'9px 12px'}}>
                          {d.status==='In Transit'&&(
                            <Btn small color='green'
                              onClick={()=>markDelivered(d.id)}>
                              Mark Delivered
                            </Btn>
                          )}
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

      {/* LOCATION TRACKER TAB */}
      {tab==='movement'&&(
        <div>
          <div style={{background:'#fff',borderRadius:12,
            border:'1px solid #C9C9C0',padding:'14px 20px',marginBottom:16}}>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
              <div style={{flex:1,minWidth:160}}>
                <Select label='Filter by Location'
                  value={filterLocation}
                  onChange={setFilterLocation}
                  options={['All',...locations]}/>
              </div>
              <div style={{flex:1,minWidth:160}}>
                <Select label='Filter by Product'
                  value={filterProduct}
                  onChange={setFilterProduct}
                  options={['All',...products.map(p=>p.name)]}/>
              </div>
            </div>
          </div>

          {locations.map(loc=>{
            const locData = summary[loc];
            const hasData = locData && Object.keys(locData).length>0;
            if(filterLocation!=='All' && filterLocation!==loc) return null;
            return (
              <div key={loc} style={{background:'#fff',borderRadius:14,
                border:'1px solid #C9C9C0',overflow:'hidden',marginBottom:16}}>
                <div style={{background:'#1B2631',padding:'12px 20px',
                  display:'flex',justifyContent:'space-between',
                  alignItems:'center',flexWrap:'wrap',gap:8}}>
                  <span style={{color:'#D4A017',fontWeight:800,fontSize:15,
                    fontFamily:'sans-serif'}}>📍 {loc}</span>
                  <div style={{display:'flex',gap:8}}>
                    <Btn small color='gold' onClick={()=>{
                      setForm({...blankDispatch,to_location:loc});
                      setModal('dispatch');
                    }}>Send Stock Here</Btn>
                    <Btn small color='green' onClick={()=>{
                      setForm({...blankLocationSale,location:loc});
                      setModal('loc-sale');
                    }}>Record Sale</Btn>
                  </div>
                </div>
                <div style={{padding:20}}>
                  {!hasData?(
                    <div style={{textAlign:'center',color:'#888',
                      fontFamily:'sans-serif',padding:20,fontSize:13}}>
                      No delivered stock at {loc} yet.
                      Click "Send Stock Here" and then mark it as Delivered.
                    </div>
                  ):(
                    <table style={{width:'100%',borderCollapse:'collapse'}}>
                      <thead><tr>
                        <TH>Product</TH>
                        <TH center>Dispatched</TH>
                        <TH center>Sold</TH>
                        <TH center>Remaining</TH>
                        <TH center>Revenue</TH>
                        <TH center>Status</TH>
                      </tr></thead>
                      <tbody>
                        {Object.entries(locData)
                          .filter(([name])=>filterProduct==='All'||filterProduct===name)
                          .map(([name,data],i)=>(
                          <tr key={name}
                            style={{background:i%2===0?'#F9F9F7':'#fff'}}>
                            <TD bold>{name}</TD>
                            <TD center>{data.dispatched}</TD>
                            <TD center>{data.sold}</TD>
                            <td style={{padding:'9px 12px',textAlign:'center'}}>
                              <span style={{fontWeight:800,fontSize:15,
                                color:data.remaining===0?'#C0392B':
                                  data.remaining<=5?'#E67E22':'#165C35'}}>
                                {data.remaining}
                              </span>
                              {' '}
                              {data.remaining===0
                                ?<Badge label='OUT' color='red'/>
                                :data.remaining<=5
                                  ?<Badge label='LOW' color='amber'/>
                                  :<Badge label='OK' color='green'/>}
                            </td>
                            <TD center green bold>{fmt(data.revenue)}</TD>
                            <TD center>
                              {data.remaining===0
                                ?<Badge label='Sold Out' color='red'/>
                                :<Badge label='Active' color='green'/>}
                            </TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOCATION SALES TAB */}
      {tab==='locsales'&&(
        <div style={{background:'#fff',borderRadius:14,
          border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px',
            display:'flex',justifyContent:'space-between',
            alignItems:'center',flexWrap:'wrap',gap:8}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,
              fontFamily:'sans-serif'}}>Location Sales Log</span>
            <div style={{display:'flex',gap:8}}>
              <Btn small color='gold' onClick={()=>{
                setForm({...blankLocationSale});
                setModal('loc-sale');
              }}>+ Record Sale</Btn>
              <Btn small color='blue'
                onClick={()=>exportCSV(locationSales,'location-sales.csv')}>
                Export CSV
              </Btn>
            </div>
          </div>
          <div style={{padding:20,overflowX:'auto'}}>
            {locationSales.length===0?(
              <div style={{padding:40,textAlign:'center',
                color:'#888',fontFamily:'sans-serif'}}>
                <div style={{fontWeight:700,marginBottom:8}}>
                  No location sales yet
                </div>
                <Btn color='gold' onClick={()=>{
                  setForm({...blankLocationSale});
                  setModal('loc-sale');
                }}>+ Record First Sale</Btn>
              </div>
            ):(
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
                <thead><tr>
                  <TH>Date</TH><TH>Location</TH><TH>Product</TH>
                  <TH center>Qty</TH><TH center>Unit Price</TH>
                  <TH center>Total</TH><TH>Customer</TH><TH>Notes</TH>
                </tr></thead>
                <tbody>
                  {[...locationSales].reverse().map((s,i)=>(
                    <tr key={s.id}
                      style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                      <TD>{s.date}</TD>
                      <TD bold>{s.location}</TD>
                      <TD>{s.product}</TD>
                      <TD center>{s.qty}</TD>
                      <TD center>{fmt(s.price)}</TD>
                      <TD center green bold>{fmt(s.total)}</TD>
                      <TD>{s.customer||'—'}</TD>
                      <TD>{s.notes||'—'}</TD>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:'#165C35'}}>
                    <td colSpan={5} style={{padding:'10px 12px',
                      color:'#fff',fontWeight:700,fontFamily:'sans-serif'}}>
                      TOTAL LOCATION REVENUE
                    </td>
                    <td style={{padding:'10px 12px',textAlign:'center',
                      color:'#D4A017',fontWeight:800,fontSize:16,
                      fontFamily:'sans-serif'}}>
                      {fmt(totalLocationSales)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MANAGE LOCATIONS TAB */}
      {tab==='locations'&&(
        <div style={{background:'#fff',borderRadius:14,
          border:'1px solid #C9C9C0',overflow:'hidden'}}>
          <div style={{background:'#1F6F43',padding:'12px 20px'}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,
              fontFamily:'sans-serif'}}>Manage Locations</span>
          </div>
          <div style={{padding:24}}>
            <div style={{background:'#E8F5EE',borderRadius:10,
              padding:20,marginBottom:24}}>
              <div style={{fontWeight:700,fontSize:14,color:'#165C35',
                fontFamily:'sans-serif',marginBottom:12}}>
                + Add New Location
              </div>
              <div style={{display:'flex',gap:10}}>
                <input
                  value={newLocation}
                  onChange={e=>setNewLocation(e.target.value)}
                  placeholder='e.g. Sokoto, Kano, Ibadan...'
                  style={{flex:1,border:'1px solid #C9C9C0',borderRadius:6,
                    padding:'10px 14px',fontSize:14,fontFamily:'sans-serif'}}/>
                <Btn color='green' onClick={()=>{
                  if(!newLocation.trim()) return;
                  if(locations.includes(newLocation.trim()))
                    return alert('Location already exists.');
                  setLocations(prev=>[...prev, newLocation.trim()]);
                  setNewLocation('');
                }}>+ Add Location</Btn>
              </div>
            </div>

            <div style={{fontWeight:700,fontSize:14,color:'#165C35',
              fontFamily:'sans-serif',marginBottom:12}}>
              Current Locations ({locations.length})
            </div>
            <div style={{display:'grid',
              gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
              {locations.map(loc=>(
                <div key={loc} style={{background:'#F9F9F7',borderRadius:10,
                  padding:'14px 16px',border:'1px solid #C9C9C0',
                  display:'flex',justifyContent:'space-between',
                  alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,
                      fontFamily:'sans-serif',color:'#165C35'}}>
                      📍 {loc}
                    </div>
                    <div style={{fontSize:11,color:'#888',
                      fontFamily:'sans-serif',marginTop:4}}>
                      {locationSales.filter(s=>s.location===loc).length} sales recorded
                    </div>
                  </div>
                  {loc!=='Kaduna (HQ)'&&(
                    <button onClick={()=>{
                      if(!window.confirm(`Remove ${loc}?`)) return;
                      setLocations(prev=>prev.filter(l=>l!==loc));
                    }}
                      style={{background:'none',border:'none',
                        color:'#C0392B',cursor:'pointer',fontSize:20,
                        lineHeight:1,fontWeight:700}}>x</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {(modal==='add-product'||modal==='edit-product')&&(
        <Modal
          title={modal==='add-product'?'Add New Product':'Edit Product'}
          onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Product Name *' value={form.name}
              onChange={v=>f('name',v)} placeholder='e.g. Deep Hair Moisturizer'/>
            <Input label='Product Code' value={form.code}
              onChange={v=>f('code',v)} placeholder='e.g. VPE-DHM'/>
            <Input label='NAFDAC No.' value={form.nafdac_no}
              onChange={v=>f('nafdac_no',v)} placeholder='e.g. A2-105639L'/>
            <Input label='Batch Prefix' value={form.prefix}
              onChange={v=>f('prefix',v)} placeholder='e.g. VPM'/>
            <Input label='Pack Size' value={form.size}
              onChange={v=>f('size',v)} placeholder='e.g. 250g'/>
            <Input label='Cost Price (N) *' type='number' value={form.cost}
              onChange={v=>f('cost',v)}/>
            <Input label='Selling Price (N) *' type='number' value={form.price}
              onChange={v=>f('price',v)}/>
            <Input label='Current Stock (units)' type='number' value={form.stock}
              onChange={v=>f('stock',v)}/>
            <Input label='Reorder Point' type='number' value={form.reorder}
              onChange={v=>f('reorder',v)}/>
            <Select label='Status' value={form.status}
              onChange={v=>f('status',v)}
              options={['Active','Inactive','Discontinued']}/>
          </div>
          {form.cost&&form.price&&(
            <div style={{background:'#FDF6E3',borderRadius:8,
              padding:'10px 14px',marginBottom:12,fontSize:13,
              fontFamily:'sans-serif'}}>
              Profit/unit: <strong style={{color:'#165C35'}}>
                {fmt(Number(form.price)-Number(form.cost))}
              </strong>{' '}|{' '}
              Margin: <strong style={{color:'#165C35'}}>
                {Number(form.price)>0
                  ?(((Number(form.price)-Number(form.cost))/Number(form.price))*100).toFixed(1)+'%'
                  :'—'}
              </strong>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveProduct} color='green' disabled={saving}>
              {saving?'Saving…':modal==='add-product'?'Add Product':'Save Changes'}
            </Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* MODAL: DISPATCH STOCK */}
      {modal==='dispatch'&&(
        <Modal title='Dispatch Stock to Location' onClose={()=>setModal(null)}>
          <div style={{background:'#EBF5FB',borderRadius:8,
            padding:'10px 14px',marginBottom:16,fontSize:13,
            fontFamily:'sans-serif',color:'#1A56DB'}}>
            Stock will be deducted from Kaduna HQ and tracked at the destination.
            Mark as Delivered when the stock arrives at the location.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Dispatch Date' type='date' value={form.date}
              onChange={v=>f('date',v)}/>
            <Select label='Product *' value={form.product}
              onChange={v=>f('product',v)}
              options={products.map(p=>p.name)}/>
            <Select label='From' value={form.from_location}
              onChange={v=>f('from_location',v)} options={['Kaduna (HQ)']}/>
            <Select label='To Location *' value={form.to_location}
              onChange={v=>f('to_location',v)}
              options={locations.filter(l=>l!=='Kaduna (HQ)')}/>
            <Input label='Quantity to Dispatch *' type='number' value={form.qty}
              onChange={v=>f('qty',v)}/>
            <Input label='Dispatched By' value={form.dispatched_by}
              onChange={v=>f('dispatched_by',v)} placeholder='Staff name'/>
          </div>

          {form.product&&(()=>{
            const p = products.find(x=>x.name===form.product);
            if(!p) return null;
            const afterDispatch = (p.stock||0)-Number(form.qty||0);
            return (
              <div style={{background:'#FDF6E3',borderRadius:8,
                padding:'10px 14px',marginBottom:12,fontSize:13,
                fontFamily:'sans-serif'}}>
                HQ Stock available: <strong style={{color:'#165C35'}}>
                  {p.stock||0} units
                </strong>{' '}|{' '}
                After dispatch: <strong
                  style={{color:afterDispatch<0?'#C0392B':'#165C35'}}>
                  {afterDispatch} units
                </strong>
                {afterDispatch<0&&
                  <span style={{color:'#C0392B',marginLeft:8}}>
                    Not enough stock!
                  </span>}
              </div>
            );
          })()}

          <Input label='Notes' value={form.notes}
            onChange={v=>f('notes',v)}
            placeholder='Any notes about this dispatch...'/>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveDispatch} color='green' disabled={saving}>
              {saving?'Dispatching…':'Confirm Dispatch'}
            </Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* MODAL: RECORD LOCATION SALE */}
      {modal==='loc-sale'&&(
        <Modal title='Record Sale from Location' onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Sale Date' type='date' value={form.date}
              onChange={v=>f('date',v)}/>
            <Select label='Location *' value={form.location}
              onChange={v=>f('location',v)}
              options={locations.filter(l=>l!=='Kaduna (HQ)')}/>
            <Select label='Product *' value={form.product}
              onChange={v=>{
                const p=products.find(x=>x.name===v);
                f('product',v);
                if(p) f('price',String(p.price));
              }}
              options={products.map(p=>p.name)}/>
            <Input label='Quantity Sold *' type='number' value={form.qty}
              onChange={v=>f('qty',v)}/>
            <Input label='Unit Price (N)' type='number' value={form.price}
              onChange={v=>f('price',v)}/>
            <Input label='Customer Name' value={form.customer}
              onChange={v=>f('customer',v)} placeholder='Optional'/>
          </div>

          {form.product&&form.location&&(()=>{
            const locStock = getLocationStock(form.product, form.location);
            const afterSale = locStock - Number(form.qty||0);
            return (
              <div style={{background:'#FDF6E3',borderRadius:8,
                padding:'10px 14px',marginBottom:12,fontSize:13,
                fontFamily:'sans-serif'}}>
                Stock at {form.location}: <strong style={{color:'#165C35'}}>
                  {locStock} units
                </strong>{' '}|{' '}
                After sale: <strong
                  style={{color:afterSale<0?'#C0392B':'#165C35'}}>
                  {afterSale} units
                </strong>
                {form.qty&&form.price&&
                  <span style={{marginLeft:12}}>
                    | Sale Total: <strong style={{color:'#165C35'}}>
                      {fmt(Number(form.qty)*Number(form.price))}
                    </strong>
                  </span>}
              </div>
            );
          })()}

          <Input label='Notes' value={form.notes}
            onChange={v=>f('notes',v)} placeholder='Optional'/>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveLocationSale} color='green'>
              Record Sale
            </Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}