'use client';

import { useState, useEffect } from 'react';
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

export default function Home() {
  const [activeModule, setActiveModule] = useState('dashboard');

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

  useEffect(() => {
    async function loadAll() {
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
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const globalProps = {
    products, setProducts,
    rawMaterials, setRawMaterials,
    suppliers, setSuppliers,
    sales, setSales,
    customers, setCustomers,
    expenses, setExpenses,
    staff, setStaff,
    production, setProduction,
    compliance, setCompliance,
  };

  const renderModule = () => {
    if (loading) return (
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        height:'60vh', fontFamily:'sans-serif', flexDirection:'column', gap:16,
      }}>
        <img src='/logo.png' alt='Verocent' style={{width:80,height:80,borderRadius:'50%',objectFit:'cover'}}
          onError={e=>e.target.style.display='none'}/>
        <div style={{fontSize:20,fontWeight:700,color:'#1F6F43'}}>🌿 Loading Verocent ERP...</div>
        <div style={{fontSize:13,color:'#888'}}>Connecting to database — please wait</div>
        {/* Loading spinner */}
        <div style={{
          width:40,height:40,border:'4px solid #E8F5EE',
          borderTop:'4px solid #1F6F43',borderRadius:'50%',
          animation:'spin 1s linear infinite',
        }}/>
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );

    switch (activeModule) {
      case 'dashboard':   return <Dashboard   {...globalProps}/>;
      case 'products':    return <Products    {...globalProps}/>;
      case 'production':  return <Production  {...globalProps}/>;
      case 'inventory':   return <Inventory   {...globalProps}/>;
      case 'sales':       return <Sales       {...globalProps}/>;
      case 'finance':     return <Finance     {...globalProps}/>;
      case 'compliance':  return <Compliance  {...globalProps}/>;
      case 'reports':     return <Reports     {...globalProps}/>;
      case 'staff':       return <StaffAccess {...globalProps}/>;
      default:            return <Dashboard   {...globalProps}/>;
    }
  };

  return (
    <Layout activeModule={activeModule} setActiveModule={setActiveModule} data={globalProps}>
      {renderModule()}
    </Layout>
  );
}
