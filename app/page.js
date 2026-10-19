'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ── Modules ────────────────────────────────────────────────
import Dashboard   from '@/components/Dashboard';
import Inventory   from '@/components/Inventory';
import Products    from '@/components/Products';
import Sales       from '@/components/Sales';
import Production  from '@/components/Production';
import StaffAccess from '@/components/StaffAccess';
import Reports     from '@/components/Reports';
import Compliance  from '@/components/Compliance';
import Documents   from '@/components/Documents';
import AuditLog    from '@/components/AuditLog';
import Settings    from '@/components/Settings';

// ── Nav items ──────────────────────────────────────────────
const NAV = [
  { id:'dashboard',  icon:'🏠', label:'Dashboard'   },
  { id:'inventory',  icon:'📦', label:'Inventory'   },
  { id:'products',   icon:'🧴', label:'Products'    },
  { id:'sales',      icon:'💰', label:'Sales'       },
  { id:'production', icon:'🏭', label:'Production'  },
  { id:'staff',      icon:'👥', label:'Staff'       },
  { id:'reports',    icon:'📊', label:'Reports'     },
  { id:'compliance', icon:'📜', label:'Compliance'  },
  { id:'documents',  icon:'📋', label:'Documents'   },
  { id:'audit',      icon:'🔍', label:'Audit Log'   },
  { id:'settings',   icon:'⚙️', label:'Settings'    },
];

