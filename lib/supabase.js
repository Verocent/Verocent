// lib/supabase.js
// Database connection for Verocent ERP
// persistSession: false — each person must log in fresh on their device

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL   || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession:     true,   // keeps session on SAME device for the SAME user
        autoRefreshToken:   true,
        detectSessionInUrl: true,
        storage:            typeof window !== 'undefined' ? window.localStorage : undefined,
      }
    })
  : null;

// Safe query wrapper
const safe = async (fn) => {
  if (!supabase) {
    console.warn('Supabase not connected. Add keys to .env.local');
    return [];
  }
  try {
    const { data, error } = await fn();
    if (error) { console.error('Supabase error:', error.message); return []; }
    return data || [];
  } catch(e) {
    console.error('Query failed:', e.message);
    return [];
  }
};

const safeOne = async (fn) => {
  if (!supabase) return null;
  try {
    const { data, error } = await fn();
    if (error) { console.error('Supabase error:', error.message); return null; }
    return data?.[0] || null;
  } catch(e) {
    console.error('Query failed:', e.message);
    return null;
  }
};

export const db = {
  getProducts:       () => safe(()   => supabase.from('products').select('*').order('id')),
  addProduct:        (r) => safeOne(()=> supabase.from('products').insert(r).select()),
  updateProduct:     (id,r) => safe(()=> supabase.from('products').update(r).eq('id',id)),
  deleteProduct:     (id) => safe(()  => supabase.from('products').delete().eq('id',id)),

  getRawMaterials:   () => safe(()   => supabase.from('raw_materials').select('*').order('id')),
  addRawMaterial:    (r) => safeOne(()=> supabase.from('raw_materials').insert(r).select()),
  updateRawMaterial: (id,r) => safe(()=> supabase.from('raw_materials').update(r).eq('id',id)),
  deleteRawMaterial: (id) => safe(()  => supabase.from('raw_materials').delete().eq('id',id)),

  getSuppliers:      () => safe(()   => supabase.from('suppliers').select('*').order('id')),
  addSupplier:       (r) => safeOne(()=> supabase.from('suppliers').insert(r).select()),
  updateSupplier:    (id,r) => safe(()=> supabase.from('suppliers').update(r).eq('id',id)),
  deleteSupplier:    (id) => safe(()  => supabase.from('suppliers').delete().eq('id',id)),

  getCustomers:      () => safe(()   => supabase.from('customers').select('*').order('id')),
  addCustomer:       (r) => safeOne(()=> supabase.from('customers').insert(r).select()),
  updateCustomer:    (id,r) => safe(()=> supabase.from('customers').update(r).eq('id',id)),
  deleteCustomer:    (id) => safe(()  => supabase.from('customers').delete().eq('id',id)),

  getSales:          () => safe(()   => supabase.from('sales').select('*').order('date',{ascending:false})),
  addSale:           (r) => safeOne(()=> supabase.from('sales').insert(r).select()),
  updateSale:        (id,r) => safe(()=> supabase.from('sales').update(r).eq('id',id)),
  deleteSale:        (id) => safe(()  => supabase.from('sales').delete().eq('id',id)),

  getExpenses:       () => safe(()   => supabase.from('expenses').select('*').order('date',{ascending:false})),
  addExpense:        (r) => safeOne(()=> supabase.from('expenses').insert(r).select()),
  updateExpense:     (id,r) => safe(()=> supabase.from('expenses').update(r).eq('id',id)),
  deleteExpense:     (id) => safe(()  => supabase.from('expenses').delete().eq('id',id)),

  getStaff:          () => safe(()   => supabase.from('staff').select('*').order('id')),
  addStaff:          (r) => safeOne(()=> supabase.from('staff').insert(r).select()),
  updateStaff:       (id,r) => safe(()=> supabase.from('staff').update(r).eq('id',id)),
  deleteStaff:       (id) => safe(()  => supabase.from('staff').delete().eq('id',id)),

  getProduction:     () => safe(()   => supabase.from('production').select('*').order('date',{ascending:false})),
  addProduction:     (r) => safeOne(()=> supabase.from('production').insert(r).select()),
  updateProduction:  (id,r) => safe(()=> supabase.from('production').update(r).eq('id',id)),
  deleteProduction:  (id) => safe(()  => supabase.from('production').delete().eq('id',id)),

  getCompliance:     () => safe(()   => supabase.from('compliance').select('*').order('expiry')),
  addCompliance:     (r) => safeOne(()=> supabase.from('compliance').insert(r).select()),
  updateCompliance:  (id,r) => safe(()=> supabase.from('compliance').update(r).eq('id',id)),
  deleteCompliance:  (id) => safe(()  => supabase.from('compliance').delete().eq('id',id)),
};
