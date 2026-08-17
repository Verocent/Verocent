'use client';
import { COLORS as C } from '@/lib/constants';
import { Card, KPI, Table, Badge, AlertBox, fmt } from './ui';

export default function Dashboard({ products, sales, rawMaterials, expenses, compliance, production }) {
  const totalRev  = sales.reduce((s,x)=>s+(x.total||0),0);
  const totalPaid = sales.reduce((s,x)=>s+(x.paid||0),0);
  const totalExp  = expenses.reduce((s,x)=>s+(x.amount||0),0);
  const outstanding = sales.reduce((s,x)=>s+((x.total||0)-(x.paid||0)),0);
  const stockVal  = products.reduce((s,p)=>s+(p.stock||0)*(p.price||0),0);
  const partPaid  = sales.filter(s=>s.status==='Partial');
  const unpaid    = sales.filter(s=>s.status==='Unpaid');
  const fullPaid  = sales.filter(s=>s.status==='Paid');

  return (
    <div>
      {/* Stock Alerts */}
      {products.filter(p=>(p.stock||0)<=(p.reorder||20)).map(p=>(
        <AlertBox key={p.id} type='danger'>
          {p.name} stock critically low — {p.stock} units remaining (reorder at {p.reorder})
        </AlertBox>
      ))}
      {compliance.filter(c=>Math.round((new Date(c.expiry)-new Date())/86400000)<=90).map(c=>(
        <AlertBox key={c.id} type='warning'>NAFDAC / Compliance due: {c.document} — expires {c.expiry}</AlertBox>
      ))}

      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        <KPI label='Total Revenue'      value={fmt(totalRev)}   color={C.dark}  bg={C.lightGreen} sub={`${sales.length} orders`}/>
        <KPI label='Cash Collected'     value={fmt(totalPaid)}  color={C.dark}  bg={C.lightGreen}/>
        <KPI label='Outstanding'        value={fmt(outstanding)} color={C.red}  bg={C.lightRed}   sub={`${unpaid.length+partPaid.length} orders`}/>
        <KPI label='Total Expenses'     value={fmt(totalExp)}   color={C.red}   bg={C.lightRed}/>
        <KPI label='Net Profit'         value={fmt(totalPaid-totalExp)} color={totalPaid>totalExp?C.dark:C.red} bg={totalPaid>totalExp?C.lightGreen:C.lightRed}/>
        <KPI label='Inventory Value'    value={fmt(stockVal)}   color='#7D4E00' bg={C.lightGold}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>

        {/* Payment Breakdown */}
        <Card title='Payment Status' icon='💳'>
          {[
            ['✅ Fully Paid',  fullPaid,  C.green, C.lightGreen],
            ['⏳ Part Payment',partPaid,  C.amber, C.lightAmber],
            ['❌ Not Paid',    unpaid,    C.red,   C.lightRed  ],
          ].map(([lbl,arr,c,bg])=>(
            <div key={lbl} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'10px 12px',background:bg,borderRadius:8,marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,color:c}}>{lbl}</div>
                <div style={{fontSize:11,color:'#888'}}>{arr.length} order{arr.length!==1?'s':''}</div>
              </div>
              <div style={{fontWeight:800,color:c,fontSize:15}}>{fmt(arr.reduce((s,x)=>s+(x.total||0),0))}</div>
            </div>
          ))}
        </Card>

        {/* Stock Levels */}
        <Card title='Live Stock Levels' icon='📦'>
          {products.map(p=>(
            <div key={p.id} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:600}}>{p.name}</span>
                <Badge label={`${p.stock} units`} color={p.stock<=0?'red':p.stock<=p.reorder?'red':p.stock<=p.reorder*1.5?'amber':'green'}/>
              </div>
              <div style={{height:7,background:'#E0E0D8',borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(100,(p.stock/80)*100)}%`,
                  background:p.stock<=p.reorder?C.red:p.stock<=p.reorder*1.5?C.amber:C.green,borderRadius:4}}/>
              </div>
            </div>
          ))}
        </Card>

        {/* Recent Sales */}
        <Card title='Recent Orders' icon='🧾'>
          {[...sales].reverse().slice(0,6).map(s=>(
            <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{s.customer}</div>
                <div style={{fontSize:11,color:'#888'}}>{s.product} · {s.date}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:13,fontWeight:700,color:C.dark}}>{fmt(s.total)}</div>
                <Badge label={s.status} color={s.status==='Paid'?'green':s.status==='Partial'?'amber':'red'}/>
              </div>
            </div>
          ))}
        </Card>

        {/* Financial Snapshot */}
        <Card title='Financial Snapshot' icon='📈'>
          {[
            ['Total Revenue',     fmt(totalRev),          C.dark ],
            ['Cash Collected',    fmt(totalPaid),          C.dark ],
            ['Total Expenses',    fmt(totalExp),           C.red  ],
            ['Net Profit',        fmt(totalPaid-totalExp), totalPaid>totalExp?C.dark:C.red],
            ['Inventory Value',   fmt(stockVal),           '#7D4E00'],
            ['Outstanding',       fmt(outstanding),        C.amber],
            ['Profit Margin',     `${((totalPaid-totalExp)/Math.max(totalPaid,1)*100).toFixed(1)}%`, C.dark],
            ['Paid Orders',       `${fullPaid.length} / ${sales.length}`, C.dark],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13}}>{l}</span>
              <span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Outstanding detail */}
      {(partPaid.length>0||unpaid.length>0)&&(
        <Card title='⚠️ Outstanding Payments — Action Required' icon=''>
          <Table compact
            headers={['Customer','Product','Order Total','Paid','Balance Owing','Status']}
            rows={[...partPaid,...unpaid].map(s=>[
              s.customer, s.product, fmt(s.total),
              <span style={{color:C.green,fontWeight:700}}>{fmt(s.paid)}</span>,
              <span style={{color:C.red,fontWeight:800}}>{fmt((s.total||0)-(s.paid||0))}</span>,
              <Badge label={s.status} color={s.status==='Partial'?'amber':'red'}/>,
            ])}
          />
        </Card>
      )}
    </div>
  );
}
