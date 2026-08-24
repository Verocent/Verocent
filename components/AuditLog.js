'use client';
import { useState, useEffect } from 'react';

function Badge({ label, color='green' }) {
  const map = {
    green:{b:'#E8F5EE',t:'#165C35'}, red:{b:'#FADBD8',t:'#C0392B'},
    amber:{b:'#FEF9E7',t:'#E67E22'}, gold:{b:'#FDF6E3',t:'#7D4E00'},
    blue:{b:'#EBF5FB',t:'#1A56DB'}, navy:{b:'#E8ECF0',t:'#1B2631'},
  };
  const s = map[color]||map.green;
  return <span style={{background:s.b,color:s.t,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{label}</span>;
}

function KPI({ label, value, color='#165C35', bg='#E8F5EE' }) {
  return (
    <div style={{background:bg,borderRadius:12,padding:'14px 18px',flex:1,minWidth:130,borderLeft:`4px solid ${color}`}}>
      <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color,fontFamily:'sans-serif'}}>{value}</div>
    </div>
  );
}

const exportCSV = (data, filename) => {
  if (!data?.length) return;
  const h = Object.keys(data[0]).join(',');
  const r = data.map(row=>Object.values(row).map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([h+'\n'+r],{type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
};

const actionColor = a => a==='LOGIN'?'green':a==='LOGOUT'?'navy':a==='DELETE'?'red':a==='UPDATE'?'amber':'blue';
const actionIcon  = a => a==='LOGIN'?'🔐':a==='LOGOUT'?'🚪':a==='DELETE'?'🗑️':a==='UPDATE'?'✏️':a==='CREATE'?'➕':'📋';

export default function AuditLog({ currentUser }) {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterUser,   setFilterUser]   = useState('All');

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      setLogs(data || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const filtered = logs.filter(l => {
    const matchAction = filterAction==='All' || l.action===filterAction;
    const matchUser   = filterUser==='All'   || l.user_name===filterUser;
    const matchSearch = !search ||
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.module?.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchUser && matchSearch;
  });

  const uniqueUsers   = [...new Set(logs.map(l=>l.user_name))].filter(Boolean);
  const uniqueActions = [...new Set(logs.map(l=>l.action))].filter(Boolean);
  const todayLogs     = logs.filter(l=>l.created_at?.startsWith(new Date().toISOString().split('T')[0]));
  const loginCount    = logs.filter(l=>l.action==='LOGIN').length;
  const failCount     = logs.filter(l=>l.status==='Failed').length;

  const formatTime = ts => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'})
      +' '+d.toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'});
  };

  const TH = ({children}) => (
    <th style={{background:'#165C35',color:'#fff',padding:'9px 12px',
      textAlign:'left',fontSize:11,textTransform:'uppercase',
      whiteSpace:'nowrap',fontFamily:'sans-serif'}}>{children}</th>
  );

  return (
    <div>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#1B2631,#165C35)',
        borderRadius:14,padding:'20px 24px',marginBottom:20,
        display:'flex',justifyContent:'space-between',
        alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{color:'#D4A017',fontWeight:800,fontSize:18,fontFamily:'sans-serif'}}>🔍 Audit Log</div>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:13,fontFamily:'sans-serif',marginTop:4}}>
            Complete record of all staff activity in Verocent ERP
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={loadLogs}
            style={{background:'#1A56DB',color:'#fff',border:'none',borderRadius:7,
              padding:'8px 16px',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'sans-serif'}}>
            🔄 Refresh
          </button>
          <button onClick={()=>exportCSV(filtered,'audit-log.csv')}
            style={{background:'#D4A017',color:'#fff',border:'none',borderRadius:7,
              padding:'8px 16px',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'sans-serif'}}>
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      {/* Confidential warning */}
      <div style={{background:'#FADBD8',border:'1px solid #C0392B',borderRadius:8,
        padding:'10px 16px',marginBottom:16,fontSize:13,
        fontFamily:'sans-serif',color:'#C0392B',fontWeight:700}}>
        🔒 CONFIDENTIAL — Only visible to Founder. Records every action by every staff member.
      </div>

      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        <KPI label='Total Entries'   value={logs.length}/>
        <KPI label="Today's Activity" value={todayLogs.length} color='#1A56DB' bg='#EBF5FB'/>
        <KPI label='Total Logins'    value={loginCount}/>
        <KPI label='Failed Actions'  value={failCount} color={failCount>0?'#C0392B':'#165C35'} bg={failCount>0?'#FADBD8':'#E8F5EE'}/>
        <KPI label='Active Users'    value={uniqueUsers.length} color='#7D4E00' bg='#FDF6E3'/>
      </div>

      {/* Filters */}
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #C9C9C0',
        padding:'16px 20px',marginBottom:16}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder='🔍 Search by name, module, or description...'
            style={{flex:2,minWidth:200,border:'1px solid #C9C9C0',borderRadius:6,
              padding:'8px 12px',fontSize:13,boxSizing:'border-box',fontFamily:'sans-serif'}}/>
          <select value={filterAction} onChange={e=>setFilterAction(e.target.value)}
            style={{flex:1,minWidth:140,border:'1px solid #C9C9C0',borderRadius:6,
              padding:'8px 10px',fontSize:13,background:'#fff',fontFamily:'sans-serif'}}>
            <option value='All'>All Actions</option>
            {uniqueActions.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterUser} onChange={e=>setFilterUser(e.target.value)}
            style={{flex:1,minWidth:140,border:'1px solid #C9C9C0',borderRadius:6,
              padding:'8px 10px',fontSize:13,background:'#fff',fontFamily:'sans-serif'}}>
            <option value='All'>All Staff</option>
            {uniqueUsers.map(u=><option key={u} value={u}>{u}</option>)}
          </select>
          <button onClick={()=>{setSearch('');setFilterAction('All');setFilterUser('All');}}
            style={{background:'transparent',color:'#888',border:'2px solid #C9C9C0',
              borderRadius:7,padding:'8px 14px',fontWeight:700,fontSize:13,
              cursor:'pointer',fontFamily:'sans-serif'}}>
            Clear
          </button>
        </div>
        <div style={{marginTop:10,fontSize:12,color:'#888',fontFamily:'sans-serif'}}>
          Showing <strong>{filtered.length}</strong> of <strong>{logs.length}</strong> entries
        </div>
      </div>

      {/* Table */}
      <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>
        <div style={{background:'#1B2631',padding:'12px 20px'}}>
          <span style={{color:'#D4A017',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>
            📋 Activity Log
          </span>
        </div>
        <div style={{overflowX:'auto'}}>
          {loading ? (
            <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
              <div style={{fontSize:30,marginBottom:8}}>🔄</div>
              Loading audit log...
            </div>
          ) : filtered.length===0 ? (
            <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
              <div style={{fontSize:30,marginBottom:8}}>📋</div>
              No entries match your filter.
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
              <thead><tr>
                <TH>Time & Date</TH>
                <TH>Staff Member</TH>
                <TH>Action</TH>
                <TH>Module</TH>
                <TH>Description</TH>
                <TH>Device</TH>
                <TH>Status</TH>
              </tr></thead>
              <tbody>
                {filtered.map((log,i)=>(
                  <tr key={log.id} style={{background:i%2===0?'#F9F9F7':'#fff'}}>
                    <td style={{padding:'10px 12px',fontFamily:'sans-serif',
                      fontSize:12,color:'#666',whiteSpace:'nowrap'}}>
                      {formatTime(log.created_at)}
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{fontFamily:'sans-serif',fontSize:13,
                        fontWeight:700,color:'#165C35'}}>{log.user_name}</div>
                      <div style={{fontFamily:'sans-serif',fontSize:11,color:'#888'}}>
                        {log.user_email}
                      </div>
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      {actionIcon(log.action)}{' '}
                      <Badge label={log.action} color={actionColor(log.action)}/>
                    </td>
                    <td style={{padding:'10px 12px',fontFamily:'sans-serif',
                      fontSize:13,color:'#1A56DB',fontWeight:600}}>
                      {log.module||'—'}
                    </td>
                    <td style={{padding:'10px 12px',fontFamily:'sans-serif',
                      fontSize:12,color:'#444',maxWidth:280}}>
                      {log.description||'—'}
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <Badge label={log.device==='Mobile'?'📱 Mobile':'💻 Desktop'}
                        color={log.device==='Mobile'?'amber':'blue'}/>
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <Badge label={log.status||'Success'}
                        color={log.status==='Failed'?'red':'green'}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}