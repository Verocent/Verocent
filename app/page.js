'use client';

import { useState, useEffect } from 'react';
import LoginPage   from '@/components/LoginPage';
import Layout      from '@/components/Layout';
import Dashboard   from '@/components/Dashboard';
import Products    from '@/components/Products';
import Production  from '@/components/Production';
import Inventory   from '@/components/Inventory';
import Sales       from '@/components/Sales';
import Finance     from '@/components/Finance';
import Compliance  from '@/components/Compliance';
import Reports     from '@/components/Reports';
import StaffAccess from '@/components/StaffAccess';
import AuditLog    from '@/components/AuditLog';
import { canAccess, getModules } from '@/lib/access';

export default function Home() {
  // ── Auth state ────────────────────────────────────────
  const [currentUser,   setCurrentUser]   = useState(null);
  const [authChecked,   setAuthChecked]   = useState(false);
  const [activeModule,  setActiveModule]  = useState('dashboard');

  // ── Data state ────────────────────────────────────────
  const [products,     setProducts]     = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [suppliers,    setSuppliers]    = useState([]);
  const [sales,        setSales]        = useState([]);
  const [customers,    setCustomers]    = useState([]);
  const [expenses,     setExpenses]     = useState([]);
  const [staff,        setStaff]        = useState([]);
  const [production,   setProduction]   = useState([]);
  const [compliance,   setCompliance]   = useState([]);
  const [loading,      setLoading]      = useState(true);

  // ── Check if already logged in ────────────────────────
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Get their staff profile
        const { data: staffUser } = await supabase
          .from('staff_users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (staffUser?.is_active) {
          setCurrentUser(staffUser);
          await loadData();
        }
      }
    } catch(e) {
      console.error('Session check error:', e);
    }
    setAuthChecked(true);
    setLoading(false);
  };

  // ── Handle successful login ───────────────────────────
  const handleLogin = async (staffUser) => {
    setCurrentUser(staffUser);
    setActiveModule('dashboard');
    await loadData();
  };

  // ── Handle logout ─────────────────────────────────────
  const handleLogout = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      // Log the logout
      if (currentUser) {
        await supabase.from('audit_logs').insert({
          user_email:  currentUser.email,
          user_name:   currentUser.full_name,
          action:      'LOGOUT',
          module:      'Authentication',
          description: `${currentUser.full_name} logged out`,
          device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
          status: 'Success',
        });
      }

      await supabase.auth.signOut();
    } catch(e) { console.error(e); }

    setCurrentUser(null);
    setProducts([]); setSales([]); setExpenses([]);
    setStaff([]); setCustomers([]); setRawMaterials([]);
    setSuppliers([]); setProduction([]); setCompliance([]);
  };

  // ── Handle module change (with access check) ──────────
  const handleModuleChange = (moduleId) => {
    if (!canAccess(currentUser, moduleId)) {
      alert(`You do not have access to the ${moduleId} module. Please contact Veronica.`);
      return;
    }
    setActiveModule(moduleId);
  };

  // ── Load all data from Supabase ───────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const { db } = await import('@/lib/supabase');
      const [p, rm, sup, s, c, e, st, prod, comp] = await Promise.all([
        db.getProducts(),
        db.getRawMaterials(),
        db.getSuppliers(),
        db.getSales(),
        db.getCustomers(),
        db.getExpenses(),
        db.getStaff(),
        db.getProduction(),
        db.getCompliance(),
      ]);
      setProducts(p||[]);
      setRawMaterials(rm||[]);
      setSuppliers(sup||[]);
      setSales(s||[]);
      setCustomers(c||[]);
      setExpenses(e||[]);
      setStaff(st||[]);
      setProduction(prod||[]);
      setCompliance(comp||[]);
    } catch(e) {
      console.error('Error loading data:', e);
    }
    setLoading(false);
  };

  const globalProps = {
    products, setProducts, rawMaterials, setRawMaterials,
    suppliers, setSuppliers, sales, setSales,
    customers, setCustomers, expenses, setExpenses,
    staff, setStaff, production, setProduction,
    compliance, setCompliance, currentUser,
  };

  // ── Render module based on access ─────────────────────
  const renderModule = () => {
    // Access denied check
    if (!canAccess(currentUser, activeModule)) {
      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',
          justifyContent:'center',height:'60vh',fontFamily:'sans-serif',textAlign:'center',gap:16}}>
          <div style={{fontSize:60}}>🔒</div>
          <div style={{fontSize:20,fontWeight:700,color:'#C0392B'}}>Access Restricted</div>
          <div style={{fontSize:14,color:'#888',maxWidth:300}}>
            You do not have permission to view this module. Please contact Veronica (Founder) to request access.
          </div>
          <button onClick={()=>setActiveModule('dashboard')}
            style={{background:'#1F6F43',color:'#fff',border:'none',borderRadius:8,
              padding:'10px 24px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'sans-serif'}}>
            ← Go to Dashboard
          </button>
        </div>
      );
    }

    if (loading) return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',
        height:'60vh',fontFamily:'sans-serif',flexDirection:'column',gap:16}}>
        <div style={{fontSize:40}}>🌿</div>
        <div style={{fontSize:18,fontWeight:700,color:'#1F6F43'}}>Loading...</div>
        <div style={{fontSize:13,color:'#888'}}>Fetching your data from database</div>
      </div>
    );

    switch(activeModule) {
      case 'dashboard':   return <Dashboard   {...globalProps}/>;
      case 'products':    return <Products    {...globalProps}/>;
      case 'production':  return <Production  {...globalProps}/>;
      case 'inventory':   return <Inventory   {...globalProps}/>;
      case 'sales':       return <Sales       {...globalProps}/>;
      case 'finance':     return <Finance     {...globalProps}/>;
      case 'compliance':  return <Compliance  {...globalProps}/>;
      case 'staff':       return <StaffAccess {...globalProps}/>;
      case 'reports':     return <Reports     {...globalProps}/>;
      case 'audit':       return <AuditLog    currentUser={currentUser}/>;
      default:            return <Dashboard   {...globalProps}/>;
    }
  };

  // ── Show loading while checking session ───────────────
  if (!authChecked) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1B2631,#165C35)',
        display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
        <div style={{fontSize:50}}>🌿</div>
        <div style={{color:'#fff',fontSize:18,fontWeight:700,fontFamily:'sans-serif'}}>
          Verocent Pure Essence ERP
        </div>
        <div style={{color:'rgba(255,255,255,0.6)',fontSize:13,fontFamily:'sans-serif'}}>
          Loading...
        </div>
      </div>
    );
  }

  // ── Show login if not authenticated ───────────────────
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin}/>;
  }

  // ── Show ERP if authenticated ─────────────────────────
  return (
    <Layout
      activeModule={activeModule}
      setActiveModule={handleModuleChange}
      data={globalProps}
      currentUser={currentUser}
      onLogout={handleLogout}
      allowedModules={getModules(currentUser)}
    >
      {renderModule()}
    </Layout>
  );
}
