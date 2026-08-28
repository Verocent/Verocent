'use client';
import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data: staffUser, error: staffError } = await supabase
        .from('staff_users')
        .select('*')
        .ilike('email', email.trim())
        .eq('is_active', true)
        .eq('password', password.trim())
        .single();

      if (staffError || !staffUser) {
  console.log('LOGIN ERROR:', staffError);
  console.log('STAFF USER:', staffUser);

  setError(
    staffError
      ? `Database error: ${staffError.message}`
      : 'No matching staff account found.'
  );

  setLoading(false);
  return;
}

      await supabase.from('audit_logs').insert({
        user_email:  staffUser.email,
        user_name:   staffUser.full_name,
        action:      'LOGIN',
        module:      'Authentication',
        description: `${staffUser.full_name} logged in`,
        device:      navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        status:      'Success',
      });

      onLogin(staffUser);

    } catch(err) {
  console.error('LOGIN EXCEPTION:', err);
  setError(`Login error: ${err?.message || String(err)}`);
}




    setLoading(false);
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #1B2631 0%, #165C35 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: Arial, sans-serif;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
          overflow-y: auto;
        }
        .login-box {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }
        .login-brand {
          text-align: center;
          margin-bottom: 28px;
        }
        .login-logo {
          width: 80px; height: 80px;
          background: #D4A017;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(212,160,23,0.4);
        }
        .login-logo img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .login-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }
        .login-title {
          font-size: 22px; font-weight: 800;
          color: #165C35; text-align: center; margin-bottom: 6px;
        }
        .login-sub {
          font-size: 13px; color: #888;
          text-align: center; margin-bottom: 24px;
        }
        .login-error {
          background: #FADBD8; border: 1px solid #C0392B;
          border-radius: 10px; padding: 12px 14px;
          margin-bottom: 16px; font-size: 13px; color: #C0392B;
        }
        .login-label {
          display: block; font-size: 11px; font-weight: 700;
          color: #165C35; text-transform: uppercase;
          letter-spacing: 1px; margin-bottom: 8px;
        }
        .login-input {
          width: 100%; border: 2px solid #C9C9C0;
          border-radius: 10px; padding: 14px 16px;
          font-size: 16px; font-family: inherit;
          outline: none; margin-bottom: 18px;
          -webkit-appearance: none;
        }
        .login-input:focus { border-color: #1F6F43; }
        .pass-wrap { position: relative; }
        .pass-wrap .login-input { padding-right: 50px; margin-bottom: 0; }
        .pass-toggle {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; font-size: 20px; color: #888;
        }
        .login-field { margin-bottom: 18px; }
        .login-btn {
          width: 100%; background: #1F6F43; color: #fff;
          border: none; border-radius: 10px; padding: 16px;
          font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          margin-top: 8px; -webkit-appearance: none;
        }
        .login-btn:disabled { background: #aaa; cursor: not-allowed; }
        .login-help {
          margin-top: 20px; padding: 12px 16px;
          background: #E8F5EE; border-radius: 10px;
          font-size: 13px; color: #165C35; text-align: center;
        }
        .login-help a { color: #1F6F43; font-weight: 700; }
        .login-footer {
          text-align: center; margin-top: 24px;
          color: rgba(255,255,255,0.35); font-size: 11px;
        }
      `}</style>

      <div className='login-page'>
        <div className='login-box'>
          <div className='login-brand'>
            <div className='login-logo'>
              <img src='/logo.png' alt='V'
                onError={e=>e.target.style.display='none'}/>
            </div>
            <div style={{color:'#fff',fontWeight:800,fontSize:24}}>VEROCENT</div>
            <div style={{color:'#D4A017',fontWeight:600,fontSize:13,marginTop:4}}>
              PURE ESSENCE ERP
            </div>
            <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:4}}>
              Kaduna, Nigeria 🇳🇬
            </div>
          </div>

          <div className='login-card'>
            <div className='login-title'>Staff Login</div>
            <div className='login-sub'>Sign in with your Verocent account</div>

            {error && <div className='login-error'>⚠️ {error}</div>}

            <div className='login-field'>
              <label className='login-label'>Email Address</label>
              <input className='login-input' type='email'
                value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                placeholder='your@email.com'
                autoComplete='email' autoCapitalize='none'/>
            </div>

            <div className='login-field'>
              <label className='login-label'>Password</label>
              <div className='pass-wrap'>
                <input className='login-input'
                  type={showPass?'text':'password'}
                  value={password} onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                  placeholder='Enter your password'
                  autoComplete='current-password'/>
                <button className='pass-toggle'
                  onClick={()=>setShowPass(!showPass)} type='button'>
                  {showPass?'🙈':'👁️'}
                </button>
              </div>
            </div>

            <button className='login-btn'
              onClick={handleLogin} disabled={loading}>
              {loading?'Signing in…':'🔐 Sign In'}
            </button>

            <div className='login-help'>
              🌿 Unable to login? Contact Admin on{' '}
              <a href='https://wa.me/2347036670251'
                target='_blank' rel='noreferrer'>WhatsApp</a>
            </div>
          </div>

          <div className='login-footer'>
            Pure Care with Verocent — Nature's Touch for Healthy Hair
          </div>
        </div>
      </div>
    </>
  );
}