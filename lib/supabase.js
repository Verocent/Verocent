// ============================================================
// Verocent ERP — lib/supabase.js  (complete file)
// Supabase project: https://leivaahpijweiajjdzff.supabase.co
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// ── helper: throw on supabase error ──────────────────────────────────────────
function check({ data, error }, label) {
  if (error) throw new Error(`[${label}] ${error.message}`);
  return data;
}

// ── Products ─────────────────────────────────────────────────────────────────
export const db = {
  getProducts: async () =>
    check(await supabase.from('products').select('*').order('name'), 'getProducts'),

  addProduct: async (payload) => {
    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) throw new Error('[addProduct] ' + error.message);
    return data;
  },

  updateProduct: async (id, payload) => {
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) throw new Error('[updateProduct] ' + error.message);
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error('[deleteProduct] ' + error.message);
  },

  // ── Sets ──────────────────────────────────────────────────────────────────
  getSets: async () =>
    check(await supabase.from('sets').select('*').order('name'), 'getSets'),

  addSet: async (payload) => {
    const { data, error } = await supabase.from('sets').insert([payload]).select().single();
    if (error) throw new Error('[addSet] ' + error.message);
    return data;
  },

  updateSet: async (id, payload) => {
    const { error } = await supabase.from('sets').update(payload).eq('id', id);
    if (error) throw new Error('[updateSet] ' + error.message);
  },

  deleteSet: async (id) => {
    const { error } = await supabase.from('sets').delete().eq('id', id);
    if (error) throw new Error('[deleteSet] ' + error.message);
  },

  // ── Dispatches ────────────────────────────────────────────────────────────
  getDispatches: async () =>
    check(
      await supabase.from('dispatches').select('*').order('date', { ascending: false }),
      'getDispatches'
    ),

  addDispatch: async (payload) => {
    const { data, error } = await supabase.from('dispatches').insert([payload]).select().single();
    if (error) throw new Error('[addDispatch] ' + error.message);
    return data;
  },

  updateDispatch: async (id, payload) => {
    const { error } = await supabase.from('dispatches').update(payload).eq('id', id);
    if (error) throw new Error('[updateDispatch] ' + error.message);
  },

  // ── Location Sales ────────────────────────────────────────────────────────
  getLocationSales: async () =>
    check(
      await supabase.from('location_sales').select('*').order('date', { ascending: false }),
      'getLocationSales'
    ),

  addLocationSale: async (payload) => {
    const { data, error } = await supabase.from('location_sales').insert([payload]).select().single();
    if (error) throw new Error('[addLocationSale] ' + error.message);
    return data;
  },

  // ── Production ────────────────────────────────────────────────────────────
  getProduction: async () =>
    check(
      await supabase.from('production').select('*').order('date', { ascending: false }),
      'getProduction'
    ),

  addProduction: async (payload) => {
    const { data, error } = await supabase.from('production').insert([payload]).select().single();
    if (error) throw new Error('[addProduction] ' + error.message);
    return data;
  },

  updateProduction: async (id, payload) => {
    const { error } = await supabase.from('production').update(payload).eq('id', id);
    if (error) throw new Error('[updateProduction] ' + error.message);
  },

  deleteProduction: async (id) => {
    const { error } = await supabase.from('production').delete().eq('id', id);
    if (error) throw new Error('[deleteProduction] ' + error.message);
  },

  // ── Raw Materials ─────────────────────────────────────────────────────────
  getRawMaterials: async () =>
    check(await supabase.from('raw_materials').select('*').order('name'), 'getRawMaterials'),

  addRawMaterial: async (payload) => {
    const { data, error } = await supabase.from('raw_materials').insert([payload]).select().single();
    if (error) throw new Error('[addRawMaterial] ' + error.message);
    return data;
  },

  updateRawMaterial: async (id, payload) => {
    const { error } = await supabase.from('raw_materials').update(payload).eq('id', id);
    if (error) throw new Error('[updateRawMaterial] ' + error.message);
  },

  deleteRawMaterial: async (id) => {
    const { error } = await supabase.from('raw_materials').delete().eq('id', id);
    if (error) throw new Error('[deleteRawMaterial] ' + error.message);
  },

  // ── Sales ─────────────────────────────────────────────────────────────────
  getSales: async () =>
    check(
      await supabase.from('sales').select('*').order('date', { ascending: false }),
      'getSales'
    ),

  addSale: async (payload) => {
    const { data, error } = await supabase.from('sales').insert([payload]).select().single();
    if (error) throw new Error('[addSale] ' + error.message);
    return data;
  },

  updateSale: async (id, payload) => {
    const { error } = await supabase.from('sales').update(payload).eq('id', id);
    if (error) throw new Error('[updateSale] ' + error.message);
  },

  deleteSale: async (id) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) throw new Error('[deleteSale] ' + error.message);
  },

  // ── Customers ─────────────────────────────────────────────────────────────
  getCustomers: async () =>
    check(await supabase.from('customers').select('*').order('name'), 'getCustomers'),

  addCustomer: async (payload) => {
    const { data, error } = await supabase.from('customers').insert([payload]).select().single();
    if (error) throw new Error('[addCustomer] ' + error.message);
    return data;
  },

  updateCustomer: async (id, payload) => {
    const { error } = await supabase.from('customers').update(payload).eq('id', id);
    if (error) throw new Error('[updateCustomer] ' + error.message);
  },

  deleteCustomer: async (id) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw new Error('[deleteCustomer] ' + error.message);
  },

  // ── Suppliers ─────────────────────────────────────────────────────────────
  getSuppliers: async () =>
    check(await supabase.from('suppliers').select('*').order('name'), 'getSuppliers'),

  addSupplier: async (payload) => {
    const { data, error } = await supabase.from('suppliers').insert([payload]).select().single();
    if (error) throw new Error('[addSupplier] ' + error.message);
    return data;
  },

  updateSupplier: async (id, payload) => {
    const { error } = await supabase.from('suppliers').update(payload).eq('id', id);
    if (error) throw new Error('[updateSupplier] ' + error.message);
  },

  deleteSupplier: async (id) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw new Error('[deleteSupplier] ' + error.message);
  },

  // ── Expenses ─────────────────────────────────────────────────────────────
  getExpenses: async () =>
    check(
      await supabase.from('expenses').select('*').order('date', { ascending: false }),
      'getExpenses'
    ),

  addExpense: async (payload) => {
    const { data, error } = await supabase.from('expenses').insert([payload]).select().single();
    if (error) throw new Error('[addExpense] ' + error.message);
    return data;
  },

  updateExpense: async (id, payload) => {
    const { error } = await supabase.from('expenses').update(payload).eq('id', id);
    if (error) throw new Error('[updateExpense] ' + error.message);
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw new Error('[deleteExpense] ' + error.message);
  },

  // ── Staff ─────────────────────────────────────────────────────────────────
  getStaff: async () =>
    check(await supabase.from('staff').select('*').order('name'), 'getStaff'),

  addStaff: async (payload) => {
    const { data, error } = await supabase.from('staff').insert([payload]).select().single();
    if (error) throw new Error('[addStaff] ' + error.message);
    return data;
  },

  updateStaff: async (id, payload) => {
    const { error } = await supabase.from('staff').update(payload).eq('id', id);
    if (error) throw new Error('[updateStaff] ' + error.message);
  },

  deleteStaff: async (id) => {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) throw new Error('[deleteStaff] ' + error.message);
  },

  // ── Compliance ────────────────────────────────────────────────────────────
  getCompliance: async () =>
    check(await supabase.from('compliance').select('*').order('date', { ascending: false }), 'getCompliance'),

  addCompliance: async (payload) => {
    const { data, error } = await supabase.from('compliance').insert([payload]).select().single();
    if (error) throw new Error('[addCompliance] ' + error.message);
    return data;
  },

  updateCompliance: async (id, payload) => {
    const { error } = await supabase.from('compliance').update(payload).eq('id', id);
    if (error) throw new Error('[updateCompliance] ' + error.message);
  },

  deleteCompliance: async (id) => {
    const { error } = await supabase.from('compliance').delete().eq('id', id);
    if (error) throw new Error('[deleteCompliance] ' + error.message);
  },

  // ── Returns ───────────────────────────────────────────────────────────────
  getReturns: async () =>
    check(await supabase.from('returns').select('*').order('date', { ascending: false }), 'getReturns'),

  addReturn: async (payload) => {
    const { data, error } = await supabase.from('returns').insert([payload]).select().single();
    if (error) throw new Error('[addReturn] ' + error.message);
    return data;
  },

  updateReturn: async (id, payload) => {
    const { error } = await supabase.from('returns').update(payload).eq('id', id);
    if (error) throw new Error('[updateReturn] ' + error.message);
  },

  deleteReturn: async (id) => {
    const { error } = await supabase.from('returns').delete().eq('id', id);
    if (error) throw new Error('[deleteReturn] ' + error.message);
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  addAuditLog: async (payload) => {
    const { error } = await supabase.from('audit_logs').insert([{
      ...payload,
      created_at: new Date().toISOString(),
    }]);
    if (error) throw new Error('[addAuditLog] ' + error.message);
  },

  getAuditLogs: async (limit = 500) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error('[getAuditLogs] ' + error.message);
    return data || [];
  },

  // ── Staff Users (login) ───────────────────────────────────────────────────
  getStaffUsers: async () =>
    check(await supabase.from('staff_users').select('*').order('username'), 'getStaffUsers'),

  addStaffUser: async (payload) => {
    const { data, error } = await supabase.from('staff_users').insert([payload]).select().single();
    if (error) throw new Error('[addStaffUser] ' + error.message);
    return data;
  },

  updateStaffUser: async (id, payload) => {
    const { error } = await supabase.from('staff_users').update(payload).eq('id', id);
    if (error) throw new Error('[updateStaffUser] ' + error.message);
  },

  deleteStaffUser: async (id) => {
    const { error } = await supabase.from('staff_users').delete().eq('id', id);
    if (error) throw new Error('[deleteStaffUser] ' + error.message);
  },

  loginUser: async (username, password) => {
    const { data, error } = await supabase
      .from('staff_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('active', true)
      .single();
    if (error || !data) return null;
    return data;
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  getSetting: async (key) => {
    const { data } = await supabase.from('settings').select('value').eq('key', key).single();
    return data?.value || null;
  },

  setSetting: async (key, value) => {
    const { error } = await supabase.from('settings').upsert([{ key, value }], { onConflict: 'key' });
    if (error) throw new Error('[setSetting] ' + error.message);
  },
};

export default db;