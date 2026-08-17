// ═══════════════════════════════════════════════════
// Finance.js
// ═══════════════════════════════════════════════════
'use client';
import { useState } from 'react';
import { db } from '@/lib/supabase';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { COLORS as C } from '@/lib/constants';
import { Card, Table, Badge, Btn, Input, Select, Modal, KPI, Grid, exportCSV, fmt, today } from './ui';

export function Finance({ sales, expenses, setExpenses, staff, setStaff }) {
  const [tab,    setTab]    = useState('expenses');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const blankExp  = { date:today(), description:'', vendor:'', category:'Rent', amount:'', method:'Bank Transfer', approved:'Veronica', ref:'', status:'Paid' };
  const blankStaff = { id:'', name:'', department:'', role:'', salary:'0', status:'Active' };

  const saveExp = async () => {
    if (!form.description||!form.amount) return alert('Description and amount required.');
    setSaving(true);
    const payload = { ...form, amount:Number(form.amount)||0 };
    if (!payload.id) payload.id = `EXP-${String(expenses.length+1).padStart(3,'0')}`;
    try {
      if (modal==='add-exp') {
        const row = await db.addExpense(payload).catch(()=>null);
        setExpenses(prev=>[...prev, row||payload]);
      } else {
        await db.updateExpense(form.id, payload).catch(()=>{});
        setExpenses(prev=>prev.map(e=>e.id===form.id?payload:e));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const delExp = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await db.deleteExpense(id).catch(()=>{});
    setExpenses(prev=>prev.filter(e=>e.id!==id));
  };

  const saveStaff = async () => {
    if (!form.name) return alert('Staff name required.');
    setSaving(true);
    const payload = { ...form, salary:Number(form.salary)||0 };
    if (!payload.id) payload.id = `STF-${String(staff.length+1).padStart(4,'0')}`;
    try {
      if (modal==='add-staff') {
        const row = await db.addStaff(payload).catch(()=>null);
        setStaff(prev=>[...prev, row||payload]);
      } else {
        await db.updateStaff(form.id, payload).catch(()=>{});
        setStaff(prev=>prev.map(s=>s.id===form.id?payload:s));
      }
      setModal(null);
    } catch(e){ alert('Error: '+e.message); }
    setSaving(false);
  };

  const totalExp  = expenses.reduce((s,e)=>s+(e.amount||0),0);
  const totalRev  = sales.reduce((s,x)=>s+(x.total||0),0);
  const totalPaid = sales.reduce((s,x)=>s+(x.paid||0),0);
  const payroll   = staff.reduce((s,x)=>s+(x.salary||0),0);

  const expByCategory = EXPENSE_CATEGORIES.reduce((acc,cat)=>{
    acc[cat] = expenses.filter(e=>e.category===cat).reduce((s,e)=>s+(e.amount||0),0);
    return acc;
  },{});

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['expenses','💸 Expenses'],['payroll','👨‍💼 Payroll'],['pl','📈 P&L']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,
              background:tab===k?C.green:'#eee',color:tab===k?'#fff':C.body}}>
            {l}
          </button>
        ))}
      </div>

      {tab==='expenses' && (
        <>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
            <KPI label='Total Expenses' value={fmt(totalExp)} color={C.red} bg={C.lightRed}/>
            <KPI label='Paid' value={fmt(expenses.filter(e=>e.status==='Paid').reduce((s,e)=>s+(e.amount||0),0))} color={C.dark} bg={C.lightGreen}/>
            <KPI label='Pending' value={fmt(expenses.filter(e=>e.status==='Pending').reduce((s,e)=>s+(e.amount||0),0))} color={C.amber} bg={C.lightAmber}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20,marginBottom:20}}>
            <Card title='By Category' icon='💸'>
              {Object.entries(expByCategory).filter(([,v])=>v>0).map(([cat,amt])=>(
                <div key={cat} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12}}>{cat}</span>
                  <span style={{fontSize:13,fontWeight:700,color:C.red}}>{fmt(amt)}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderTop:`2px solid ${C.red}`,marginTop:4}}>
                <span style={{fontSize:13,fontWeight:700}}>TOTAL</span>
                <span style={{fontSize:14,fontWeight:800,color:C.red}}>{fmt(totalExp)}</span>
              </div>
            </Card>
            <Card title='All Expenses' icon=''
              actions={[
                <Btn key='a' small color='gold' onClick={()=>{setForm({...blankExp});setModal('add-exp');}}>+ Add Expense</Btn>,
                <Btn key='e' small color='blue' onClick={()=>exportCSV(expenses,'expenses.csv')}>⬇️ Export</Btn>,
              ]}>
              <Table compact
                headers={['ID','Date','Description','Vendor','Category','Amount','Method','Status','Actions']}
                rows={expenses.map(e=>[
                  <code style={{fontSize:10,background:C.lightGold,padding:'2px 5px',borderRadius:4}}>{e.id}</code>,
                  e.date, e.description||e.desc, e.vendor, e.category,
                  <span style={{fontWeight:700,color:C.red}}>{fmt(e.amount)}</span>,
                  e.method,
                  <Badge label={e.status||'Paid'} color={e.status==='Pending'?'amber':'green'}/>,
                  <div style={{display:'flex',gap:4}}>
                    <Btn small color='blue' onClick={()=>{setForm({...e,amount:String(e.amount)});setModal('edit-exp');}}>Edit</Btn>
                    <Btn small color='red'  onClick={()=>delExp(e.id)}>Del</Btn>
                  </div>,
                ])}
              />
            </Card>
          </div>
        </>
      )}

      {tab==='payroll' && (
        <Card title='Staff & Payroll — CONFIDENTIAL' icon='👨‍💼'
          actions={[
            <Btn key='a' small color='gold' onClick={()=>{setForm({...blankStaff});setModal('add-staff');}}>+ Add Staff</Btn>,
            <Btn key='e' small color='blue' onClick={()=>exportCSV(staff,'payroll.csv')}>⬇️ Export</Btn>,
          ]}>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
            <KPI label='Monthly Payroll'  value={fmt(payroll)}        color={C.navy} bg='#EBF5FB'/>
            <KPI label='Annual Payroll'   value={fmt(payroll*12)}     color={C.navy} bg='#EBF5FB'/>
            <KPI label='Active Staff'     value={staff.filter(s=>s.status==='Active').length} color={C.dark} bg={C.lightGreen}/>
          </div>
          <Table
            headers={['ID','Name','Department','Role','Gross Salary','Deductions','Net Pay','Status','Actions']}
            rows={staff.map(s=>[
              <code style={{fontSize:11,background:C.lightGold,padding:'2px 5px',borderRadius:4}}>{s.id}</code>,
              <span style={{fontWeight:700}}>{s.name}</span>,
              s.department||s.dept, s.role, fmt(s.salary),
              fmt((s.salary||0)*0.05),
              <span style={{fontWeight:700,color:C.dark}}>{fmt((s.salary||0)*0.95)}</span>,
              <Badge label={s.status} color='green'/>,
              <div style={{display:'flex',gap:6}}>
                <Btn small color='blue' onClick={()=>{setForm({...s,salary:String(s.salary)});setModal('edit-staff');}}>Edit</Btn>
                <Btn small color='red'  onClick={()=>{if(window.confirm('Remove staff?')){db.deleteStaff(s.id).catch(()=>{});setStaff(prev=>prev.filter(x=>x.id!==s.id));}}}>Del</Btn>
              </div>,
            ])}
          />
          <div style={{borderTop:`2px solid ${C.green}`,paddingTop:12,marginTop:8,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontWeight:700,fontSize:14}}>MONTHLY NET PAYROLL TOTAL</span>
            <span style={{fontWeight:800,fontSize:16,color:C.dark}}>{fmt(payroll*0.95)}</span>
          </div>
        </Card>
      )}

      {tab==='pl' && (
        <Card title='Profit & Loss Statement' icon='📈'
          actions={[<Btn key='e' small color='blue' onClick={()=>exportCSV([{revenue:totalRev,collected:totalPaid,expenses:totalExp,profit:totalPaid-totalExp}],'pl.csv')}>⬇️ Export</Btn>]}>
          {[
            ['REVENUE',null,'section'],
            ['Total Sales Revenue',fmt(totalRev),'in'],
            ['Cash Collected',fmt(totalPaid),'in'],
            ['Outstanding',fmt(totalRev-totalPaid),'warn'],
            ['GROSS REVENUE',fmt(totalRev),'total-green'],
            [null,null,'spacer'],
            ['OPERATING EXPENSES',null,'section'],
            ...Object.entries(expByCategory).filter(([,v])=>v>0).map(([k,v])=>[k,fmt(v),'out']),
            ['TOTAL EXPENSES',fmt(totalExp),'total-red'],
            [null,null,'spacer'],
            ['NET PROFIT / (LOSS)',fmt(totalPaid-totalExp),'net'],
            ['PROFIT MARGIN',`${(((totalPaid-totalExp)/Math.max(totalPaid,1))*100).toFixed(1)}%`,'margin'],
          ].map(([lbl,val,type],i)=>{
            if (type==='spacer') return <div key={i} style={{height:12}}/>;
            if (type==='section') return <div key={i} style={{background:C.dark,color:C.gold,padding:'8px 12px',fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:1,marginBottom:2}}>{lbl}</div>;
            const S = {
              in:{b:C.lightGreen,c:C.dark,fw:400},out:{b:C.lightRed,c:C.red,fw:400},
              warn:{b:C.lightAmber,c:C.amber,fw:400},'total-green':{b:C.lightGreen,c:C.dark,fw:800},
              'total-red':{b:C.lightRed,c:C.red,fw:800},net:{b:C.navy,c:C.gold,fw:800},
              margin:{b:'#EBF5FB',c:C.blue,fw:700},
            }[type]||{b:'#fff',c:C.body,fw:400};
            return (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',background:S.b,borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:type==='net'?15:13,fontWeight:S.fw,paddingLeft:type==='out'?16:0,color:type==='net'?'#fff':C.body}}>{lbl}</span>
                {val&&<span style={{fontSize:type==='net'?17:13,fontWeight:S.fw,color:S.c}}>{val}</span>}
              </div>
            );
          })}
        </Card>
      )}

      {(modal==='add-exp'||modal==='edit-exp')&&(
        <Modal title={modal==='add-exp'?'Add Expense':'Edit Expense'} onClose={()=>setModal(null)}>
          <Grid cols={2}>
            <Input label='Date' type='date' value={form.date} onChange={v=>f('date',v)} required/>
            <Input label='Description' value={form.description||form.desc||''} onChange={v=>f('description',v)} required/>
            <Input label='Vendor / Paid To' value={form.vendor} onChange={v=>f('vendor',v)}/>
            <Select label='Category' value={form.category} onChange={v=>f('category',v)} options={EXPENSE_CATEGORIES}/>
            <Input label='Amount (₦)' type='number' value={form.amount} onChange={v=>f('amount',v)} required/>
            <Select label='Payment Method' value={form.method} onChange={v=>f('method',v)} options={['Bank Transfer','Cash','POS','Online Transfer','Cheque']}/>
            <Input label='Approved By' value={form.approved} onChange={v=>f('approved',v)}/>
            <Input label='Receipt / Ref No.' value={form.ref} onChange={v=>f('ref',v)}/>
            <Select label='Status' value={form.status||'Paid'} onChange={v=>f('status',v)} options={['Paid','Pending']}/>
          </Grid>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <Btn onClick={saveExp} color='green' disabled={saving}>{saving?'Saving…':'Save Expense'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}

      {(modal==='add-staff'||modal==='edit-staff')&&(
        <Modal title={modal==='add-staff'?'Add Staff Member':'Edit Staff Member'} onClose={()=>setModal(null)}>
          <Grid cols={2}>
            <Input label='Full Name' value={form.name} onChange={v=>f('name',v)} required/>
            <Select label='Department' value={form.department||form.dept||''} onChange={v=>f('department',v)} options={['Management','Production','Sales','Marketing','Administration','Logistics','Quality Control']}/>
            <Input label='Role / Position' value={form.role} onChange={v=>f('role',v)}/>
            <Input label='Gross Monthly Salary (₦)' type='number' value={form.salary} onChange={v=>f('salary',v)}/>
            <Select label='Status' value={form.status} onChange={v=>f('status',v)} options={['Active','On Leave','Resigned','Terminated']}/>
          </Grid>
          {form.salary&&<div style={{background:C.lightGold,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}}>
            Net Pay (after 5% deduction): <strong style={{color:C.dark}}>{fmt(Number(form.salary)*0.95)}</strong>
          </div>}
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <Btn onClick={saveStaff} color='green' disabled={saving}>{saving?'Saving…':'Save Staff'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Finance;