export default function Home() {
  const [active,       setActive]       = useState('dashboard');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [dbError,      setDbError]      = useState(null);

  // ── Inactivity / auto-logout state ────────────────────────
  const [locked,       setLocked]       = useState(false);
  const [lockPin,      setLockPin]      = useState('');
  const [pinInput,     setPinInput]     = useState('');
  const [pinError,     setPinError]     = useState('');
  const [settings,     setSettings]     = useState({
    inactivity_timeout: 15,   // minutes
    auto_logout:        60,   // minutes
    company_name:       'Verocent Global Limited',
    currency:           '₦',
    timezone:           'Africa/Lagos',
    pin:                '',
  });
  const inactivityTimer = useRef(null);
  const logoutTimer     = useRef(null);
  const lockedAt        = useRef(null);

  // ── All ERP data ───────────────────────────────────────────
  const [products,      setProducts]      = useState([]);
  const [rawMaterials,  setRawMaterials]  = useState([]);
  const [suppliers,     setSuppliers]     = useState([]);
  const [customers,     setCustomers]     = useState([]);
  const [sales,         setSales]         = useState([]);
  const [expenses,      setExpenses]      = useState([]);
  const [staff,         setStaff]         = useState([]);
  const [production,    setProduction]    = useState([]);
  const [compliance,    setCompliance]    = useState([]);
  const [sets,          setSets]          = useState([]);
  const [dispatches,    setDispatches]    = useState([]);
  const [locationSales, setLocationSales] = useState([]);
  const [returns,       setReturns]       = useState([]);

  // ── Supabase client ────────────────────────────────────────
  const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  };

  // ── MASTER LOAD: fetch ALL data from Supabase on mount ────
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    const supabase = getSupabase();
    if (!supabase) {
      setDbError('Supabase not configured. Check your .env.local file.');
      setLoading(false);
      return;
    }

    try {
      // Fetch all tables in parallel for speed
      const [
        prodRes, rmRes, supRes, custRes, salesRes,
        expRes, staffRes, productionRes, compRes,
        setsRes, dispRes, locSalesRes, returnsRes, settingsRes,
      ] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('raw_materials').select('*').order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('staff').select('*').order('created_at', { ascending: false }),
        supabase.from('production').select('*').order('created_at', { ascending: false }),
        supabase.from('compliance').select('*').order('created_at', { ascending: false }),
        supabase.from('sets').select('*').order('created_at', { ascending: false }),
        supabase.from('dispatches').select('*').order('created_at', { ascending: false }),
        supabase.from('location_sales').select('*').order('created_at', { ascending: false }),
        supabase.from('returns').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').limit(1),
      ]);

      // Set each state — if the table has an error, keep the empty array
      if (!prodRes.error)       setProducts(prodRes.data || []);
      if (!rmRes.error)         setRawMaterials(rmRes.data || []);
      if (!supRes.error)        setSuppliers(supRes.data || []);
      if (!custRes.error)       setCustomers(custRes.data || []);
      if (!salesRes.error)      setSales(salesRes.data || []);
      if (!expRes.error)        setExpenses(expRes.data || []);
      if (!staffRes.error)      setStaff(staffRes.data || []);
      if (!productionRes.error) setProduction(productionRes.data || []);
      if (!compRes.error)       setCompliance(compRes.data || []);
      if (!setsRes.error)       setSets(setsRes.data || []);
      if (!dispRes.error)       setDispatches(dispRes.data || []);
      if (!locSalesRes.error)   setLocationSales(locSalesRes.data || []);
      if (!returnsRes.error)    setReturns(returnsRes.data || []);
      if (!settingsRes.error && settingsRes.data?.length > 0) {
        setSettings(prev => ({ ...prev, ...settingsRes.data[0] }));
        if (settingsRes.data[0].pin) setLockPin(settingsRes.data[0].pin);
      }

      // Log any errors quietly
      [prodRes, rmRes, supRes, custRes, salesRes, expRes, staffRes,
       productionRes, compRes, setsRes, dispRes, locSalesRes, returnsRes].forEach(r => {
        if (r.error) console.warn('Supabase fetch warning:', r.error.message);
      });

    } catch (err) {
      console.error('Failed to load data:', err);
      setDbError('Could not connect to database. Check internet connection and try refreshing.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  // ── Inactivity / Auto-logout logic ────────────────────────
  const resetTimers = useCallback(() => {
    if (locked) return;
    clearTimeout(inactivityTimer.current);
    clearTimeout(logoutTimer.current);

    const inactMins = Number(settings.inactivity_timeout) || 15;
    const logoutMins = Number(settings.auto_logout) || 60;

    if (inactMins > 0) {
      inactivityTimer.current = setTimeout(() => {
        setLocked(true);
        lockedAt.current = Date.now();
        // After lock, if user doesn't unlock within (logout - inact) mins, force logout
        const remainMins = Math.max(5, logoutMins - inactMins);
        logoutTimer.current = setTimeout(() => {
          // Force logout: reload page (or redirect to login)
          window.location.href = '/login';
        }, remainMins * 60 * 1000);
      }, inactMins * 60 * 1000);
    }
  }, [locked, settings.inactivity_timeout, settings.auto_logout]);

  // Listen to user activity
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => resetTimers();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimers();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      clearTimeout(inactivityTimer.current);
      clearTimeout(logoutTimer.current);
    };
  }, [resetTimers]);

  const handleUnlock = () => {
    if (!lockPin || pinInput === lockPin) {
      setLocked(false);
      setPinInput('');
      setPinError('');
      clearTimeout(logoutTimer.current);
      resetTimers();
    } else {
      setPinError('Incorrect PIN. Try again.');
    }
  };

  // ── Lock screen ────────────────────────────────────────────
  if (locked) {
    return (
      <div style={{position:'fixed',inset:0,background:'#0E3D23',display:'flex',
        alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'#fff',borderRadius:20,padding:40,textAlign:'center',
          maxWidth:380,width:'100%',boxShadow:'0 30px 80px rgba(0,0,0,0.5)'}}>
          <div style={{fontSize:48,marginBottom:12}}>🔒</div>
          <div style={{fontSize:22,fontWeight:800,color:'#165C35',marginBottom:6,fontFamily:'sans-serif'}}>
            Session Locked
          </div>
          <div style={{fontSize:13,color:'#666',marginBottom:24,fontFamily:'sans-serif'}}>
            Verocent ERP locked due to inactivity.<br/>
            {lockPin ? 'Enter your PIN to continue.' : 'Click Continue to resume.'}
          </div>
          {lockPin && (
            <>
              <input
                type="password"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter PIN"
                autoFocus
                style={{width:'100%',border:'2px solid #165C35',borderRadius:8,padding:'12px 16px',
                  fontSize:18,textAlign:'center',fontFamily:'sans-serif',boxSizing:'border-box',
                  letterSpacing:4,marginBottom:8}}
              />
              {pinError && (
                <div style={{color:'#C0392B',fontSize:13,marginBottom:12,fontFamily:'sans-serif'}}>
                  {pinError}
                </div>
              )}
            </>
          )}
          <button onClick={handleUnlock}
            style={{width:'100%',background:'#1F6F43',color:'#fff',border:'none',borderRadius:10,
              padding:'14px 0',fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:'sans-serif',
              marginBottom:12}}>
            {lockPin ? '🔓 Unlock' : '▶ Continue'}
          </button>
          <button onClick={() => window.location.href = '/login'}
            style={{background:'none',border:'none',color:'#999',fontSize:12,cursor:'pointer',
              fontFamily:'sans-serif',textDecoration:'underline'}}>
            Sign out instead
          </button>
        </div>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={{position:'fixed',inset:0,background:'#0E3D23',display:'flex',
        alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',color:'#fff'}}>
          <div style={{fontSize:48,marginBottom:16}}>🌿</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:8,fontFamily:'sans-serif'}}>
            Verocent ERP
          </div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.7)',fontFamily:'sans-serif'}}>
            Loading your data…
          </div>
        </div>
      </div>
    );
  }

  // ── Main app ───────────────────────────────────────────────
  const SidebarW = sidebarOpen ? 220 : 64;

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#F4F3EE',fontFamily:'sans-serif'}}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: SidebarW,
        minWidth: SidebarW,
        background: 'linear-gradient(180deg,#0E3D23 0%,#1F6F43 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.2s',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{padding:'18px 16px 14px',borderBottom:'1px solid rgba(255,255,255,0.12)'}}>
          {sidebarOpen ? (
            <div>
              <div style={{color:'#D4A017',fontWeight:900,fontSize:15,lineHeight:1.2}}>🌿 VEROCENT</div>
              <div style={{color:'rgba(255,255,255,0.6)',fontSize:10,marginTop:2}}>Pure Essence ERP</div>
            </div>
          ) : (
            <div style={{color:'#D4A017',fontWeight:900,fontSize:18,textAlign:'center'}}>🌿</div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)}
              title={!sidebarOpen ? n.label : ''}
              style={{
                width:'100%', background: active===n.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                border:'none', color: active===n.id ? '#D4A017' : 'rgba(255,255,255,0.8)',
                padding: sidebarOpen ? '11px 16px' : '11px 0',
                textAlign: sidebarOpen ? 'left' : 'center',
                fontSize:13, fontWeight: active===n.id ? 700 : 400,
                cursor:'pointer', display:'flex', alignItems:'center',
                gap:10, borderLeft: active===n.id ? '3px solid #D4A017' : '3px solid transparent',
                transition:'all 0.15s',
              }}>
              <span style={{fontSize:16,minWidth:20,textAlign:'center'}}>{n.icon}</span>
              {sidebarOpen && <span>{n.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle collapse */}
        <button onClick={() => setSidebarOpen(p => !p)}
          style={{background:'rgba(255,255,255,0.08)',border:'none',color:'rgba(255,255,255,0.7)',
            padding:'12px 0',cursor:'pointer',fontSize:18,borderTop:'1px solid rgba(255,255,255,0.12)'}}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* ── Main content ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Top bar */}
        <header style={{background:'#fff',borderBottom:'1px solid #E0E0D8',
          padding:'12px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <span style={{fontSize:18,fontWeight:800,color:'#165C35'}}>
              {NAV.find(n=>n.id===active)?.icon} {NAV.find(n=>n.id===active)?.label}
            </span>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            {dbError && (
              <span style={{fontSize:11,color:'#C0392B',fontWeight:700,background:'#FADBD8',
                padding:'4px 10px',borderRadius:20}}>⚠️ DB Error</span>
            )}
            <button onClick={loadAllData}
              title="Refresh all data from database"
              style={{background:'#E8F5EE',border:'1px solid #C9C9C0',borderRadius:8,padding:'6px 12px',
                fontSize:12,fontWeight:700,cursor:'pointer',color:'#165C35'}}>
              🔄 Refresh
            </button>
            <button onClick={() => setLocked(true)}
              title="Lock screen"
              style={{background:'#FDF6E3',border:'1px solid #D4A017',borderRadius:8,padding:'6px 12px',
                fontSize:12,fontWeight:700,cursor:'pointer',color:'#7D4E00'}}>
              🔒 Lock
            </button>
            <div style={{fontSize:12,color:'#888'}}>
              {new Date().toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
            </div>
          </div>
        </header>

        {/* Error banner */}
        {dbError && (
          <div style={{background:'#FADBD8',borderBottom:'1px solid #C0392B',padding:'10px 24px',
            fontSize:13,color:'#C0392B',fontWeight:600}}>
            ⚠️ {dbError} —{' '}
            <button onClick={loadAllData} style={{background:'none',border:'none',color:'#C0392B',
              cursor:'pointer',fontWeight:800,textDecoration:'underline'}}>
              Click to retry
            </button>
          </div>
        )}

        {/* Content area */}
        <main style={{flex:1,overflow:'auto',padding:24}}>
          {active==='dashboard'  && <Dashboard products={products} sales={sales} rawMaterials={rawMaterials} expenses={expenses} compliance={compliance} production={production}/>}
          {active==='inventory'  && <Inventory rawMaterials={rawMaterials} setRawMaterials={setRawMaterials} products={products} setProducts={setProducts} suppliers={suppliers} setSuppliers={setSuppliers}/>}
          {active==='products'   && <Products products={products} setProducts={setProducts} sets={sets} setSets={setSets} dispatches={dispatches} setDispatches={setDispatches} locationSales={locationSales} setLocationSales={setLocationSales}/>}
          {active==='sales'      && <Sales sales={sales} setSales={setSales} customers={customers} setCustomers={setCustomers} products={products} setProducts={setProducts} returns={returns} setReturns={setReturns}/>}
          {active==='production' && <Production production={production} setProduction={setProduction} rawMaterials={rawMaterials} setRawMaterials={setRawMaterials} products={products} setProducts={setProducts}/>}
          {active==='staff'      && <StaffAccess staff={staff} setStaff={setStaff}/>}
          {active==='reports'    && <Reports products={products} sales={sales} expenses={expenses} production={production} rawMaterials={rawMaterials}/>}
          {active==='compliance' && <Compliance compliance={compliance} setCompliance={setCompliance}/>}
          {active==='documents'  && <Documents/>}
          {active==='audit'      && <AuditLog/>}
          {active==='settings'   && <Settings settings={settings} setSettings={setSettings} setLockPin={setLockPin}/>}
        </main>
      </div>
    </div>
  );
}