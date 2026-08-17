'use client';
const fmt = n => `₦${Number(n||0).toLocaleString()}`;

function Badge({ label, color='green' }) {
  const map = { green:{b:'#E8F5EE',t:'#165C35'}, red:{b:'#FADBD8',t:'#C0392B'}, amber:{b:'#FEF9E7',t:'#E67E22'}, gold:{b:'#FDF6E3',t:'#7D4E00'}, blue:{b:'#EBF5FB',t:'#1A56DB'} };
  const s = map[color]||map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function Card({ title, icon, children }) {
  return (
    <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden',marginBottom:20}}>
      <div style={{background:'#1F6F43',padding:'12px 20px'}}>
        <span style={{color:'#fff',fontWeight:700,fontSize:14}}>{icon} {title}</span>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  );
}

function Row({ label, value, color='#165C35' }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #C9C9C0'}}>
      <span style={{fontSize:13}}>{label}</span>
      <span style={{fontSize:13,fontWeight:700,color}}>{value}</span>
    </div>
  );
}

export default function Reports({ products=[], sales=[], expenses=[], production=[], rawMaterials=[] }) {
  const totalRev  = sales.reduce((s,x)=>s+(x.total||0),0);
  const totalPaid = sales.reduce((s,x)=>s+(x.paid||0),0);
  const totalExp  = expenses.reduce((s,x)=>s+(x.amount||0),0);

  // Product profitability
  const prodProfit = products.map(p => {
    const pSales = sales.filter(s=>s.product===p.name);
    const revenue = pSales.reduce((s,x)=>s+(x.total||0),0);
    const units   = pSales.reduce((s,x)=>s+(x.qty||0),0);
    const cost    = units*(p.cost||0);
    const profit  = revenue-cost;
    const margin  = revenue>0?((profit/revenue)*100).toFixed(0)+'%':'—';
    return { name:p.name, revenue, units, profit, margin };
  });

  // Top customers
  const topCustomers = Object.entries(
    sales.reduce((acc,s)=>{ acc[s.customer]=(acc[s.customer]||0)+(s.total||0); return acc; },{})
  ).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Expenses by category
  const expByCat = expenses.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+(e.amount||0); return acc; },{});

  const totalUnits = production.reduce((s,p)=>s+(p.qty||0),0);
  const totalProdCost = production.reduce((s,p)=>s+(p.total_cost||0),0);
  const qcPassRate = production.length ? Math.round(production.filter(p=>p.qc_status==='Pass').length/production.length*100) : 0;
  const rmValue = rawMaterials.reduce((s,r)=>s+(r.qty||0)*(r.cost||0),0);

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:20}}>

      {/* Product Profitability */}
      <Card title='Product Profitability' icon='📊'>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr>
              {['Product','Units Sold','Revenue','Profit','Margin'].map(h=>(
                <th key={h} style={{background:'#165C35',color:'#fff',padding:'8px 10px',textAlign:'left',fontSize:11}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {prodProfit.map((p,i)=>(
                <tr key={p.name} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                  <td style={{padding:'8px 10px',fontWeight:700,color:'#165C35',fontSize:12}}>{p.name}</td>
                  <td style={{padding:'8px 10px'}}>{p.units}</td>
                  <td style={{padding:'8px 10px',fontWeight:700}}>{fmt(p.revenue)}</td>
                  <td style={{padding:'8px 10px',fontWeight:700,color:p.profit>0?'#165C35':'#C0392B'}}>{fmt(p.profit)}</td>
                  <td style={{padding:'8px 10px'}}><Badge label={p.margin} color={parseInt(p.margin)>20?'green':parseInt(p.margin)>10?'amber':'red'}/></td>
                </tr>
              ))}
              {prodProfit.length===0&&<tr><td colSpan={5} style={{padding:16,textAlign:'center',color:'#888'}}>No sales data yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sales Performance */}
      <Card title='Sales Performance' icon='📈'>
        <Row label='Total Revenue'       value={fmt(totalRev)}/>
        <Row label='Cash Collected'      value={fmt(totalPaid)}/>
        <Row label='Outstanding Balance' value={fmt(totalRev-totalPaid)} color='#C0392B'/>
        <Row label='Total Orders'        value={sales.length}   color='#1A56DB'/>
        <Row label='Paid Orders'         value={sales.filter(s=>s.status==='Paid').length}/>
        <Row label='Partial Payment'     value={sales.filter(s=>s.status==='Partial').length} color='#E67E22'/>
        <Row label='Unpaid Orders'       value={sales.filter(s=>s.status==='Unpaid').length}  color='#C0392B'/>
        <Row label='Average Order Value' value={fmt(totalRev/Math.max(sales.length,1))}/>
        <Row label='Net Profit'          value={fmt(totalPaid-totalExp)} color={totalPaid>totalExp?'#165C35':'#C0392B'}/>
        <Row label='Profit Margin'       value={`${(((totalPaid-totalExp)/Math.max(totalPaid,1))*100).toFixed(1)}%`}/>
      </Card>

      {/* Top Customers */}
      <Card title='Top 5 Customers' icon='👑'>
        {topCustomers.length===0
          ? <p style={{color:'#888',fontSize:13}}>No customer data yet.</p>
          : topCustomers.map(([name,total],i)=>(
          <div key={name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
            padding:'10px 12px',background:i===0?'#FDF6E3':i%2===0?'#E8F5EE':'#fff',borderRadius:8,marginBottom:6}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:18}}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
              <span style={{fontWeight:i===0?800:600,fontSize:13}}>{name}</span>
            </div>
            <span style={{fontWeight:700,color:'#165C35',fontSize:14}}>{fmt(total)}</span>
          </div>
        ))}
      </Card>

      {/* Production Efficiency */}
      <Card title='Production Efficiency' icon='🏭'>
        <Row label='Total Batches'       value={production.length}/>
        <Row label='Total Units Produced'value={totalUnits}/>
        <Row label='Total Prod. Cost'    value={fmt(totalProdCost)}  color='#7D4E00'/>
        <Row label='Avg Cost per Unit'   value={fmt(totalUnits?totalProdCost/totalUnits:0)} color='#7D4E00'/>
        <Row label='QC Pass Rate'        value={qcPassRate+'%'}      color={qcPassRate>=95?'#165C35':'#C0392B'}/>
        <Row label='Batches Passed QC'   value={production.filter(p=>p.qc_status==='Pass').length}/>
        <Row label='Batches Failed QC'   value={production.filter(p=>p.qc_status==='Fail').length} color={production.filter(p=>p.qc_status==='Fail').length>0?'#C0392B':'#165C35'}/>
        <Row label='Raw Materials (items)'value={rawMaterials.length}/>
        <Row label='RM Total Value'      value={fmt(rmValue)} color='#7D4E00'/>
      </Card>

      {/* Expense Analysis */}
      <Card title='Expense Analysis' icon='💸'>
        {totalExp===0
          ? <p style={{color:'#888',fontSize:13}}>No expense data yet.</p>
          : Object.entries(expByCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
          <div key={cat} style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:12}}>{cat}</span>
              <span style={{fontSize:13,fontWeight:700,color:'#C0392B'}}>{fmt(amt)}</span>
            </div>
            <div style={{height:7,background:'#E0E0D8',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${(amt/totalExp*100).toFixed(0)}%`,background:'#C0392B',borderRadius:4}}/>
            </div>
            <div style={{fontSize:10,textAlign:'right',color:'#888'}}>{(amt/totalExp*100).toFixed(0)}% of total</div>
          </div>
        ))}
        <div style={{borderTop:'2px solid #C0392B',paddingTop:10,marginTop:4,display:'flex',justifyContent:'space-between'}}>
          <span style={{fontWeight:700}}>TOTAL EXPENSES</span>
          <span style={{fontWeight:800,color:'#C0392B',fontSize:15}}>{fmt(totalExp)}</span>
        </div>
      </Card>

      {/* Financial Summary */}
      <Card title='Financial Summary' icon='💰'>
        {[
          ['INCOME',null],
          ['Total Revenue',          fmt(totalRev),          '#165C35'],
          ['Cash Collected',         fmt(totalPaid),         '#165C35'],
          ['Outstanding',            fmt(totalRev-totalPaid),'#C0392B'],
          ['COSTS',null],
          ['Total Expenses',         fmt(totalExp),          '#C0392B'],
          ['Total Production Cost',  fmt(totalProdCost),     '#7D4E00'],
          ['Payroll (est.)',          '—',                    '#1B2631'],
          ['BOTTOM LINE',null],
          ['Net Profit / (Loss)',     fmt(totalPaid-totalExp), totalPaid>totalExp?'#165C35':'#C0392B'],
          ['Net Margin',             `${(((totalPaid-totalExp)/Math.max(totalPaid,1))*100).toFixed(1)}%`, totalPaid>totalExp?'#165C35':'#C0392B'],
        ].map(([l,v,c],i)=>
          v===null
            ? <div key={l} style={{background:'#165C35',color:'#D4A017',padding:'5px 10px',fontWeight:700,fontSize:11,textTransform:'uppercase',marginTop:10,marginBottom:4,borderRadius:4}}>{l}</div>
            : <Row key={l} label={l} value={v} color={c}/>
        )}
      </Card>

    </div>
  );
}
