import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STATUS = { IDLE: 'idle', RECORDING: 'recording', SAVING: 'saving', TRANSCRIBING: 'transcribing', DONE: 'done', ERROR: 'error' }

export default function RecordMemory({ user }) {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [emotionTag, setEmotionTag] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioURL, setAudioURL] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [photos, setPhotos] = useState([])
  const [files, setFiles] = useState([])
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')

  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const timerRef = useRef(null)
  const navigate = useNavigate()
  const photoInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunks.current = []
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioURL(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRecorder.current.start()
      setStatus(STATUS.RECORDING)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.')
      setStatus(STATUS.ERROR)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current?.state !== 'inactive') {
      mediaRecorder.current.stop()
      clearInterval(timerRef.current)
      setStatus(STATUS.IDLE)
    }
  }

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setPhotos(prev => [...prev, ...newFiles].slice(0, 10))
  }

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles].slice(0, 5))
  }

  const handleSave = async () => {
    if (!title.trim()) { setError('Please add a title for this memory.'); return }
    setStatus(STATUS.SAVING)
    setError('')

    try {
      // Insert memory record
      const { data: memory, error: memErr } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          emotion_tag: emotionTag || null,
          has_audio: !!audioBlob,
          has_photos: photos.length > 0,
          has_files: files.length > 0,
          transcript: '',
        })
        .select()
        .single()

      if (memErr) throw memErr

      const memId = memory.id

      // Upload audio
      if (audioBlob) {
        const audioPath = `${user.id}/${memId}/audio.webm`
        const { error: audioErr } = await supabase.storage
          .from('memories')
          .upload(audioPath, audioBlob)
      if (audioErr) {
        console.error("Audio upload error:", audioErr)
      } else {
        const { error: updateErr } = await supabase
          .from('memories')
          .update({ audio_path: audioPath })
          .eq('id', memId)

        if (updateErr) console.error("Audio update error:", updateErr)
      }
      }

      // Upload photos
