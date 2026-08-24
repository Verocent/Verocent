'use client';

export const ACCESS_MODULES = {
  'Founder / CEO':        ['dashboard','products','production','inventory','sales','finance','compliance','staff','reports','audit'],
  'Production Manager':   ['dashboard','products','production','inventory'],
  'Sales Executive':      ['dashboard','products','sales'],
  'QC Inspector':         ['dashboard','production','inventory'],
  'Social Media Manager': ['dashboard','products'],
  'Accountant':           ['dashboard','finance','reports'],
};

export const ALL_MODULES = [
  { id:'dashboard',  icon:'📊', label:'Dashboard'         },
  { id:'products',   icon:'🧴', label:'Products'          },
  { id:'production', icon:'🏭', label:'Production'        },
  { id:'inventory',  icon:'🌿', label:'Inventory'         },
  { id:'sales',      icon:'💰', label:'Sales & Invoicing' },
  { id:'finance',    icon:'📈', label:'Finance'           },
  { id:'compliance', icon:'📜', label:'Compliance'        },
  { id:'staff',      icon:'👨‍💼', label:'Staff & Access'    },
  { id:'reports',    icon:'📋', label:'Reports'           },
  { id:'audit',      icon:'🔍', label:'Audit Log'         },
];

export function getModules(user) {
  if (!user) return [];
  const allowed = ACCESS_MODULES[user.access_level] || ['dashboard'];
  return ALL_MODULES.filter(m => allowed.includes(m.id));
}

export function canAccess(user, moduleId) {
  if (!user) return false;
  const allowed = ACCESS_MODULES[user.access_level] || ['dashboard'];
  return allowed.includes(moduleId);
}