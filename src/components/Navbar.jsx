import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Navbar({ user }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const linkStyle = (path) => ({
    color: isActive(path) ? 'var(--amber-light)' : 'var(--parchment)',
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0.3rem 0',
    borderBottom: isActive(path) ? '2px solid var(--amber)' : '2px solid transparent',
    transition: 'all 0.2s',
  })

  return (
    <nav style={{
      background: 'var(--brown)', borderBottom: '3px solid var(--amber)',
      padding: '0 2rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: '64px', position: 'sticky',
      top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(61,43,31,0.3)',
    }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'var(--amber-light)', fontStyle: 'italic' }}>
        ✦ Memora
      </span>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {[['/', 'Home'], ['/record', 'Record'], ['/memories', 'My Memories'], ['/chatbot', 'Memory Chat']].map(([path, label]) => (
          <Link key={path} to={path} style={linkStyle(path)}>{label}</Link>
        ))}
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            background: 'transparent', border: '1px solid var(--sepia)',
            color: 'var(--parchment)', padding: '0.4rem 1rem', borderRadius: '4px',
            fontSize: '0.85rem', cursor: 'pointer',
          }}
        >Sign Out</button>
      </div>
    </nav>
  )
}