import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    let result
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password })
      if (!result.error) setMessage('Check your email to confirm your account!')
    } else {
      result = await supabase.auth.signInWithPassword({ email, password })
    }

    if (result.error) setError(result.error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--brown) 0%, var(--brown-light) 100%)',
      padding: '2rem',
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.05,
        backgroundImage: 'repeating-linear-gradient(45deg, var(--amber) 0, var(--amber) 1px, transparent 0, transparent 50%)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--warm-white)', borderRadius: '12px', padding: '3rem',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid var(--parchment)', animation: 'fadeIn 0.6s ease',
        position: 'relative',
      }}>
        {/* Decorative corner lines */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '30px', height: '30px', borderTop: '2px solid var(--amber)', borderLeft: '2px solid var(--amber)' }} />
        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '30px', height: '30px', borderTop: '2px solid var(--amber)', borderRight: '2px solid var(--amber)' }} />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '30px', height: '30px', borderBottom: '2px solid var(--amber)', borderLeft: '2px solid var(--amber)' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '30px', height: '30px', borderBottom: '2px solid var(--amber)', borderRight: '2px solid var(--amber)' }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📖</div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brown)', marginBottom: '0.5rem' }}>
            Memora
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Every Memory Deserves to Live Forever.
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Email Address
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'var(--cream)',
                border: '1px solid var(--parchment)', borderRadius: '6px', fontSize: '1rem',
                color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s',
              }}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'var(--cream)',
                border: '1px solid var(--parchment)', borderRadius: '6px', fontSize: '1rem',
                color: 'var(--text)', outline: 'none',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>{error}</div>}
          {message && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>{message}</div>}

          <button type="submit" disabled={loading} style={{
            background: 'var(--brown)', color: 'var(--cream)', padding: '0.9rem',
            border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            transition: 'background 0.2s', letterSpacing: '0.05em',
            marginTop: '0.5rem',
          }}>
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            style={{ background: 'none', border: 'none', color: 'var(--sepia)', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </div>
    </div>
  )
}