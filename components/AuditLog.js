'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Format timestamp: "Mon 19 Oct 2026 — 10:45:32 PM"
function fmtTime(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return d.toLocaleString('en-NG', {
      weekday: 'short',
      day:     'numeric',
      month:   'short',
      year:    'numeric',
      hour:    '2-digit',
      minute:  '2-digit',
      second:  '2-digit',
      hour12:  true,
      timeZone: 'Africa/Lagos',
    });
  } catch { return ts; }
}

// How long ago: "3 mins ago", "2 hrs ago"
function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

const ACTION_COLORS = {
  LOGIN:   { bg:'#E8F5EE', text:'#165C35', icon:'🔓' },
  LOGOUT:  { bg:'#FEF9E7', text:'#7D4E00', icon:'🚪' },
  CREATE:  { bg:'#EBF5FB', text:'#1A56DB', icon:'➕' },
  UPDATE:  { bg:'#FDF6E3', text:'#7D4E00', icon:'✏️' },
  DELETE:  { bg:'#FADBD8', text:'#C0392B', icon:'🗑' },
  EXPORT:  { bg:'#F4F3EE', text:'#555',   icon:'⬇️' },
  DEFAULT: { bg:'#F4F3EE', text:'#555',   icon:'📌' },
};

function ActionBadge({ action }) {
  const c = ACTION_COLORS[action?.toUpperCase()] || ACTION_COLORS.DEFAULT;
  return (
    <span style={{background:c.bg,color:c.text,borderRadius:20,padding:'3px 10px',
      fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>
      {c.icon} {action}
    </span>
  );
}

export default function AuditLog() {
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filter,    setFilter]    = useState('');     // search text
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page,      setPage]      = useState(1);
  const PER_PAGE = 50;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const { data, error: err } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        if (err) throw err;
        setLogs(data || []);
      } catch (e) {
        setError('Could not load audit log: ' + e.message);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  // Filter logs
  const filtered = logs.filter(l => {
    const matchText = !filter || [l.action,l.module,l.description,l.user_name]
      .some(v => v?.toLowerCase().includes(filter.toLowerCase()));
    const matchAction = actionFilter === 'ALL' || l.action?.toUpperCase() === actionFilter;
    return matchText && matchAction;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const actionTypes = ['ALL', 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'];

  return (
    <div>
      {/* KPIs */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
        {[
          ['Total Events',  logs.length,                                            '#165C35','#E8F5EE'],
          ['Logins',        logs.filter(l=>l.action==='LOGIN').length,              '#165C35','#E8F5EE'],
          ['Today',         logs.filter(l=>l.created_at?.startsWith(new Date().toISOString().slice(0,10))).length, '#1A56DB','#EBF5FB'],
          ['Deletes',       logs.filter(l=>l.action==='DELETE').length,             '#C0392B','#FADBD8'],
        ].map(([label,val,c,bg])=>(
          <div key={label} style={{background:bg,borderRadius:12,padding:'14px 18px',
            flex:1,minWidth:120,borderLeft:`4px solid ${c}`}}>
            <div style={{fontSize:10,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:5,fontFamily:'sans-serif'}}>{label}</div>
            <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:'sans-serif'}}>{val}</div>
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{background:'#fff',borderRadius:14,border:'1px solid #C9C9C0',overflow:'hidden'}}>

        {/* Header */}
        <div style={{background:'#1F6F43',padding:'14px 20px',display:'flex',
          justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <span style={{color:'#fff',fontWeight:700,fontSize:15,fontFamily:'sans-serif'}}>
            🔍 Audit Trail — All System Events
          </span>
          <span style={{color:'rgba(255,255,255,0.7)',fontSize:12,fontFamily:'sans-serif'}}>
            {filtered.length} record{filtered.length!==1?'s':''} · timestamps in WAT (UTC+1)
          </span>
        </div>

        {/* Filters */}
        <div style={{padding:'14px 20px',borderBottom:'1px solid #eee',
          display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <input
            value={filter}
            onChange={e=>{setFilter(e.target.value);setPage(1);}}
            placeholder="Search by action, module, user, description…"
            style={{flex:1,minWidth:200,border:'1px solid #C9C9C0',borderRadius:7,
              padding:'8px 12px',fontSize:13,fontFamily:'sans-serif'}}
          />
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {actionTypes.map(a=>(
              <button key={a} onClick={()=>{setActionFilter(a);setPage(1);}}
                style={{padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer',
                  fontSize:11,fontWeight:700,fontFamily:'sans-serif',
                  background:actionFilter===a?'#1F6F43':'#eee',
                  color:actionFilter===a?'#fff':'#555'}}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{overflowX:'auto'}}>
          {loading ? (
            <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
              ⏳ Loading audit events…
            </div>
          ) : error ? (
            <div style={{padding:40,textAlign:'center',color:'#C0392B',fontFamily:'sans-serif'}}>⚠️ {error}</div>
          ) : paginated.length === 0 ? (
            <div style={{padding:40,textAlign:'center',color:'#888',fontFamily:'sans-serif'}}>
              No audit events found.
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr>
                  {['#','Date & Time (WAT)','Time Ago','Action','Module','Description','User'].map(h=>(
                    <th key={h} style={{background:'#165C35',color:'#fff',padding:'10px 14px',
                      textAlign:'left',fontSize:11,textTransform:'uppercase',whiteSpace:'nowrap',
                      fontFamily:'sans-serif'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((l, i) => (
                  <tr key={l.id||i} style={{background:i%2===0?'#F9F9F7':'#fff',
                    borderBottom:'1px solid #f0f0ec'}}>
                    <td style={{padding:'10px 14px',color:'#bbb',fontSize:11,fontFamily:'sans-serif'}}>
                      {(page-1)*PER_PAGE + i + 1}
                    </td>
                    {/* Timestamp — full date + time */}
                    <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:12,
                      whiteSpace:'nowrap',color:'#333',fontWeight:600}}>
                      {fmtTime(l.created_at)}
                    </td>
                    {/* Relative time */}
                    <td style={{padding:'10px 14px',fontSize:11,color:'#aaa',
                      fontFamily:'sans-serif',whiteSpace:'nowrap'}}>
                      {timeAgo(l.created_at)}
                    </td>
                    <td style={{padding:'10px 14px'}}>
                      <ActionBadge action={l.action}/>
                    </td>
                    <td style={{padding:'10px 14px',fontFamily:'sans-serif',fontSize:12,
                      color:'#555',fontWeight:600}}>
                      {l.module||'—'}
                    </td>
                    <td style={{padding:'10px 14px',fontFamily:'sans-serif',fontSize:13,
                      color:'#333',maxWidth:340,wordBreak:'break-word'}}>
                      {l.description||'—'}
                    </td>
                    <td style={{padding:'10px 14px',fontFamily:'sans-serif',fontSize:12,
                      fontWeight:700,color:'#165C35',whiteSpace:'nowrap'}}>
                      {l.user_name||'—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{padding:'14px 20px',borderTop:'1px solid #eee',display:'flex',
            gap:8,alignItems:'center',justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>setPage(1)} disabled={page===1}
              style={{padding:'6px 12px',borderRadius:7,border:'1px solid #C9C9C0',
                background:page===1?'#f5f5f5':'#fff',cursor:page===1?'default':'pointer',
                fontSize:12,fontFamily:'sans-serif'}}>« First</button>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{padding:'6px 12px',borderRadius:7,border:'1px solid #C9C9C0',
                background:page===1?'#f5f5f5':'#fff',cursor:page===1?'default':'pointer',
                fontSize:12,fontFamily:'sans-serif'}}>‹ Prev</button>
            <span style={{fontSize:12,color:'#888',fontFamily:'sans-serif',padding:'0 8px'}}>
              Page {page} of {totalPages} ({filtered.length} events)
            </span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{padding:'6px 12px',borderRadius:7,border:'1px solid #C9C9C0',
                background:page===totalPages?'#f5f5f5':'#fff',cursor:page===totalPages?'default':'pointer',
                fontSize:12,fontFamily:'sans-serif'}}>Next ›</button>
            <button onClick={()=>setPage(totalPages)} disabled={page===totalPages}
              style={{padding:'6px 12px',borderRadius:7,border:'1px solid #C9C9C0',
                background:page===totalPages?'#f5f5f5':'#fff',cursor:page===totalPages?'default':'pointer',
                fontSize:12,fontFamily:'sans-serif'}}>Last »</button>
          </div>
        )}
      </div>
    </div>
  );
}