// Upload photos
for (let i = 0; i < photos.length; i++) {
  const ext = photos[i].name.split('.').pop()
  const photoPath = `${user.id}/${memId}/photo_${i}.${ext}`

  const { error: photoErr } = await supabase.storage
    .from('memories')
    .upload(photoPath, photos[i])

  if (photoErr) {
    console.error("Photo upload error:", photoErr)
  } else {
    const { error: insertErr } = await supabase
      .from('memory_media')
      .insert({
        memory_id: memId,
        file_path: photoPath,
        file_type: 'photo',
        file_name: photos[i].name,
      })

    if (insertErr) console.error("Photo insert error:", insertErr)
  }
}

      // Upload files
      for (let i = 0; i < files.length; i++) {
        const filePath = `${user.id}/${memId}/${files[i].name}`
        const { error: fileErr } = await supabase.storage
          .from('memories')
          .upload(filePath, files[i])
        if (!fileErr) {
          await supabase.from('memory_media').insert({
            memory_id: memId, 
            file_path: filePath, file_type: 'file',
            file_name: files[i].name,
          })
        }
      }

      setStatus(STATUS.DONE)
      setTimeout(() => navigate(`/memories/${memId}`), 1500)
    } catch (err) {
      console.error(err)
      setError('Failed to save memory. ' + err.message)
      setStatus(STATUS.ERROR)
    }
  }

  const emotions = ['happy', 'sad', 'nostalgic', 'proud', 'peaceful', 'grateful', 'excited', 'bittersweet']

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem', animation: 'fadeIn 0.5s ease' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--brown)', marginBottom: '0.5rem', textAlign: 'center' }}>
        Record a Memory
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2.5rem', fontStyle: 'italic' }}>
        Let your voice carry your story forward
      </p>

      {/* TITLE */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Memory Title *
        </label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. The Summer We Moved to the Valley"
          style={{
            width: '100%', padding: '0.9rem 1rem', background: 'var(--warm-white)',
            border: '1px solid var(--parchment)', borderRadius: '8px', fontSize: '1.1rem',
            color: 'var(--text)', outline: 'none',
          }}
        />
      </div>

      {/* RECORD BUTTON */}
      <div style={{
        background: 'var(--warm-white)', border: '2px solid var(--parchment)',
        borderRadius: '16px', padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem',
        boxShadow: '0 4px 20px var(--shadow)',
      }}>
        {status === STATUS.RECORDING ? (
          <>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: '#dc2626', margin: '0 auto 1.5rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
              animation: 'recording-pulse 1.5s ease infinite',
              boxShadow: '0 0 30px rgba(220,38,38,0.4)',
            }}>🎙</div>
            <p style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", color: '#dc2626', marginBottom: '0.5rem' }}>
              {formatTime(recordingTime)}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>Recording... speak freely</p>
            <button onClick={stopRecording} style={{
              background: 'var(--brown)', color: 'var(--cream)', border: 'none',
              padding: '0.9rem 2.5rem', borderRadius: '50px', fontSize: '1rem',
              cursor: 'pointer', letterSpacing: '0.05em',
            }}>⏹ Stop Recording</button>
          </>
        ) : (
          <>
            <button onClick={startRecording} disabled={status === STATUS.SAVING || status === STATUS.DONE} style={{
              width: '140px', height: '140px', borderRadius: '50%',
              background: 'var(--brown)', border: '4px solid var(--amber)',
              color: 'var(--cream)', fontSize: '3rem', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '0.25rem', margin: '0 auto 1rem',
              boxShadow: '0 8px 30px rgba(61,43,31,0.3)',
              transition: 'all 0.3s',
            }}>
              🎙
            </button>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: audioURL ? '1rem' : '0' }}>
              Tap to start recording
            </p>
          </>
        )}

        {audioURL && status !== STATUS.RECORDING && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--cream)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>Your recording:</p>
            <audio controls src={audioURL} style={{ width: '100%' }} />
          </div>
        )}
      </div>

      {/* EMOTION TAG */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          How does this memory feel?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {emotions.map(e => (
            <button key={e} onClick={() => setEmotionTag(e === emotionTag ? '' : e)} style={{
              padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--parchment)',
              background: emotionTag === e ? 'var(--brown)' : 'var(--warm-white)',
              color: emotionTag === e ? 'var(--cream)' : 'var(--text-muted)',
              fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
            }}>{e}</button>
          ))}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Additional Notes (Optional)
        </label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Any additional context, people involved, places, dates..."
          rows={4}
          style={{
            width: '100%', padding: '0.9rem 1rem', background: 'var(--warm-white)',
            border: '1px solid var(--parchment)', borderRadius: '8px', fontSize: '0.95rem',
            color: 'var(--text)', outline: 'none', resize: 'vertical', lineHeight: 1.7,
          }}
        />
      </div>

      {/* PHOTOS */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📷 Add Photos ({photos.length}/10)
        </label>
        <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
        <button onClick={() => photoInputRef.current.click()} style={{
          background: 'var(--cream)', border: '2px dashed var(--parchment)', borderRadius: '8px',
          padding: '1rem 2rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem',
          width: '100%', transition: 'all 0.2s',
        }}>
          + Choose Photos
        </button>
        {photos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={URL.createObjectURL(p)} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--parchment)' }} />
                <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} style={{
                  position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px',
                  borderRadius: '50%', background: '#dc2626', color: 'white', border: 'none',
                  fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FILES */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📄 Add Documents ({files.length}/5)
        </label>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={handleFileChange} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current.click()} style={{
          background: 'var(--cream)', border: '2px dashed var(--parchment)', borderRadius: '8px',
          padding: '1rem 2rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem',
          width: '100%',
        }}>
          + Attach Documents (PDF, DOC, TXT)
        </button>
        {files.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--warm-white)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--parchment)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>📄 {f.name}</span>
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Status messages */}
      {(status === STATUS.SAVING || status === STATUS.TRANSCRIBING) && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--sepia)', fontStyle: 'italic', marginBottom: '1rem' }}>
          <span className="spinner" style={{ display: 'inline-block', marginRight: '0.5rem' }}>⟳</span>
          {status === STATUS.SAVING ? 'Saving your memory...' : 'Processing...'}
        </div>
      )}
      {status === STATUS.DONE && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#16a34a', fontStyle: 'italic', marginBottom: '1rem', fontSize: '1.1rem' }}>
          ✓ Memory saved! Redirecting...
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={status === STATUS.RECORDING || status === STATUS.SAVING || status === STATUS.DONE}
        style={{
          width: '100%', background: 'var(--brown)', color: 'var(--cream)',
          border: '2px solid var(--amber)', padding: '1.1rem', borderRadius: '8px',
          fontSize: '1.1rem', cursor: 'pointer', fontFamily: "'Playfair Display', serif",
          letterSpacing: '0.05em', transition: 'all 0.2s',
          opacity: (status === STATUS.RECORDING || status === STATUS.SAVING || status === STATUS.DONE) ? 0.6 : 1,
        }}
      >
        ✦ Save This Memory
      </button>
    </div>
  )
}