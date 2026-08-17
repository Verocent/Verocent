// app/page.js  ← Replace the ENTIRE content of this file with what is below

'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import Products from '@/components/Products';
import Inventory from '@/components/Inventory';
import Sales from '@/components/Sales';
import Finance from '@/components/Finance';
import Compliance from '@/components/Compliance';
import Production from '@/components/Production';
import Reports from '@/components/Reports';
import { db } from '@/lib/supabase';

export default function Home() {
  const [activeModule, setActiveModule] = useState('dashboard');

  // Global data state — all modules share this
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

  // Load all data from Supabase on startup
  useEffect(() => {
    async function loadAll() {
      try {
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
        setProducts(p);
        setRawMaterials(rm);
        setSuppliers(sup);
        setSales(s);
        setCustomers(c);
        setExpenses(e);
        setStaff(st);
        setProduction(prod);
        setCompliance(comp);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Pass all data and setters to every module
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
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                    height:'60vh', fontFamily:'sans-serif', color:'#1F6F43', fontSize:18 }}>
        🌿 Loading Verocent ERP...
      </div>
    );
    switch (activeModule) {
      case 'dashboard':   return <Dashboard   {...globalProps} />;
      case 'products':    return <Products    {...globalProps} />;
      case 'production':  return <Production  {...globalProps} />;
      case 'inventory':   return <Inventory   {...globalProps} />;
      case 'sales':       return <Sales       {...globalProps} />;
      case 'finance':     return <Finance     {...globalProps} />;
      case 'compliance':  return <Compliance  {...globalProps} />;
      case 'reports':     return <Reports     {...globalProps} />;
      default:            return <Dashboard   {...globalProps} />;
    }
  };

  return (
    <Layout activeModule={activeModule} setActiveModule={setActiveModule} data={globalProps}>
      {renderModule()}
    </Layout>
  );
}
