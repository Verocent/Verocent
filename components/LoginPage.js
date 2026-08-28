'use client';
import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      const { supabase } = await import('@/lib/supabase');

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError('Incorrect email or password. Please try again.');
        setLoading(false);
        return;
      }

      // Get staff profile
      const { data: staffUser, error: staffError } = await supabase
        .from('staff_users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (staffError || !staffUser) {
        setError('Your account is not set up. Please contact Veronica.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!staffUser.is_active) {
        setError('Your account has been deactivated. Contact Veronica.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Update last login
      await supabase.from('staff_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email.trim().toLowerCase());

      // Log the login
      await supabase.from('audit_logs').insert({
        user_email:  staffUser.email,
        user_name:   staffUser.full_name,
        action:      'LOGIN',
        module:      'Authentication',
        description: `${staffUser.full_name} logged in successfully`,
        device:      navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        status:      'Success',
      }).catch(()=>{});

      onLogin(staffUser);

    } catch(err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#1B2631 0%,#165C35 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16, fontFamily:'Arial,sans-serif',
    }}>
      <div style={{width:'100%', maxWidth:420}}>

        {/* Brand */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{
            width:80, height:80, background:'#D4A017', borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:32, fontWeight:900, color:'#fff',
            margin:'0 auto 16px', overflow:'hidden',
            boxShadow:'0 8px 24px rgba(212,160,23,0.4)',
          }}>
            <img src='/logo.png' alt='Verocent'
              style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}
              onError={e=>{ e.target.style.display='none'; }}/>
          </div>
          <div style={{color:'#fff',fontWeight:800,fontSize:24,letterSpacing:1}}>
            VEROCENT
          </div>
          <div style={{color:'#D4A017',fontWeight:600,fontSize:13,marginTop:4}}>
            PURE ESSENCE ERP
          </div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:4}}>
            Kaduna, Nigeria 🇳🇬
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:'#fff', borderRadius:16, padding:32,
          boxShadow:'0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{fontSize:20,fontWeight:800,color:'#165C35',
            marginBottom:6,textAlign:'center',margin:'0 0 6px'}}>
            Staff Login
          </h2>
          <p style={{fontSize:13,color:'#888',textAlign:'center',marginBottom:24}}>
            Sign in with your Verocent account
          </p>

          {/* Error */}
          {error && (
            <div style={{background:'#FADBD8',border:'1px solid #C0392B',
              borderRadius:8,padding:'10px 14px',marginBottom:16,
              fontSize:13,color:'#C0392B',display:'flex',gap:8}}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,
              color:'#165C35',textTransform:'uppercase',
              letterSpacing:1,marginBottom:6}}>
              Email Address
            </label>
            <input
              type='email'
              value={email}
              onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder='your@email.com'
              autoComplete='email'
              style={{width:'100%',border:'2px solid #C9C9C0',borderRadius:8,
                padding:'12px 14px',fontSize:14,boxSizing:'border-box',
                outline:'none',fontFamily:'inherit'}}
              onFocus={e=>e.target.style.borderColor='#1F6F43'}
              onBlur={e=>e.target.style.borderColor='#C9C9C0'}
            />
          </div>

          {/* Password */}
          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:11,fontWeight:700,
              color:'#165C35',textTransform:'uppercase',
              letterSpacing:1,marginBottom:6}}>
              Password
            </label>
            <div style={{position:'relative'}}>
              <input
                type={showPass?'text':'password'}
                value={password}
                onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                placeholder='Enter your password'
                autoComplete='current-password'
                style={{width:'100%',border:'2px solid #C9C9C0',borderRadius:8,
                  padding:'12px 44px 12px 14px',fontSize:14,
                  boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
                onFocus={e=>e.target.style.borderColor='#1F6F43'}
                onBlur={e=>e.target.style.borderColor='#C9C9C0'}
              />
              <button onClick={()=>setShowPass(!showPass)}
                style={{position:'absolute',right:12,top:'50%',
                  transform:'translateY(-50%)',background:'none',
                  border:'none',cursor:'pointer',fontSize:18,color:'#888'}}>
                {showPass?'🙈':'👁️'}
              </button>
            </div>
          </div>

          {/* Button */}
          <button onClick={handleLogin} disabled={loading}
            style={{width:'100%',background:loading?'#aaa':'#1F6F43',
              color:'#fff',border:'none',borderRadius:8,padding:'14px',
              fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',
              fontFamily:'inherit',boxShadow:'0 4px 12px rgba(31,111,67,0.3)'}}>
            {loading ? 'Signing in…' : '🔐 Sign In'}
          </button>

          {/* Help */}
          <div style={{marginTop:20,padding:'12px 16px',background:'#E8F5EE',
            borderRadius:8,fontSize:12,color:'#165C35',textAlign:'center'}}>
            🌿 Unable to login? Contact Admin on{' '}
<a href="https://wa.me/2347036670251" 
  style={{color:'#1F6F43',fontWeight:700}}>
  WhatsApp
</a>
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center',marginTop:24,
          color:'rgba(255,255,255,0.4)',fontSize:11}}>
          Pure Care with Verocent — Nature's Touch for Healthy Hair
        </div>
      </div>
    </div>
  );
}