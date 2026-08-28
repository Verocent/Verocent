'use client';

import { useState, useEffect } from 'react';
import { canAccess, getModules } from '@/lib/access';

// Lazy load all modules
import dynamic from 'next/dynamic';
const LoginPage   = dynamic(() => import('@/components/LoginPage'),   { ssr: false });
const Layout      = dynamic(() => import('@/components/Layout'),      { ssr: false });
const Dashboard   = dynamic(() => import('@/components/Dashboard'),   { ssr: false });
const Products    = dynamic(() => import('@/components/Products'),    { ssr: false });
const Production  = dynamic(() => import('@/components/Production'),  { ssr: false });
const Inventory   = dynamic(() => import('@/components/Inventory'),   { ssr: false });
const Sales       = dynamic(() => import('@/components/Sales'),       { ssr: false });
const Finance     = dynamic(() => import('@/components/Finance'),     { ssr: false });
const Compliance  = dynamic(() => import('@/components/Compliance'),  { ssr: false });
const Reports     = dynamic(() => import('@/components/Reports'),     { ssr: false });
const StaffAccess = dynamic(() => import('@/components/StaffAccess'), { ssr: false });
const AuditLog    = dynamic(() => import('@/components/AuditLog'),    { ssr: false });

export default function Home() {
  const [currentUser,  setCurrentUser]  = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [loading,      setLoading]      = useState(false);
  const [ready,        setReady]        = useState(false);

  const [products,     setProducts]     = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [suppliers,    setSuppliers]    = useState([]);
  const [sales,        setSales]        = useState([]);
  const [customers,    setCustomers]    = useState([]);
  const [expenses,     setExpenses]     = useState([]);
  const [staff,        setStaff]        = useState([]);
  const [production,   setProduction]   = useState([]);
  const [compliance,   setCompliance]   = useState([]);

  // Wait for client to be ready — fixes hydration error
  useEffect(() => {
    setReady(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { db } = await import('@/lib/supabase');
      const [p,rm,sup,s,c,e,st,prod,comp] = await Promise.all([
        db.getProducts(), db.getRawMaterials(), db.getSuppliers(),
        db.getSales(), db.getCustomers(), db.getExpenses(),
        db.getStaff(), db.getProduction(), db.getCompliance(),
      ]);
      setProducts(p||[]); setRawMaterials(rm||[]); setSuppliers(sup||[]);
      setSales(s||[]); setCustomers(c||[]); setExpenses(e||[]);
      setStaff(st||[]); setProduction(prod||[]); setCompliance(comp||[]);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleLogin = async (staffUser) => {
    setCurrentUser(staffUser);
    setActiveModule('dashboard');
    await loadData();
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut({ scope: 'local' });
    } catch(e) { console.error(e); }
    setCurrentUser(null);
    setActiveModule('dashboard');
    setProducts([]); setRawMaterials([]); setSuppliers([]);
    setSales([]); setCustomers([]); setExpenses([]);
    setStaff([]); setProduction([]); setCompliance([]);
  };

  const handleModuleChange = (moduleId) => {
    if (!canAccess(currentUser, moduleId)) return;
    setActiveModule(moduleId);
  };

  const globalProps = {
    products, setProducts, rawMaterials, setRawMaterials,
    suppliers, setSuppliers, sales, setSales,
    customers, setCustomers, expenses, setExpenses,
    staff, setStaff, production, setProduction,
    compliance, setCompliance, currentUser,
  };

  // Loading screen while client initialises
  if (!ready) return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#1B2631 0%,#165C35 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:16, fontFamily:'Arial,sans-serif'
    }}>
      <div style={{fontSize:48}}>🌿</div>
      <div style={{color:'#fff',fontSize:18,fontWeight:700}}>
        Verocent Pure Essence ERP
      </div>
    </div>
  );

  // Always show login if no user logged in
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin}/>;
  }

  const renderModule = () => {
    if (loading) return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',
        height:'60vh',flexDirection:'column',gap:16,fontFamily:'sans-serif'}}>
        <div style={{fontSize:40}}>🌿</div>
        <div style={{fontSize:16,fontWeight:700,color:'#1F6F43'}}>Loading...</div>
      </div>
    );
    switch(activeModule) {
      case 'dashboard':  return <Dashboard   {...globalProps}/>;
      case 'products':   return <Products    {...globalProps}/>;
      case 'production': return <Production  {...globalProps}/>;
      case 'inventory':  return <Inventory   {...globalProps}/>;
      case 'sales':      return <Sales       {...globalProps}/>;
      case 'finance':    return <Finance     {...globalProps}/>;
      case 'compliance': return <Compliance  {...globalProps}/>;
      case 'staff':      return <StaffAccess {...globalProps}/>;
      case 'reports':    return <Reports     {...globalProps}/>;
      case 'audit':      return <AuditLog    currentUser={currentUser}/>;
      default:           return <Dashboard   {...globalProps}/>;
    }
  };

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
