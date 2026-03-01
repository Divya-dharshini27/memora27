import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

// ─── Typing indicator dots ───────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--sepia)',
          animation: `typingBounce 1.2s ease infinite`,
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Single memory card shown inside chat ────────────────────────────────────
function MemoryCard({ memory }) {
  const emotionColors = {
    happy: '#d4a017', sad: '#6b88a8', nostalgic: '#8b6914',
    proud: '#7a5c44', peaceful: '#5c7a6b', grateful: '#8b7355',
    excited: '#a06030', bittersweet: '#8b6b8b',
  }
  return (
    <Link to={`/memories/${memory.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderLeft: `4px solid ${emotionColors[memory.emotion_tag] || 'var(--amber)'}`,
        borderRadius: '10px', padding: '0.9rem 1rem', marginTop: '0.5rem',
        cursor: 'pointer', transition: 'box-shadow 0.2s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <strong style={{ color: 'var(--brown)', fontSize: '0.9rem', lineHeight: 1.4, flex: 1 }}>
            {memory.title || 'Untitled Memory'}
          </strong>
          {memory.emotion_tag && (
            <span style={{
              background: emotionColors[memory.emotion_tag] || 'var(--sepia)',
              color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.5rem',
              borderRadius: '20px', marginLeft: '0.5rem', whiteSpace: 'nowrap',
            }}>{memory.emotion_tag}</span>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
          {format(new Date(memory.created_at), 'MMMM d, yyyy')}
          {memory.has_audio && ' · 🎙'}{memory.has_photos && ' · 📷'}{memory.has_files && ' · 📄'}
        </p>
        {memory.description && (
          <p style={{ color: 'var(--text)', fontSize: '0.82rem', marginTop: '0.4rem', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {memory.description}
          </p>
        )}
        <span style={{ color: 'var(--sepia)', fontSize: '0.75rem', display: 'block', marginTop: '0.4rem' }}>
          Tap to view full memory →
        </span>
      </div>
    </Link>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      gap: '0.6rem', alignItems: 'flex-end',
      animation: 'fadeIn 0.3s ease',
    }}>
      {!isUser && (
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--brown)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1rem', border: '2px solid var(--amber)',
        }}>📖</div>
      )}

      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {!isUser && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '2px', fontStyle: 'italic' }}>
            Memory Companion
          </span>
        )}

        <div style={{
          padding: '0.8rem 1.1rem',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'var(--brown)' : 'var(--cream)',
          color: isUser ? 'var(--cream)' : 'var(--text)',
          border: !isUser ? '1px solid var(--parchment)' : 'none',
          fontSize: '0.9rem', lineHeight: 1.7,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          {msg.text && msg.text.split("\n").map((line, i) => (
            <span key={i} style={{ display: 'block', minHeight: line === '' ? '0.5rem' : 'auto' }}>
              {line}
            </span>
          ))}
        </div>

        {msg.memories && msg.memories.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {msg.memories.map(m => <MemoryCard key={m.id} memory={m} />)}
          </div>
        )}

        <span style={{
          fontSize: '0.68rem', color: 'var(--text-muted)',
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          marginTop: '-0.2rem',
        }}>
          {format(new Date(msg.time || Date.now()), 'h:mm a')}
        </span>
      </div>

      {isUser && (
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--amber)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1rem', border: '2px solid var(--sepia)',
        }}>🧑</div>
      )}
    </div>
  )
}

// ─── Main Chatbot page ────────────────────────────────────────────────────────
export default function Chatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      time: Date.now(),
      text: "Hello! I'm your Memory Companion. 🌿\n\nI can help you reflect on your journey. Try asking me:\n• \"What did I write yesterday?\"\n• \"Show me memories from Oct 5th 2023\"\n• \"Find my happy memories\"\n• \"What was I doing in 2024?\""
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const fetchAllMemories = async () => {
    const { data } = await supabase
      .from('memories')
      .select('id, title, description, emotion_tag, has_audio, has_photos, has_files, created_at, transcript')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    return data || []
  }

  // ── Search memories with filters ─────────────────────────────────────────
  const searchMemories = async (filters) => {
    let query = supabase
      .from('memories')
      .select('id, title, description, emotion_tag, has_audio, has_photos, has_files, created_at, transcript')
      .eq('user_id', user.id)

    if (filters.emotion) query = query.eq('emotion_tag', filters.emotion)

    if (filters.keyword) {
      query = query.or(
        `title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,transcript.ilike.%${filters.keyword}%`
      )
    }

    // Advanced Smart Date Logic
    if (filters.parsedDate) {
      const { y, m, d } = filters.parsedDate;
      
      if (y !== undefined && m !== undefined && d !== undefined) {
        // Specific Day
        const start = new Date(y, m, d, 0, 0, 0, 0);
        const end = new Date(y, m, d, 23, 59, 59, 999);
        query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      } else if (y !== undefined && m !== undefined) {
        // Entire Month
        const start = new Date(y, m, 1, 0, 0, 0, 0);
        const end = new Date(y, m + 1, 1, 0, 0, 0, 0); // JS automatically handles December wrap-around
        query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString());
      } else if (y !== undefined) {
        // Entire Year
        const start = new Date(y, 0, 1, 0, 0, 0, 0);
        const end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
        query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString());
      }
    }

    if (filters.hasAudio) query = query.eq('has_audio', true)
    if (filters.hasPhotos) query = query.eq('has_photos', true)

    const queryLimit = filters.recent ? 5 : 50; 
    const { data } = await query.order('created_at', { ascending: false }).limit(queryLimit)
    return data || []
  }

  // ── Parse what the user is asking ────────────────────────────────────────
  const parseIntent = (text) => {
    const lower = text.toLowerCase()
    const filters = {}

    // 1. Chitchat & Greetings
    if (lower.match(/\b(how are you|how's it going|how have you been|how are things)\b/)) {
      return { type: 'chitchat', text: "I'm doing wonderfully, thank you for asking! 😊 I'm right here and ready to help you explore your journal. What would you like to find?" }
    }
    if (lower.match(/\b(who are you|what are you)\b/)) {
      return { type: 'chitchat', text: "I'm your Memory Companion. 🌿 I help you securely store and look back on the moments that matter to you." }
    }
    if (lower.match(/\b(hello|hi|hey|good morning|good evening|howdy)\b/) && lower.split(' ').length < 5) return { type: 'greeting' }
    if (lower.match(/\b(how many|count|total|statistics|stats)\b/)) return { type: 'stats' }
    if (lower.match(/\b(help|what can you do|what do you do)\b/)) return { type: 'help' }

    // 2. Emotions
    const emotions = ['happy', 'sad', 'nostalgic', 'proud', 'peaceful', 'grateful', 'excited', 'bittersweet']
    const foundEmotion = emotions.find(e => lower.includes(e))
    if (foundEmotion) filters.emotion = foundEmotion

    // 3. Advanced Date Parsing
    const today = new Date();
    let dateFilters = {};
    const shortMonths = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const fullMonths = ['january','february','march','april','may','june','july','august','september','october','november','december'];

    const isoMatch = lower.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    
    if (isoMatch) {
      dateFilters = { y: parseInt(isoMatch[1]), m: parseInt(isoMatch[2]) - 1, d: parseInt(isoMatch[3]) };
    } else if (lower.includes('today')) {
      dateFilters = { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() };
    } else if (lower.includes('yesterday')) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      dateFilters = { y: yesterday.getFullYear(), m: yesterday.getMonth(), d: yesterday.getDate() };
    } else {
      // Find Year
      const yearMatch = lower.match(/\b(20\d{2})\b/);
      let y = yearMatch ? parseInt(yearMatch[1]) : undefined;

      // Find Month
      let m = undefined;
      for (let i = 0; i < 12; i++) {
        if (lower.includes(fullMonths[i]) || lower.match(new RegExp(`\\b${shortMonths[i]}\\b`))) {
          m = i;
          break;
        }
      }

      // Find Day (Checks for both "Oct 5" and "5th Oct")
      let d = undefined;
      if (m !== undefined) {
        const dmMatch = lower.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(?:${fullMonths.join('|')}|${shortMonths.join('|')})\\b`, 'i'));
        const mdMatch = lower.match(new RegExp(`(?:${fullMonths.join('|')}|${shortMonths.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i'));
        
        if (dmMatch) d = parseInt(dmMatch[1]);
        else if (mdMatch) d = parseInt(mdMatch[1]);
      }

      // If month is found but no year, assume current year
      if (y !== undefined || m !== undefined) {
        if (m !== undefined && y === undefined) y = today.getFullYear();
        dateFilters = { y, m, d };
      }
    }

    if (Object.keys(dateFilters).length > 0) {
      filters.parsedDate = dateFilters;
    }

    // 4. Media & Recency
    if (lower.includes('audio') || lower.includes('voice') || lower.includes('recording')) filters.hasAudio = true
    if (lower.includes('photo') || lower.includes('picture') || lower.includes('image')) filters.hasPhotos = true
    if (lower.includes('recent') || lower.includes('latest') || lower.includes('last')) filters.recent = true

    // 5. Extract keywords (Make sure we don't treat dates as text keywords)
    const stopWords = /\b(show|me|my|memories|memory|find|what|when|about|the|a|an|and|or|with|from|i|have|all|some|any|please|can|you|tell|do|did|get|give|list|where|which|who|how|are|is|was|were|in|on|at|for|of|to|by|be|been|has|had)\b/gi;
    const stripped = text
      .replace(stopWords, ' ')
      .replace(/\b(20\d{2})\b/g, '') // Remove year from keyword
      .replace(new RegExp(`\\b(${fullMonths.join('|')}|${shortMonths.join('|')})\\b`, 'gi'), '') // Remove month from keyword
      .replace(/\s+/g, ' ')
      .trim();
    
    if (stripped.length > 2 && !filters.emotion && !filters.parsedDate) {
      filters.keyword = stripped;
    }

    if (Object.keys(filters).length === 0) {
      return { type: 'unknown' }
    }

    return { type: 'search', filters }
  }

  // ── Generate a warm, human-like reply ────────────────────────────────────
  const generateReply = async (userMsg, allMemories) => {
    const intent = parseIntent(userMsg)

    if (intent.type === 'greeting') {
      const hour = new Date().getHours()
      const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
      return { text: `${timeGreeting}! 😊\n\nIt's always nice when you stop by. You have ${allMemories.length} memories tucked away safely. What chapters of your life should we look at today?`, memories: [] }
    }

    if (intent.type === 'help') {
      return { text: "I'd love to help! Think of me as your personal archivist.\n\nYou can ask me things like:\n\n📅 \"What did I write yesterday?\"\n✨ \"Show me memories from October 5th 2023\"\n💛 \"Find my happy memories\"\n🔍 \"What did I record in 2024?\"\n\nWhat feels right for today?", memories: [] }
    }

    if (intent.type === 'stats') {
      return { text: `You've entrusted me with ${allMemories.length} memories so far. Every single one matters. 🌿\n\nWould you like me to pull up your most recent ones?`, memories: [] }
    }

    if (intent.type === 'chitchat') {
      return { text: intent.text, memories: [] }
    }

    if (intent.type === 'unknown') {
      return { text: "I'm not quite sure what to search for based on that. 🌿 Could you try asking for a specific month (like 'February'), an emotion ('happy'), or a year ('2023')?", memories: [] }
    }

    const results = await searchMemories(intent.filters)

    const conversationalOpeners = [
      "Oh, I loved looking through these.",
      "Let's take a little walk down memory lane.",
      "Ah, here's what I gently dusted off for you.",
      "I found some moments I think you'll want to see."
    ]
    const randomOpener = conversationalOpeners[Math.floor(Math.random() * conversationalOpeners.length)]

    if (results.length === 0) {
      let suggestion = "I carefully leafed through your journal, but I couldn't find anything matching that. Maybe try phrasing it a bit differently?"
      if (intent.filters?.parsedDate) suggestion = `I checked that specific time period, but it looks like you didn't record anything then. Every day doesn't need a memory, though! 🌿`
      if (intent.filters?.emotion) suggestion = `I don't see any moments tagged as "${intent.filters.emotion}" just yet. But feelings change, and there's always tomorrow!`
      
      return { text: suggestion, memories: [] }
    }

    let intro = ''
    if (intent.filters?.parsedDate) {
      const { y, m, d } = intent.filters.parsedDate;
      if (d !== undefined && m !== undefined) {
        const dateStr = format(new Date(y, m, d), 'MMMM do, yyyy');
        intro = `${randomOpener} Here is exactly what you experienced on ${dateStr}:`;
      } else if (m !== undefined) {
        const monthName = ['January','February','March','April','May','June','July','August','September','October','November','December'][m];
        intro = `Ah, ${monthName} ${y}. Here is what you captured during that time:`;
      } else if (y !== undefined) {
        intro = `Looking back at ${y}... Here are your memories from that year:`;
      }
    } else if (intent.filters?.emotion) {
      intro = `${randomOpener} These are the moments that made you feel ${intent.filters.emotion}. Hold on to these. 💛`
    } else if (intent.filters?.keyword) {
      intro = `I searched your thoughts for "${intent.filters.keyword}" and found these treasures:`
    } else {
      intro = `${randomOpener} Here's what I found for you:`
    }

    return { text: intro, memories: results }
  }

  // ── Handle send ───────────────────────────────────────────────────────────
  const handleSend = async (overrideText) => {
    const text = overrideText || input.trim()
    if (!text || loading) return
    setInput('')
    inputRef.current?.focus()

    const userMessage = { role: 'user', text, time: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setIsTyping(true)

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 800))

    try {
      const allMemories = await fetchAllMemories()
      const reply = await generateReply(text, allMemories)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: reply.text,
        memories: reply.memories,
        time: Date.now(),
      }])
    } catch (err) {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Oh no, my pages got a little stuck. 📖 Let's try that one more time.",
        memories: [],
        time: Date.now(),
      }])
    }
    setLoading(false)
  }

  const suggestedPrompts = [
    "What did I do yesterday?",
    "Show my happy memories 😊",
    "Show memories from 2024",
    "How many memories do I have?",
  ]

  return (
    <div style={{
      maxWidth: '720px', margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      padding: '1.5rem 1.5rem 1rem',
      animation: 'fadeIn 0.5s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        marginBottom: '1rem', paddingBottom: '1rem',
        borderBottom: '1px solid var(--parchment)',
      }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: 'var(--brown)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.4rem',
          border: '2px solid var(--amber)', flexShrink: 0,
        }}>📖</div>
        <div>
          <h1 style={{ fontSize: '1.2rem', color: 'var(--brown)', margin: 0 }}>
            Memory Companion
          </h1>
          <span style={{ fontSize: '0.78rem', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
            Always here for you
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex',
        flexDirection: 'column', gap: '1rem',
        paddingRight: '4px',
      }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'var(--brown)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1rem', border: '2px solid var(--amber)', flexShrink: 0,
            }}>📖</div>
            <div style={{
              background: 'var(--cream)', border: '1px solid var(--parchment)',
              borderRadius: '18px 18px 18px 4px', padding: '0.8rem 1.1rem',
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
        padding: '0.75rem 0 0.5rem',
        borderTop: '1px solid var(--parchment)',
        marginTop: '0.5rem',
      }}>
        {suggestedPrompts.map(p => (
          <button
            key={p}
            onClick={() => handleSend(p.replace(/ [\u{1F300}-\u{1F9FF}]/gu, '').trim())}
            disabled={loading}
            style={{
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              color: 'var(--text-muted)', padding: '0.35rem 0.85rem',
              borderRadius: '20px', fontSize: '0.78rem', cursor: 'pointer',
              transition: 'all 0.15s', opacity: loading ? 0.5 : 1,
            }}
          >{p}</button>
        ))}
      </div>

      <div style={{
        display: 'flex', gap: '0.6rem', alignItems: 'center',
        background: 'var(--warm-white)', border: '1.5px solid var(--parchment)',
        borderRadius: '50px', padding: '0.4rem 0.4rem 0.4rem 1.2rem',
        boxShadow: '0 2px 12px var(--shadow)',
        marginTop: '0.4rem',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about your memories..."
          disabled={loading}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: '0.95rem', color: 'var(--text)', outline: 'none',
            fontFamily: "'Lora', Georgia, serif",
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: input.trim() && !loading ? 'var(--brown)' : 'var(--parchment)',
            border: 'none', color: input.trim() && !loading ? 'var(--cream)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            fontSize: '1.1rem', transition: 'all 0.2s', flexShrink: 0,
          }}
        >→</button>
      </div>
    </div>
  )
}