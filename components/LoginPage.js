'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function LoginPage() {
  const router   = useRouter();
  const [staffId,   setStaffId]   = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!staffId.trim() || !password.trim()) {
      setError('Please enter your Staff ID and password.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Query using staff_id and password columns
      const { data, error: dbErr } = await supabase
        .from('staff_users')
        .select('*')
        .eq('staff_id', staffId.trim())
        .eq('password', password.trim())
        .eq('is_active', true)
        .single();

      if (dbErr || !data) {
        setError('Invalid Staff ID or password. Please try again.\n\nIf you need help, contact the administrator on WhatsApp.');
        setLoading(false);
        return;
      }

      // Save session to localStorage
      const session = {
        id:        data.id,
        staff_id:  data.staff_id,
        name:      data.full_name,
        role:      data.role,
        loginAt:   new Date().toISOString(),
      };
      localStorage.setItem('verocent_session', JSON.stringify(session));

      // Write audit log
      try {
        await supabase.from('audit_logs').insert([{
          action:      'LOGIN',
          module:      'Auth',
          description: `${data.full_name} logged in`,
          user_name:   data.full_name,
          created_at:  new Date().toISOString(),
        }]);
      } catch (_) { /* audit log failure should not block login */ }

      router.push('/');
    } catch (e) {
      setError('Connection error. Please check your internet and try again.\n\n' + e.message);
    }
    setLoading(false);
  };

  const whatsappUrl = 'https://wa.me/2347036670251?text=' +
    encodeURIComponent('Hello, I need help with my Verocent ERP login.');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D3D20 0%, #1F6F43 50%, #D4A017 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0D3D20, #1F6F43)',
          padding: '36px 32px 28px',
          textAlign: 'center',
        }}>
          <div style={{fontSize: 48, marginBottom: 8}}>🌿</div>
          <div style={{
            color: '#D4A017',
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 1,
            marginBottom: 4,
          }}>
            VEROCENT PURE ESSENCE
          </div>
          <div style={{color: 'rgba(255,255,255,0.75)', fontSize: 13}}>
            ERP Management System
          </div>
        </div>

        {/* Form */}
        <div style={{padding: '32px 32px 24px'}}>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#1A1A1A',
            marginBottom: 6,
          }}>
            Welcome back
          </div>
          <div style={{fontSize: 13, color: '#888', marginBottom: 24}}>
            Sign in with your Staff ID and password
          </div>

          <form onSubmit={handleLogin}>
            {/* Staff ID */}
            <div style={{marginBottom: 16}}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#165C35',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                Staff ID
              </label>
              <input
                type='text'
                value={staffId}
                onChange={e => setStaffId(e.target.value)}
                placeholder='Enter your Staff ID'
                autoComplete='username'
                style={{
                  width: '100%',
                  border: '2px solid #C9C9C0',
                  borderRadius: 8,
                  padding: '11px 14px',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  fontFamily: 'sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#1F6F43'}
                onBlur={e  => e.target.style.borderColor = '#C9C9C0'}
              />
            </div>

            {/* Password */}
            <div style={{marginBottom: 20}}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#165C35',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Enter your password'
                autoComplete='current-password'
                style={{
                  width: '100%',
                  border: '2px solid #C9C9C0',
                  borderRadius: 8,
                  padding: '11px 14px',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  fontFamily: 'sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#1F6F43'}
                onBlur={e  => e.target.style.borderColor = '#C9C9C0'}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: '#FADBD8',
                border: '1px solid #E74C3C',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#C0392B',
                whiteSpace: 'pre-line',
                lineHeight: 1.5,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type='submit'
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#888' : 'linear-gradient(135deg, #1F6F43, #165C35)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '13px',
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'sans-serif',
                letterSpacing: 0.5,
              }}
            >
              {loading ? '⏳ Signing in…' : '🔓 Sign In'}
            </button>
          </form>
        </div>

        {/* Footer — WhatsApp help */}
        <div style={{
          background: '#F9F9F7',
          borderTop: '1px solid #EBEBEB',
          padding: '16px 32px 20px',
          textAlign: 'center',
        }}>
          <div style={{fontSize: 12, color: '#888', marginBottom: 8}}>
            Having trouble logging in?
          </div>
          <a
            href={whatsappUrl}
            target='_blank'
            rel='noreferrer'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#25D366',
              color: '#fff',
              borderRadius: 20,
              padding: '7px 16px',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              fontFamily: 'sans-serif',
            }}
          >
            💬 Contact Admin on WhatsApp
          </a>
          <div style={{fontSize: 11, color: '#bbb', marginTop: 10}}>
            © {new Date().getFullYear()} Verocent Global Limited · Kaduna, Nigeria
          </div>
        </div>
      </div>
    </div>
  );
}