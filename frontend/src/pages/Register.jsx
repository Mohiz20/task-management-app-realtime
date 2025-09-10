import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'

export default function Register(){
  const { register, user } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/tasks', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e){
    e.preventDefault(); setLoading(true)
    try{ 
      await register({ name, email, password }); 
      showToast('Account created!') 
      navigate('/tasks', { replace: true })
    }
    catch(e){ showToast(e?.response?.data?.message || 'Registration failed') }
    finally{ setLoading(false) }
  }

  const inputStyle = { 
    width:'100%', padding:'12px 14px', background:'var(--card)', 
    border:'1px solid var(--border)', borderRadius:12, color:'var(--text)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  }

  return (
    <div style={{ maxWidth:480, margin:'32px auto', padding:'0 16px' }}>
      <h1 style={{ margin:'6px 0 16px', color:'var(--text)' }}>Create account</h1>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:12 }}>
        <input style={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
        <input style={inputStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" />
        <input style={inputStyle} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6)" type="password" minLength={6} />
        <button disabled={loading} style={{ 
          padding:12, borderRadius:12, border:'1px solid var(--border)', 
          background:'var(--primary)', color:'var(--bg)', fontWeight:700,
          transition: 'all 0.2s ease', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}>
          {loading? 'Creating…':'Create account'}
        </button>
      </form>
      <div style={{ marginTop:12, opacity:.8, color:'var(--muted)' }}>
        Have an account? <a href="/login" style={{ color:'var(--primary)' }}>Sign in</a>
      </div>
    </div>
  )
}