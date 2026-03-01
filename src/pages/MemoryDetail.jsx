
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function MemoryDetail({ user }) {
  const [mediaWithUrls, setMediaWithUrls] = useState([]);
  mediaWithUrls.forEach(m => {
  console.log("TYPE:", m.file_type);
});
  
  const { id } = useParams()
  const navigate = useNavigate()
  const [memory, setMemory] = useState(null)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [audioURL, setAudioURL] = useState(null)
  const [photoURLs, setPhotoURLs] = useState([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: mem } = await supabase
        .from('memories').select('*').eq('id', id).eq('user_id', user.id).single()

      if (!mem) { navigate('/memories'); return }
      setMemory(mem)

      if (mem.audio_path) {
        const { data } = await supabase.storage.from('memories').createSignedUrl(mem.audio_path, 3600)
        if (data) setAudioURL(data.signedUrl)
      }

      const { data: mediaData } = await supabase
        .from('memory_media').select('*').eq('memory_id', id)

        if (mediaData) {
  const updatedMedia = await Promise.all(
    mediaData.map(async (item) => {
      const { data } = await supabase.storage
        .from('memories')
        .createSignedUrl(item.file_path, 3600)

      return {
        ...item,
        url: data?.signedUrl || null,
      }
    })
  )

  setMediaWithUrls(updatedMedia)
}

      const photoItems = []
      for (const item of (mediaData || [])) {
        if (item.file_type === 'photo') {
          const { data } = await supabase.storage.from('memories').createSignedUrl(item.file_path, 3600)
          if (data) photoItems.push({ ...item, url: data.signedUrl })
        }
      }
      setPhotoURLs(photoItems)
      setMedia(mediaData || [])
      setLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this memory permanently?')) return
    setDeleting(true)
    await supabase.from('memory_media').delete().eq('memory_id', id)
    await supabase.from('memories').delete().eq('id', id)
    navigate('/memories')
  }

  const emotionColors = {
    happy: '#d4a017', sad: '#6b88a8', nostalgic: '#8b6914',
    proud: '#7a5c44', peaceful: '#5c7a6b', grateful: '#8b7355',
    excited: '#a06030', bittersweet: '#8b6b8b',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', fontStyle: 'italic' }}>
      Loading memory...
    </div>
  )

  if (!memory) return null

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem', animation: 'fadeIn 0.5s ease' }}>
      {/* Back */}
      <Link to="/memories" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
        ← Back to Memories
      </Link>

      {/* Header */}
      <div style={{
        background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderRadius: '16px', padding: '2.5rem', marginBottom: '1.5rem',
        boxShadow: '0 4px 20px var(--shadow)',
        borderTop: `6px solid ${emotionColors[memory.emotion_tag] || 'var(--amber)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--brown)', flex: 1, lineHeight: 1.3 }}>
            {memory.title}
          </h1>
          {memory.emotion_tag && (
            <span style={{
              background: emotionColors[memory.emotion_tag] || 'var(--sepia)',
              color: 'white', padding: '0.3rem 0.9rem', borderRadius: '20px',
              fontSize: '0.875rem', marginLeft: '1rem', whiteSpace: 'nowrap',
            }}>{memory.emotion_tag}</span>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          📅 {format(new Date(memory.created_at), 'MMMM d, yyyy — h:mm a')}
        </p>

        {memory.description && (
          <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: '1rem' }}>
            {memory.description}
          </p>
        )}
      </div>

      {/* Audio */}
      {audioURL && (
        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--parchment)',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 2px 8px var(--shadow)',
        }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎙 Voice Recording
          </h2>
          <audio controls src={audioURL} style={{ width: '100%' }} />
        </div>
      )}

      {/* Transcript */}
      {memory.transcript && (
        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--parchment)',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 2px 8px var(--shadow)',
        }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1rem' }}>
            📝 Transcript
          </h2>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, fontStyle: 'italic' }}>
            {memory.transcript}
          </p>
        </div>
      )}

      {/* Photos */}
      {photoURLs.length > 0 && (
        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--parchment)',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 2px 8px var(--shadow)',
        }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1rem' }}>
            📷 Photos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {photoURLs.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noreferrer">
                <img src={p.url} alt={p.file_name} style={{
                  width: '100%', aspectRatio: '1', objectFit: 'cover',
                  borderRadius: '8px', border: '2px solid var(--parchment)',
                  transition: 'transform 0.2s', cursor: 'pointer',
                }} />
              </a>
            ))}
          </div>
        </div>
      )}
{/* Files */}

{Array.isArray(mediaWithUrls) && (() => {

  console.log("ALL MEDIA:", mediaWithUrls);

  const files = mediaWithUrls.filter(m => {
    console.log("Checking type:", m?.file_type);
    return m?.file_type === 'file';
  });

  console.log("FILTERED FILES:", files);

  if (files.length === 0) return null;

  return (
    <div style={{
      background: 'var(--warm-white)',
      border: '1px solid var(--parchment)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px var(--shadow)',
    }}>
      <h2 style={{
        fontSize: '1.1rem',
        color: 'var(--brown)',
        marginBottom: '1rem'
      }}>
        📄 Documents
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {files.map((f, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'var(--cream)',
              borderRadius: '6px',
              border: '1px solid var(--parchment)',
            }}
          >
            <span>📄</span>
            <a
  href={f.url}
  target="_blank"
  rel="noopener noreferrer"
  style={{
    color: 'var(--text)',
    fontSize: '0.875rem',
    textDecoration: 'none',
    cursor: 'pointer'
  }}
>
  {f.file_name}
</a>
          </div>
        ))}
      </div>
    </div>
  );

})()}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={handleDelete} disabled={deleting} style={{
          background: 'transparent', border: '1px solid #fca5a5', color: '#dc2626',
          padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
        }}>
          {deleting ? 'Deleting...' : '🗑 Delete Memory'}
        </button>
      </div>
    </div>
  )
}