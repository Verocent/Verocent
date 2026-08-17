// lib/constants.js
// Brand colours and configuration for Verocent Pure Essence ERP

export const COLORS = {
  green:       '#1F6F43',
  dark:        '#165C35',
  gold:        '#D4A017',
  lightGreen:  '#E8F5EE',
  lightGold:   '#FDF6E3',
  white:       '#FFFFFF',
  body:        '#1A1A1A',
  border:      '#C9C9C0',
  bg:          '#FAFAF7',
  red:         '#C0392B',
  lightRed:    '#FADBD8',
  amber:       '#E67E22',
  lightAmber:  '#FEF9E7',
  blue:        '#1A56DB',
  navy:        '#1B2631',
};

export const COMPANY = {
  name:      'Verocent Global Limited',
  brand:     'Verocent Pure Essence',
  tagline:   "Pure Care with Verocent — Nature's Touch for Healthy Hair",
  location:  'Kaduna, Nigeria',
  phone:     '[Your Phone Number]',
  email:     '[Your Email]',
  website:   'verocentglobal.com.ng',
  nafdac:    '[Your NAFDAC No.]',
  cac:       '[Your CAC No.]',
};

export const MODULES = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard'         },
  { id: 'products',    icon: '🧴', label: 'Products'          },
  { id: 'production',  icon: '🏭', label: 'Production'        },
  { id: 'inventory',   icon: '🌿', label: 'Inventory'         },
  { id: 'sales',       icon: '💰', label: 'Sales & Invoicing' },
  { id: 'finance',     icon: '📈', label: 'Finance'           },
  { id: 'compliance',  icon: '📜', label: 'Compliance'        },
  { id: 'reports',     icon: '📋', label: 'Reports'           },
];

export const PRODUCTS_SEED = [
  { name: 'Deep Hair Moisturizer',  code: 'VPE-DHM',  prefix: 'VPM',  cost: 5500, price: 6000, stock: 45, reorder: 20, status: 'Active', size: '250g'  },
  { name: 'Herbal Hair Cream',      code: 'VPE-HHC',  prefix: 'VPHC', cost: 4500, price: 6500, stock: 12, reorder: 20, status: 'Active', size: '200g'  },
  { name: 'Scalp & Hair Oil',       code: 'VPE-SHO',  prefix: 'VPSO', cost: 4800, price: 6000, stock: 8,  reorder: 20, status: 'Active', size: '150ml' },
  { name: 'Rinse-Out Conditioner',  code: 'VPE-VPRC', prefix: 'VPRC', cost: 4200, price: 5500, stock: 30, reorder: 20, status: 'Active', size: '200ml' },
  { name: 'Natural Shampoo',        code: 'VPE-VPNS', prefix: 'VPNS', cost: 3800, price: 5000, stock: 25, reorder: 20, status: 'Active', size: '200ml' },
];

export const RM_CATEGORIES = [
  'Butter', 'Essential Oil', 'Carrier Oil', 'Herb',
  'Spice', 'Extract', 'Preservative', 'Packaging-Bottle',
  'Packaging-Jar', 'Packaging-Tub', 'Packaging-Label', 'Other',
];

export const EXPENSE_CATEGORIES = [
  'Rent', 'Salaries & Wages', 'Logistics', 'Electricity & Utilities',
  'Marketing & Ads', 'Raw Materials', 'Packaging', 'Regulatory & Compliance',
  'Equipment & Tools', 'Fuel', 'Internet & Phone', 'Repairs', 'Miscellaneous',
];

export const PAYMENT_METHODS = [
  'Bank Transfer', 'Flutterwave', 'Paystack', 'Cash', 'WhatsApp Order', 'POS',
];

export const DELIVERY_STATUSES = [
  'Pending', 'In Transit', 'Delivered', 'Cancelled',
];