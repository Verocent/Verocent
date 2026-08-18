'use client';
import { useState } from 'react';

const C = {
  green:'#1F6F43', dark:'#165C35', gold:'#D4A017',
  lightGreen:'#E8F5EE', lightGold:'#FDF6E3', white:'#FFFFFF',
  body:'#1A1A1A', border:'#C9C9C0', red:'#C0392B',
  lightRed:'#FADBD8', amber:'#E67E22', lightAmber:'#FEF9E7',
  blue:'#1A56DB', navy:'#1B2631',
};

const fmt = n => `₦${Number(n||0).toLocaleString()}`;

function Badge({ label, color='green' }) {
  const map = {
    green:{b:'#E8F5EE',t:'#165C35'}, red:{b:'#FADBD8',t:'#C0392B'},
    amber:{b:'#FEF9E7',t:'#E67E22'}, gold:{b:'#FDF6E3',t:'#7D4E00'},
    blue:{b:'#EBF5FB',t:'#1A56DB'}, navy:{b:'#E8ECF0',t:'#1B2631'},
  };
  const s = map[color]||map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bg = {green:C.green,red:C.red,gold:C.gold,blue:C.blue,amber:C.amber,grey:'#e0e0e0'}[color]||C.green;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:outline?'transparent':bg,color:outline?bg:'#fff',
        border:outline?`2px solid ${bg}`:'none',borderRadius:7,
        padding:small?'4px 10px':'8px 16px',fontWeight:700,
        fontSize:small?11:13,cursor:disabled?'not-allowed':'pointer',
        fontFamily:'inherit',opacity:disabled?.7:1}}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type='text', placeholder='' }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:C.dark,textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',border:`1px solid ${C.border}`,borderRadius:6,padding:'8px 10px',fontSize:13,boxSizing:'border-box',fontFamily:'inherit'}}/>
    </div>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <div style={{marginBottom:12}}>
      {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:C.dark,textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{label}</label>}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',border:`1px solid ${C.border}`,borderRadius:6,padding:'8px 10px',fontSize:13,background:'#fff',fontFamily:'inherit'}}>
        <option value=''>— Select —</option>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:600,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{background:C.green,padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0'}}>
          <span style={{color:'#fff',fontWeight:800,fontSize:15,fontFamily:'sans-serif'}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

// Access levels and what each can see
const ACCESS_LEVELS = {
  'Founder / CEO': {
    label: 'Founder / CEO',
    color: 'gold',
    description: 'Full access to all modules including finance, payroll, and compliance',
    modules: ['dashboard','products','production','inventory','sales','finance','compliance','reports','staff'],
  },
  'Production Manager': {
    label: 'Production Manager',
    color: 'green',
    description: 'Access to production, inventory, raw materials, and QC',
    modules: ['dashboard','products','production','inventory'],
  },
  'Sales Executive': {
    label: 'Sales Executive',
    color: 'blue',
    description: 'Access to sales, customers, products, and dashboard',
    modules: ['dashboard','products','sales'],
  },
  'QC Inspector': {
    label: 'QC Inspector',
    color: 'green',
    description: 'Access to production (QC log), inventory, and dashboard',
    modules: ['dashboard','production','inventory'],
  },
  'Social Media Manager': {
    label: 'Social Media Manager',
    color: 'blue',
    description: 'View-only access to products and dashboard',
    modules: ['dashboard','products'],
  },
  'Accountant': {
    label: 'Accountant',
    color: 'navy',
    description: 'Access to finance, expenses, payroll, and reports',
    modules: ['dashboard','finance','reports'],
  },
};

const DEPARTMENTS = ['Management','Production','Sales','Marketing','Administration','Logistics','Quality Control','Finance'];

const blankStaff = {
  name:'', department:'', role:'', access_level:'Sales Executive',
  phone:'', email:'', salary:'0', start_date:'', status:'Active', notes:'',
};

export default function StaffAccess({ staff=[], setStaff }) {
  const [tab, setTab]     = useState('staff');
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const save = async () => {
    if (!form.name) return alert('Staff name is required.');
    setSaving(true);
    const payload = {
      ...form,
      salary: Number(form.salary)||0,
      id: form.id || `STF-${String(staff.length+1).padStart(4,'0')}`,
    };
    try {
      const { db } = await import('@/lib/supabase');
      if (modal==='add') {
        const row = await db.addStaff(payload).catch(()=>null);
        setStaff(prev=>[...prev, row||{...payload,id:payload.id}]);
      } else {
        await db.updateStaff(form.id, payload).catch(()=>{});
        setStaff(prev=>prev.map(s=>s.id===form.id?payload:s));
      }
      setModal(null);
    } catch(e) { alert('Error: '+e.message); }
    setSaving(false);
  };

  const del = async (id, name) => {
    if (!window.confirm(`Remove staff member "${name}"? This cannot be undone.`)) return;
    try { const { db } = await import('@/lib/supabase'); await db.deleteStaff(id).catch(()=>{}); } catch(e){}
    setStaff(prev=>prev.filter(s=>s.id!==id));
  };

  const totalPayroll = staff.reduce((s,x)=>s+(x.salary||0),0);
  const activeStaff  = staff.filter(s=>s.status==='Active');

  const TH = ({children}) => <th style={{background:C.dark,color:'#fff',padding:'10px 14px',textAlign:'left',fontSize:11,textTransform:'uppercase',whiteSpace:'nowrap',fontFamily:'sans-serif'}}>{children}</th>;
  const TD = ({children,bold}) => <td style={{padding:'10px 14px',fontWeight:bold?700:400,color:C.body,verticalAlign:'middle',fontFamily:'sans-serif',fontSize:13}}>{children}</td>;

  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['staff','👨‍💼 Staff Register'],['access','🔐 Access Control'],['payroll','💰 Payroll Summary']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'sans-serif',
              background:tab===k?C.green:'#eee',color:tab===k?'#fff':C.body}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── STAFF REGISTER ── */}
      {tab==='staff'&&(
        <div>
          {/* KPIs */}
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
            {[
              ['Total Staff',     staff.length,               C.dark,  '#E8F5EE'],
              ['Active',          activeStaff.length,          C.dark,  '#E8F5EE'],
              ['Monthly Payroll', fmt(totalPayroll),           '#7D4E00','#FDF6E3'],
              ['Annual Payroll',  fmt(totalPayroll*12),        '#7D4E00','#FDF6E3'],
            ].map(([l,v,c,bg])=>(
              <div key={l} style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${c}`}}>
                <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{l}</div>
                <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:'sans-serif'}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden'}}>
            <div style={{background:C.green,padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>👨‍💼 Staff Register</span>
              <Btn small color='gold' onClick={()=>{setForm({...blankStaff});setModal('add');}}>+ Add Staff Member</Btn>
            </div>
            <div style={{padding:20,overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
                <thead><tr>
                  <TH>Staff ID</TH><TH>Name</TH><TH>Department</TH><TH>Role</TH>
                  <TH>Access Level</TH><TH>Phone</TH><TH>Gross Salary</TH>
                  <TH>Net Pay</TH><TH>Status</TH><TH>Actions</TH>
                </tr></thead>
                <tbody>
                  {staff.map((s,i)=>{
                    const access = ACCESS_LEVELS[s.access_level] || ACCESS_LEVELS['Sales Executive'];
                    return (
                      <tr key={s.id} style={{background:i%2===0?'#E8F5EE':'#fff'}}>
                        <TD><code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4}}>{s.id}</code></TD>
                        <TD bold>{s.name}</TD>
                        <TD>{s.department||s.dept}</TD>
                        <TD>{s.role}</TD>
                        <TD><Badge label={s.access_level||'Staff'} color={access.color}/></TD>
                        <TD>{s.phone||'—'}</TD>
                        <TD>{fmt(s.salary)}</TD>
                        <TD><span style={{fontWeight:700,color:C.dark}}>{fmt((s.salary||0)*0.95)}</span></TD>
                        <TD><Badge label={s.status} color={s.status==='Active'?'green':'amber'}/></TD>
                        <td style={{padding:'10px 14px'}}>
                          <div style={{display:'flex',gap:6}}>
                            <Btn small color='blue' onClick={()=>{setForm({...s,salary:String(s.salary)});setModal('edit');}}>Edit</Btn>
                            <Btn small color='red'  onClick={()=>del(s.id,s.name)}>Del</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {staff.length===0&&(
                    <tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
                      No staff members yet. Click + Add Staff Member to start.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Payroll total */}
            <div style={{borderTop:`2px solid ${C.green}`,padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#F9F9F7'}}>
              <span style={{fontFamily:'sans-serif',fontWeight:700,fontSize:14,color:C.body}}>MONTHLY NET PAYROLL TOTAL</span>
              <span style={{fontFamily:'sans-serif',fontWeight:800,fontSize:18,color:C.dark}}>{fmt(totalPayroll*0.95)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCESS CONTROL ── */}
      {tab==='access'&&(
        <div>
          <div style={{background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',marginBottom:20}}>
            <div style={{background:C.green,padding:'12px 20px'}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>🔐 Access Level Matrix</span>
            </div>
            <div style={{padding:20}}>
              <div style={{background:'#FEF9E7',border:`1px solid ${C.gold}`,borderRadius:8,padding:'12px 16px',marginBottom:20,fontSize:13,fontFamily:'sans-serif',color:'#7D4E00'}}>
                ⚠️ <strong>CONFIDENTIAL:</strong> This section defines who can access what in your ERP. Only the Founder should configure access levels. Share login credentials only with trusted staff.
              </div>

              {/* Access level cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
                {Object.entries(ACCESS_LEVELS).map(([key, level])=>(
                  <div key={key} style={{border:`2px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
                    <div style={{
                      background: key==='Founder / CEO'?C.gold:key==='Accountant'?C.navy:C.green,
                      padding:'10px 14px',display:'flex',alignItems:'center',gap:10,
                    }}>
                      <span style={{fontSize:20}}>{
                        key==='Founder / CEO'?'👑':
                        key==='Production Manager'?'🏭':
                        key==='Sales Executive'?'💰':
                        key==='QC Inspector'?'🔬':
                        key==='Social Media Manager'?'📱':
                        key==='Accountant'?'📊':'👤'
                      }</span>
                      <span style={{color:'#fff',fontWeight:700,fontSize:13,fontFamily:'sans-serif'}}>{key}</span>
                    </div>
                    <div style={{padding:14}}>
                      <div style={{fontSize:12,color:'#666',fontFamily:'sans-serif',marginBottom:10}}>{level.description}</div>
                      <div style={{fontSize:11,fontWeight:700,color:C.dark,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:'sans-serif'}}>Can Access:</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                        {level.modules.map(mod=>(
                          <span key={mod} style={{background:C.lightGreen,color:C.dark,borderRadius:4,padding:'2px 8px',fontSize:11,fontFamily:'sans-serif',fontWeight:600}}>
                            {mod}
                          </span>
                        ))}
                      </div>
                      {/* Staff with this level */}
                      {staff.filter(s=>s.access_level===key).length>0&&(
                        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                          <div style={{fontSize:11,color:'#888',fontFamily:'sans-serif',marginBottom:4}}>Assigned to:</div>
                          {staff.filter(s=>s.access_level===key).map(s=>(
                            <div key={s.id} style={{fontSize:12,fontWeight:600,color:C.body,fontFamily:'sans-serif'}}>• {s.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security recommendations */}
          <div style={{background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden'}}>
            <div style={{background:C.navy,padding:'12px 20px'}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>🛡️ Security Recommendations</span>
            </div>
            <div style={{padding:20}}>
              {[
                ['🔐','Use strong passwords','Each staff member should have a unique, strong password for their account. Never share passwords.'],
                ['👁️','Review access monthly','Every month, review who has access to what. Remove access immediately when a staff member leaves.'],
                ['📱','Mobile access','Your ERP is accessible from any phone at verocent.vercel.app — share this URL only with authorised staff.'],
                ['💾','Data backup','Your Supabase database automatically backs up your data. You can also export CSV from any module at any time.'],
                ['🚫','Restrict finance access','Only the Founder and Accountant should see payroll and financial data. Never share these login details.'],
                ['📋','Audit trail','Every record created shows who created it. Review the Records regularly to monitor staff activity.'],
              ].map(([icon,title,desc])=>(
                <div key={title} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:C.body,fontFamily:'sans-serif',marginBottom:3}}>{title}</div>
                    <div style={{fontSize:12,color:'#666',fontFamily:'sans-serif'}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PAYROLL SUMMARY ── */}
      {tab==='payroll'&&(
        <div style={{background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden'}}>
          <div style={{background:C.navy,padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>💰 Payroll Summary — CONFIDENTIAL</span>
          </div>
          <div style={{padding:20}}>
            <div style={{background:C.lightRed,border:`1px solid ${C.red}`,borderRadius:8,padding:'10px 14px',marginBottom:20,fontSize:13,fontFamily:'sans-serif',color:C.red,fontWeight:700}}>
              🔒 CONFIDENTIAL: This information should only be seen by the Founder and authorised finance staff.
            </div>

            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
              {[
                ['Monthly Gross',  fmt(totalPayroll),          '#7D4E00','#FDF6E3'],
                ['Monthly Net',    fmt(totalPayroll*0.95),     C.dark,   '#E8F5EE'],
                ['Deductions (5%)',fmt(totalPayroll*0.05),     C.red,    '#FADBD8'],
                ['Annual Gross',   fmt(totalPayroll*12),       '#7D4E00','#FDF6E3'],
              ].map(([l,v,c,bg])=>(
                <div key={l} style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${c}`}}>
                  <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{l}</div>
                  <div style={{fontSize:18,fontWeight:800,color:c,fontFamily:'sans-serif'}}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
                <thead><tr>
                  <TH>ID</TH><TH>Name</TH><TH>Role</TH><TH>Gross Salary</TH>
                  <TH>Deduction (5%)</TH><TH>Net Pay</TH><TH>Status</TH>
                </tr></thead>
                <tbody>
                  {staff.map((s,i)=>(
                    <tr key={s.id} style={{background:i%2===0?'#EBF5FB':'#fff'}}>
                      <TD><code style={{fontSize:10,background:'#FDF6E3',padding:'2px 5px',borderRadius:4}}>{s.id}</code></TD>
                      <TD bold>{s.name}</TD>
                      <TD>{s.role}</TD>
                      <TD>{fmt(s.salary)}</TD>
                      <TD><span style={{color:C.red,fontWeight:600}}>{fmt((s.salary||0)*0.05)}</span></TD>
                      <TD><span style={{fontWeight:700,color:C.dark,fontSize:14}}>{fmt((s.salary||0)*0.95)}</span></TD>
                      <TD><Badge label={s.status} color={s.status==='Active'?'green':'amber'}/></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{borderTop:`2px solid ${C.navy}`,marginTop:8,paddingTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontFamily:'sans-serif',fontWeight:700,fontSize:14}}>TOTAL MONTHLY NET PAYROLL</span>
              <span style={{fontFamily:'sans-serif',fontWeight:800,fontSize:20,color:C.dark}}>{fmt(totalPayroll*0.95)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal&&(
        <Modal title={modal==='add'?'Add Staff Member':'Edit Staff Member'} onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label='Full Name *' value={form.name} onChange={v=>f('name',v)}/>
            <Select label='Department' value={form.department||form.dept||''} onChange={v=>f('department',v)} options={DEPARTMENTS}/>
            <Input label='Role / Position' value={form.role} onChange={v=>f('role',v)} placeholder='e.g. Production Manager'/>
            <Select label='Access Level' value={form.access_level} onChange={v=>f('access_level',v)} options={Object.keys(ACCESS_LEVELS)}/>
            <Input label='Phone' value={form.phone} onChange={v=>f('phone',v)}/>
            <Input label='Email' value={form.email} onChange={v=>f('email',v)}/>
            <Input label='Gross Monthly Salary (₦)' type='number' value={form.salary} onChange={v=>f('salary',v)}/>
            <Input label='Start Date' type='date' value={form.start_date} onChange={v=>f('start_date',v)}/>
            <Select label='Status' value={form.status} onChange={v=>f('status',v)} options={['Active','On Leave','Resigned','Terminated']}/>
          </div>

          {/* Access level preview */}
          {form.access_level&&ACCESS_LEVELS[form.access_level]&&(
            <div style={{background:C.lightGreen,borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:13,fontFamily:'sans-serif'}}>
              <strong style={{color:C.dark}}>Access: {form.access_level}</strong>
              <div style={{color:'#666',marginTop:4}}>{ACCESS_LEVELS[form.access_level].description}</div>
              <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:4}}>
                {ACCESS_LEVELS[form.access_level].modules.map(m=>(
                  <span key={m} style={{background:C.lightGold,color:'#7D4E00',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600}}>✅ {m}</span>
                ))}
              </div>
            </div>
          )}

          {form.salary&&Number(form.salary)>0&&(
            <div style={{background:C.lightGold,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,fontFamily:'sans-serif'}}>
              Net Pay: <strong style={{color:C.dark}}>{fmt(Number(form.salary)*0.95)}</strong>
              {' '}| Deduction: <span style={{color:C.red}}>{fmt(Number(form.salary)*0.05)}</span>
            </div>
          )}

          <div style={{display:'flex',gap:10}}>
            <Btn onClick={save} color='green' disabled={saving}>{saving?'Saving…':'Save Staff Member'}</Btn>
            <Btn onClick={()=>setModal(null)} color='grey' outline>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
