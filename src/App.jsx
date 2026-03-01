import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RecordMemory from './pages/RecordMemory'
import MemoryViewer from './pages/MemoryViewer'
import MemoryDetail from './pages/MemoryDetail'
import Chatbot from './pages/Chatbot'
import Navbar from './components/Navbar'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'center',
      height:'100vh',background:'var(--cream)',
      fontFamily:"'Playfair Display', serif",color:'var(--sepia)',fontSize:'1.5rem'
    }}>
      ✦ Loading your memories...
    </div>
  )

  return (
    <>
      {user && <Navbar user={user} />}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/record" element={user ? <RecordMemory user={user} /> : <Navigate to="/login" />} />
        <Route path="/memories" element={user ? <MemoryViewer user={user} /> : <Navigate to="/login" />} />
        <Route path="/memories/:id" element={user ? <MemoryDetail user={user} /> : <Navigate to="/login" />} />
        <Route path="/chatbot" element={user ? <Chatbot user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </>
  )
}
