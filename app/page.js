'use client';

import { useState } from 'react';
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
  const [currentUser,  setCurrentUser]  = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [loading,      setLoading]      = useState(false);
  const [products,     setProducts]     = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [suppliers,    setSuppliers]    = useState([]);
  const [sales,        setSales]        = useState([]);
  const [customers,    setCustomers]    = useState([]);
  const [expenses,     setExpenses]     = useState([]);
  const [staff,        setStaff]        = useState([]);
  const [production,   setProduction]   = useState([]);
  const [compliance,   setCompliance]   = useState([]);

  // No session check — always show login first
  // User must log in every time they open the app

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

  const renderModule = () => {
    if (loading) return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',
        height:'60vh',flexDirection:'column',gap:16,fontFamily:'sans-serif'}}>
        <div style={{fontSize:40}}>🌿</div>
        <div style={{fontSize:16,fontWeight:700,color:'#1F6F43'}}>Loading your data...</div>
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

  // Always show login if no user
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin}/>;
  }

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