// lib/access.js
// Defines which modules each access level can see

export const ACCESS_MODULES = {
  'Founder / CEO': [
    'dashboard','products','production','inventory',
    'sales','finance','compliance','staff','reports','audit'
  ],
  'Production Manager': [
    'dashboard','products','production','inventory'
  ],
  'Sales Executive': [
    'dashboard','products','sales'
  ],
  'QC Inspector': [
    'dashboard','production','inventory'
  ],
  'Social Media Manager': [
    'dashboard','products'
  ],
  'Accountant': [
    'dashboard','finance','reports'
  ],
};

// Check if a user can access a module
export function canAccess(user, moduleId) {
  if (!user) return false;
  const level = user.access_level || 'Sales Executive';
  const allowed = ACCESS_MODULES[level] || ACCESS_MODULES['Sales Executive'];
  return allowed.includes(moduleId);
}

// Get modules visible to a user
export function getModules(user) {
  if (!user) return [];
  const level = user.access_level || 'Sales Executive';
  const allowed = ACCESS_MODULES[level] || ACCESS_MODULES['Sales Executive'];

  const ALL_MODULES = [
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

  return ALL_MODULES.filter(m => allowed.includes(m.id));
}

// Log an action to the audit log
export async function logAction(user, action, module, description) {
  if (!user) return;
  try {
    const { supabase } = await import('./supabase');
    await supabase.from('audit_logs').insert({
      user_email:  user.email,
      user_name:   user.full_name,
      action,
      module,
      description,
      device: typeof navigator !== 'undefined' ?
        (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop') : 'Unknown',
      status: 'Success',
    });
  } catch(e) {
    console.error('Audit log error:', e);
  }
}
