// lib/supabase.js
// Database connection for Verocent ERP

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── DATABASE HELPER FUNCTIONS ────────────────────────────

// Products
export const db = {
  // Products
  async getProducts()       { const {data} = await supabase.from('products').select('*').order('id'); return data || []; },
  async addProduct(row)     { const {data} = await supabase.from('products').insert(row).select(); return data?.[0]; },
  async updateProduct(id,row){ await supabase.from('products').update(row).eq('id',id); },
  async deleteProduct(id)   { await supabase.from('products').delete().eq('id',id); },

  // Raw Materials
  async getRawMaterials()    { const {data} = await supabase.from('raw_materials').select('*').order('id'); return data || []; },
  async addRawMaterial(row)  { const {data} = await supabase.from('raw_materials').insert(row).select(); return data?.[0]; },
  async updateRawMaterial(id,row){ await supabase.from('raw_materials').update(row).eq('id',id); },
  async deleteRawMaterial(id){ await supabase.from('raw_materials').delete().eq('id',id); },

  // Suppliers
  async getSuppliers()       { const {data} = await supabase.from('suppliers').select('*').order('id'); return data || []; },
  async addSupplier(row)     { const {data} = await supabase.from('suppliers').insert(row).select(); return data?.[0]; },
  async updateSupplier(id,row){ await supabase.from('suppliers').update(row).eq('id',id); },
  async deleteSupplier(id)   { await supabase.from('suppliers').delete().eq('id',id); },

  // Sales
  async getSales()           { const {data} = await supabase.from('sales').select('*').order('date',{ascending:false}); return data || []; },
  async addSale(row)         { const {data} = await supabase.from('sales').insert(row).select(); return data?.[0]; },
  async updateSale(id,row)   { await supabase.from('sales').update(row).eq('id',id); },
  async deleteSale(id)       { await supabase.from('sales').delete().eq('id',id); },

  // Customers
  async getCustomers()       { const {data} = await supabase.from('customers').select('*').order('id'); return data || []; },
  async addCustomer(row)     { const {data} = await supabase.from('customers').insert(row).select(); return data?.[0]; },
  async updateCustomer(id,row){ await supabase.from('customers').update(row).eq('id',id); },
  async deleteCustomer(id)   { await supabase.from('customers').delete().eq('id',id); },

  // Expenses
  async getExpenses()        { const {data} = await supabase.from('expenses').select('*').order('date',{ascending:false}); return data || []; },
  async addExpense(row)      { const {data} = await supabase.from('expenses').insert(row).select(); return data?.[0]; },
  async updateExpense(id,row){ await supabase.from('expenses').update(row).eq('id',id); },
  async deleteExpense(id)    { await supabase.from('expenses').delete().eq('id',id); },

  // Staff
  async getStaff()           { const {data} = await supabase.from('staff').select('*').order('id'); return data || []; },
  async addStaff(row)        { const {data} = await supabase.from('staff').insert(row).select(); return data?.[0]; },
  async updateStaff(id,row)  { await supabase.from('staff').update(row).eq('id',id); },
  async deleteStaff(id)      { await supabase.from('staff').delete().eq('id',id); },

  // Production
  async getProduction()      { const {data} = await supabase.from('production').select('*').order('date',{ascending:false}); return data || []; },
  async addProduction(row)   { const {data} = await supabase.from('production').insert(row).select(); return data?.[0]; },
  async updateProduction(id,row){ await supabase.from('production').update(row).eq('id',id); },
  async deleteProduction(id) { await supabase.from('production').delete().eq('id',id); },

  // Compliance
  async getCompliance()      { const {data} = await supabase.from('compliance').select('*').order('expiry'); return data || []; },
  async addCompliance(row)   { const {data} = await supabase.from('compliance').insert(row).select(); return data?.[0]; },
  async updateCompliance(id,row){ await supabase.from('compliance').update(row).eq('id',id); },
  async deleteCompliance(id) { await supabase.from('compliance').delete().eq('id',id); },
};
