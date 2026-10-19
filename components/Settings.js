'use client';
import { useState, useEffect } from 'react';

const C = {
  green:'#1F6F43', dark:'#165C35', gold:'#D4A017',
  lightGreen:'#E8F5EE', lightGold:'#FDF6E3',
  red:'#C0392B', lightRed:'#FADBD8',
  amber:'#E67E22', lightAmber:'#FEF9E7',
  blue:'#1A56DB', border:'#C9C9C0',
};

function Btn({ children, onClick, color='green', small, outline, disabled }) {
  const bg = {green:C.green,red:C.red,gold:C.gold,blue:C.blue,grey:'#e0e0e0'}[color]||C.green;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:outline?'transparent':bg,color:outline?bg:'#fff',
        border:outline?`2px solid ${bg}`:'none',borderRadius:7,
        padding:small?'5px 12px':'10px 20px',fontWeight:700,
        fontSize:small?11:13,cursor:disabled?'not-allowed':'pointer',
        fontFamily:'inherit',opacity:disabled?.65:1,whiteSpace:'nowrap'}}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type='text', placeholder='', help }) {
  return (
    <div style={{marginBottom:16}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:C.dark,
        textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{label}</label>}
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',border:`1px solid ${C.border}`,borderRadius:7,padding:'10px 12px',
          fontSize:13,boxSizing:'border-box',fontFamily:'inherit'}}/>
      {help && <div style={{fontSize:11,color:'#888',marginTop:4,fontFamily:'sans-serif'}}>{help}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options=[], help }) {
  return (
    <div style={{marginBottom:16}}>
      {label && <label style={{display:'block',fontSize:11,fontWeight:700,color:C.dark,
        textTransform:'uppercase',letterSpacing:1,marginBottom:4,fontFamily:'sans-serif'}}>{label}</label>}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',border:`1px solid ${C.border}`,borderRadius:7,padding:'10px 12px',
          fontSize:13,background:'#fff',fontFamily:'inherit'}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {help && <div style={{fontSize:11,color:'#888',marginTop:4,fontFamily:'sans-serif'}}>{help}</div>}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,
      overflow:'hidden',marginBottom:20}}>
      <div style={{background:C.green,padding:'12px 20px'}}>
        <span style={{color:'#fff',fontWeight:700,fontSize:14,fontFamily:'sans-serif'}}>{icon} {title}</span>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  );
}

