import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function Dashboard({ user }) {
  const [recentMemories, setRecentMemories] = useState([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('memories')
        .select('id, title, created_at, emotion_tag, has_audio, has_photos, has_files')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4)

      const { count } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      const { count: monthCount } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thisMonthStart.toISOString())

      setRecentMemories(data || [])
      setStats({ total: count || 0, thisMonth: monthCount || 0 })
      setLoading(false)
    }
    load()
  }, [user.id])

  const emotionColors = {
    happy: '#d4a017', sad: '#6b88a8', nostalgic: '#8b6914',
    proud: '#7a5c44', peaceful: '#5c7a6b', grateful: '#8b7355',
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Hero greeting */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeIn 0.6s ease' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Welcome back
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--brown)', lineHeight: 1.2, marginBottom: '1rem' }}>
          Your Story Lives Here
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', fontStyle: 'italic', lineHeight: 1.7 }}>
          Every memory you preserve is a gift to the future. What story will you capture today?
        </p>
        <div style={{ width: '80px', height: '2px', background: 'var(--amber)', margin: '1.5rem auto 0' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
        {[
          { label: 'Total Memories', value: stats.total, icon: '📚' },
          { label: 'This Month', value: stats.thisMonth, icon: '✨' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            background: 'var(--warm-white)', border: '1px solid var(--parchment)',
            borderRadius: '10px', padding: '1.5rem', textAlign: 'center',
            boxShadow: '0 2px 8px var(--shadow)',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", color: 'var(--brown)', fontWeight: '700' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Big Record Button */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Link to="/record">
          <button style={{
            background: 'var(--brown)', color: 'var(--cream)',
            border: '3px solid var(--amber)', borderRadius: '50%',
            width: '180px', height: '180px', fontSize: '1rem',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            margin: '0 auto', transition: 'all 0.3s ease',
            boxShadow: '0 8px 30px rgba(61,43,31,0.3), 0 0 0 8px var(--parchment)',
            animation: 'pulse-glow 3s infinite',
          }}>
            <span style={{ fontSize: '2.5rem' }}>🎙</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontStyle: 'italic' }}>Record a</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontStyle: 'italic' }}>Memory</span>
          </button>
        </Link>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
        {[
          { to: '/memories', icon: '🗃', label: 'View All Memories', desc: 'Browse your collection' },
          { to: '/chatbot', icon: '💬', label: 'Memory Chat', desc: 'Ask about your stories' },
          { to: '/record', icon: '📷', label: 'Add with Photos', desc: 'Capture with visuals' },
        ].map(({ to, icon, label, desc }) => (
          <Link key={to} to={to}>
            <div style={{
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              borderRadius: '10px', padding: '1.5rem', textAlign: 'center',
              boxShadow: '0 2px 8px var(--shadow)', transition: 'all 0.2s',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
              <h3 style={{ color: 'var(--brown)', fontSize: '1rem', marginBottom: '0.25rem' }}>{label}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Memories */}
      {recentMemories.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brown)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--amber)' }}>✦</span> Recent Memories
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {recentMemories.map((m, i) => (
              <Link key={m.id} to={`/memories/${m.id}`}>
                <div style={{
                  background: 'var(--warm-white)', border: '1px solid var(--parchment)',
                  borderRadius: '10px', padding: '1.5rem', cursor: 'pointer',
                  boxShadow: '0 2px 8px var(--shadow)', transition: 'all 0.2s',
                  animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{ color: 'var(--brown)', fontSize: '1rem', flex: 1 }}>{m.title || 'Untitled Memory'}</h3>
                    {m.emotion_tag && (
                      <span style={{
                        background: emotionColors[m.emotion_tag] || 'var(--sepia)',
                        color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem',
                        borderRadius: '20px', marginLeft: '0.5rem', whiteSpace: 'nowrap',
                      }}>{m.emotion_tag}</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                    {format(new Date(m.created_at), 'MMMM d, yyyy')}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {m.has_audio && <span style={{ fontSize: '0.8rem' }}>🎙</span>}
                    {m.has_photos && <span style={{ fontSize: '0.8rem' }}>📷</span>}
                    {m.has_files && <span style={{ fontSize: '0.8rem' }}>📄</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/memories" style={{ color: 'var(--sepia)', fontSize: '0.9rem', textDecoration: 'underline', fontStyle: 'italic' }}>
              View all memories →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}