import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function MemoryViewer({ user }) {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [emotionFilter, setEmotionFilter] = useState('')

  useEffect(() => { loadMemories() }, [user.id])

  async function loadMemories() {
    setLoading(true)
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setMemories(data || [])
    setLoading(false)
  }

  async function handleSearch() {
    setLoading(true)
    let query = supabase.from('memories').select('*').eq('user_id', user.id)

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,transcript.ilike.%${search}%`)
    }
    if (dateFilter) {
      const start = new Date(dateFilter)
      const end = new Date(dateFilter)
      end.setMonth(end.getMonth() + 1)
      query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
    }
    if (emotionFilter) {
      query = query.eq('emotion_tag', emotionFilter)
    }

    const { data } = await query.order('created_at', { ascending: false })
    setMemories(data || [])
    setLoading(false)
  }

  const resetFilters = () => {
    setSearch('')
    setDateFilter('')
    setEmotionFilter('')
    loadMemories()
  }

  const emotionColors = {
    happy: '#d4a017', sad: '#6b88a8', nostalgic: '#8b6914',
    proud: '#7a5c44', peaceful: '#5c7a6b', grateful: '#8b7355',
    excited: '#a06030', bittersweet: '#8b6b8b',
  }

  const emotions = ['happy', 'sad', 'nostalgic', 'proud', 'peaceful', 'grateful', 'excited', 'bittersweet']

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', animation: 'fadeIn 0.5s ease' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--brown)', marginBottom: '0.5rem' }}>
        Your Memory Collection
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontStyle: 'italic' }}>
        {memories.length} memories preserved
      </p>

      {/* Search & Filter */}
      <div style={{
        background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem',
        boxShadow: '0 2px 10px var(--shadow)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Memories
            </label>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by keyword..."
              style={{
                width: '100%', padding: '0.7rem 1rem', background: 'var(--cream)',
                border: '1px solid var(--parchment)', borderRadius: '6px', fontSize: '0.95rem',
                color: 'var(--text)', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Month
            </label>
            <input
              type="month" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              style={{
                padding: '0.7rem 1rem', background: 'var(--cream)',
                border: '1px solid var(--parchment)', borderRadius: '6px', fontSize: '0.95rem',
                color: 'var(--text)', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSearch} style={{
              background: 'var(--brown)', color: 'var(--cream)', border: 'none',
              padding: '0.7rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
            }}>Search</button>
            <button onClick={resetFilters} style={{
              background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--parchment)',
              padding: '0.7rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
            }}>Reset</button>
          </div>
        </div>

        {/* Emotion filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Filter by feel:</span>
          {emotions.map(e => (
            <button key={e} onClick={() => { setEmotionFilter(e === emotionFilter ? '' : e) }} style={{
              padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem',
              border: '1px solid var(--parchment)', cursor: 'pointer',
              background: emotionFilter === e ? (emotionColors[e] || 'var(--brown)') : 'var(--cream)',
              color: emotionFilter === e ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>{e}</button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Loading your memories...
        </div>
      ) : memories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '0.5rem', color: 'var(--brown)' }}>No memories found</h3>
          <p style={{ fontStyle: 'italic' }}>Try different search terms or <Link to="/record" style={{ color: 'var(--sepia)', textDecoration: 'underline' }}>record a new memory</Link></p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {memories.map((m, i) => (
            <Link key={m.id} to={`/memories/${m.id}`}>
              <div style={{
                background: 'var(--warm-white)', border: '1px solid var(--parchment)',
                borderRadius: '12px', padding: '1.5rem', cursor: 'pointer',
                boxShadow: '0 2px 10px var(--shadow)', transition: 'all 0.2s',
                animation: `fadeIn 0.4s ease ${(i % 8) * 0.05}s both`,
                borderLeft: `4px solid ${emotionColors[m.emotion_tag] || 'var(--amber)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ color: 'var(--brown)', fontSize: '1.05rem', flex: 1, lineHeight: 1.4 }}>
                    {m.title || 'Untitled Memory'}
                  </h3>
                  {m.emotion_tag && (
                    <span style={{
                      background: emotionColors[m.emotion_tag] || 'var(--sepia)',
                      color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.6rem',
                      borderRadius: '20px', marginLeft: '0.5rem', whiteSpace: 'nowrap',
                    }}>{m.emotion_tag}</span>
                  )}
                </div>

                {m.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {m.description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {format(new Date(m.created_at), 'MMM d, yyyy')}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {m.has_audio && <span title="Has audio">🎙</span>}
                    {m.has_photos && <span title="Has photos">📷</span>}
                    {m.has_files && <span title="Has files">📄</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}