export default function Settings({ settings: propSettings, setSettings, setLockPin }) {
  const [form,    setForm]    = useState({ ...propSettings });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [tab,     setTab]     = useState('session');
  const [newPin,  setNewPin]  = useState('');
  const [confPin, setConfPin] = useState('');
  const [pinMsg,  setPinMsg]  = useState('');

  // Sync when parent updates (e.g. loaded from Supabase)
  useEffect(() => { setForm({ ...propSettings }); }, [propSettings]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const payload = { ...form, id: 1 }; // single settings row
      const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      setSettings({ ...form });
      if (form.pin) setLockPin(form.pin);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Could not save settings: ' + e.message);
    }
    setSaving(false);
  };

  const setPin = () => {
    if (newPin.length < 4) { setPinMsg('PIN must be at least 4 digits.'); return; }
    if (newPin !== confPin) { setPinMsg('PINs do not match. Try again.'); return; }
    f('pin', newPin);
    setLockPin(newPin);
    setNewPin('');
    setConfPin('');
    setPinMsg('✅ PIN set! Click Save Settings to save permanently.');
  };

  const clearPin = () => {
    f('pin', '');
    setLockPin('');
    setNewPin('');
    setConfPin('');
    setPinMsg('PIN cleared. Click Save Settings to save.');
  };

  const TABS = [
    { id:'session', label:'🔒 Session & Security' },
    { id:'company', label:'🏢 Company Info' },
    { id:'system',  label:'⚙️ System' },
  ];

  return (
    <div>
      {/* Saved banner */}
      {saved && (
        <div style={{background:'#E8F5EE',border:'1px solid #1F6F43',borderRadius:8,
          padding:'10px 16px',marginBottom:16,fontSize:13,color:'#165C35',fontWeight:700,fontFamily:'sans-serif'}}>
          ✅ Settings saved successfully to database!
        </div>
      )}

      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{padding:'9px 18px',borderRadius:8,border:'none',cursor:'pointer',
              fontWeight:700,fontSize:13,fontFamily:'sans-serif',
              background:tab===t.id?C.green:'#eee',color:tab===t.id?'#fff':'#333'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SESSION & SECURITY ── */}
      {tab==='session' && (
        <>
          <SectionCard title="Inactivity Lock" icon="⏱️">
            <p style={{fontSize:13,color:'#555',marginBottom:20,fontFamily:'sans-serif',lineHeight:1.6}}>
              If no activity is detected for the set time, the ERP will lock the screen automatically.
              A PIN (optional) will be required to unlock.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <Select
                label="Lock Screen After (inactivity)"
                value={String(form.inactivity_timeout)}
                onChange={v => f('inactivity_timeout', Number(v))}
                help="Screen locks after this many minutes of no activity."
                options={[
                  {value:'0',  label:'Disabled (never lock)'},
                  {value:'5',  label:'5 minutes'},
                  {value:'10', label:'10 minutes'},
                  {value:'15', label:'15 minutes (recommended)'},
                  {value:'20', label:'20 minutes'},
                  {value:'30', label:'30 minutes'},
                  {value:'60', label:'1 hour'},
                ]}
              />
              <Select
                label="Auto Logout After (inactivity)"
                value={String(form.auto_logout)}
                onChange={v => f('auto_logout', Number(v))}
                help="If still locked after this time, user is signed out completely."
                options={[
                  {value:'0',   label:'Disabled (never auto-logout)'},
                  {value:'30',  label:'30 minutes'},
                  {value:'60',  label:'1 hour (recommended)'},
                  {value:'120', label:'2 hours'},
                  {value:'240', label:'4 hours'},
                  {value:'480', label:'8 hours'},
                ]}
              />
            </div>

            {/* Visual preview of timing */}
            {(Number(form.inactivity_timeout) > 0 || Number(form.auto_logout) > 0) && (
              <div style={{background:'#FDF6E3',borderRadius:10,padding:'14px 18px',marginBottom:4,fontFamily:'sans-serif'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#7D4E00',marginBottom:10}}>CURRENT SCHEDULE:</div>
                <div style={{display:'flex',alignItems:'center',gap:0,flexWrap:'wrap'}}>
                  <div style={{background:'#E8F5EE',border:'2px solid #1F6F43',borderRadius:8,
                    padding:'8px 14px',fontSize:12,fontWeight:700,color:'#165C35',textAlign:'center'}}>
                    ▶ Active
                  </div>
                  {Number(form.inactivity_timeout) > 0 && <>
                    <div style={{padding:'0 8px',color:'#888',fontSize:20,fontWeight:300}}>──────</div>
                    <div style={{background:'#E8F5EE',border:'2px solid #E67E22',borderRadius:8,
                      padding:'8px 14px',fontSize:12,fontWeight:700,color:'#E67E22',textAlign:'center'}}>
                      🔒 Locks at {form.inactivity_timeout} min
                    </div>
                  </>}
                  {Number(form.auto_logout) > 0 && <>
                    <div style={{padding:'0 8px',color:'#888',fontSize:20,fontWeight:300}}>──────</div>
                    <div style={{background:'#FADBD8',border:'2px solid #C0392B',borderRadius:8,
                      padding:'8px 14px',fontSize:12,fontWeight:700,color:'#C0392B',textAlign:'center'}}>
                      🚪 Logs out at {form.auto_logout} min
                    </div>
                  </>}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Screen Lock PIN" icon="🔑">
            <p style={{fontSize:13,color:'#555',marginBottom:16,fontFamily:'sans-serif',lineHeight:1.6}}>
              Set a 4-digit PIN for the lock screen. If no PIN is set, anyone can unlock the screen by clicking Continue.
              {form.pin && <span style={{color:'#1F6F43',fontWeight:700}}> ✅ PIN is currently set.</span>}
              {!form.pin && <span style={{color:'#E67E22',fontWeight:700}}> ⚠️ No PIN set — screen is unlocked without verification.</span>}
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,maxWidth:420}}>
              <Input
                label="New PIN (4+ digits)"
                type="password"
                value={newPin}
                onChange={setNewPin}
                placeholder="e.g. 1234"
              />
              <Input
                label="Confirm PIN"
                type="password"
                value={confPin}
                onChange={setConfPin}
                placeholder="Re-enter PIN"
              />
            </div>
            {pinMsg && (
              <div style={{fontSize:13,color:pinMsg.startsWith('✅')?C.dark:C.red,
                marginBottom:12,fontFamily:'sans-serif',fontWeight:600}}>{pinMsg}</div>
            )}
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <Btn color='green' small onClick={setPin}>Set PIN</Btn>
              {form.pin && <Btn color='red' small outline onClick={clearPin}>Remove PIN</Btn>}
            </div>
          </SectionCard>
        </>
      )}

      {/* ── COMPANY INFO ── */}
      {tab==='company' && (
        <SectionCard title="Company Information" icon="🏢">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <Input label="Company Name" value={form.company_name} onChange={v=>f('company_name',v)}
              placeholder="Verocent Global Limited"/>
            <Input label="Business Phone" value={form.company_phone} onChange={v=>f('company_phone',v)}
              placeholder="07037916561"/>
            <Input label="Business Email" value={form.company_email} onChange={v=>f('company_email',v)}
              placeholder="info@verocent.com"/>
            <Input label="RC / Registration Number" value={form.rc_number} onChange={v=>f('rc_number',v)}
              placeholder="CAC Registration No."/>
            <Input label="NAFDAC Number" value={form.nafdac_number} onChange={v=>f('nafdac_number',v)}
              placeholder="Your NAFDAC Reg. No."/>
            <Input label="Business Address" value={form.address} onChange={v=>f('address',v)}
              placeholder="Kaduna, Nigeria"/>
          </div>
        </SectionCard>
      )}

      {/* ── SYSTEM ── */}
      {tab==='system' && (
        <SectionCard title="System Preferences" icon="⚙️">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <Select
              label="Currency Symbol"
              value={form.currency || '₦'}
              onChange={v=>f('currency',v)}
              options={[
                {value:'₦', label:'₦ — Nigerian Naira (NGN)'},
                {value:'$', label:'$ — US Dollar (USD)'},
                {value:'€', label:'€ — Euro (EUR)'},
                {value:'£', label:'£ — British Pound (GBP)'},
              ]}
            />
            <Select
              label="Timezone"
              value={form.timezone || 'Africa/Lagos'}
              onChange={v=>f('timezone',v)}
              options={[
                {value:'Africa/Lagos',    label:'Africa/Lagos (WAT, UTC+1)'},
                {value:'Africa/Abuja',    label:'Africa/Abuja (WAT, UTC+1)'},
                {value:'Europe/London',   label:'Europe/London (GMT/BST)'},
                {value:'America/New_York',label:'America/New_York (EST/EDT)'},
              ]}
            />
            <Select
              label="Date Format"
              value={form.date_format || 'YYYY-MM-DD'}
              onChange={v=>f('date_format',v)}
              options={[
                {value:'YYYY-MM-DD', label:'YYYY-MM-DD (e.g. 2026-10-16)'},
                {value:'DD/MM/YYYY', label:'DD/MM/YYYY (e.g. 16/10/2026)'},
                {value:'MM/DD/YYYY', label:'MM/DD/YYYY (e.g. 10/16/2026)'},
              ]}
            />
            <Select
              label="Low Stock Threshold (default)"
              value={String(form.low_stock_threshold || '20')}
              onChange={v=>f('low_stock_threshold',Number(v))}
              help="Alert shows when any product stock falls below this number."
              options={[
                {value:'5',  label:'5 units'},
                {value:'10', label:'10 units'},
                {value:'15', label:'15 units'},
                {value:'20', label:'20 units (recommended)'},
                {value:'30', label:'30 units'},
                {value:'50', label:'50 units'},
              ]}
            />
          </div>
        </SectionCard>
      )}

      {/* ── Save button (always visible) ── */}
      <div style={{display:'flex',gap:12,alignItems:'center',
        background:'#fff',borderRadius:14,border:`1px solid ${C.border}`,
        padding:'18px 24px',marginTop:8}}>
        <Btn color='green' onClick={saveSettings} disabled={saving}>
          {saving ? '⏳ Saving…' : '💾 Save All Settings'}
        </Btn>
        <Btn color='grey' outline onClick={() => setForm({ ...propSettings })}>
          ↩ Reset Changes
        </Btn>
        {saved && (
          <span style={{color:C.dark,fontSize:13,fontWeight:700,fontFamily:'sans-serif'}}>
            ✅ Saved!
          </span>
        )}
        <span style={{fontSize:12,color:'#999',marginLeft:'auto',fontFamily:'sans-serif'}}>
          All settings are saved permanently to your database.
        </span>
      </div>
    </div>
  );
}