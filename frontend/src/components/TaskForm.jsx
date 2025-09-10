import { useEffect, useState } from 'react'

export default function TaskForm({ onSubmit, onCancel, initial }){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  useEffect(()=>{
    if(initial){
      setTitle(initial.title || '')
      setDescription(initial.description || '')
      setCategory(initial.category || '')
    }
  },[initial])

  function handleSubmit(e){
    e.preventDefault()
    if(!title.trim()) return
    onSubmit({ title: title.trim(), description: description.trim(), category: category.trim() })
  }

const inputStyle = { width:'100%', padding:'10px 12px', background:'#0b0f14', border:'1px solid #233244', borderRadius:12, color:'var(--text)' }
const primaryBtn = { flex:1, padding:12, borderRadius:12, border:'1px solid var(--ring)', background:'var(--primary)', color:'#08111f', fontWeight:700, boxShadow:'0 10px 20px rgba(98,161,255,.15)' }
const ghostBtn = { padding:12, borderRadius:12, border:'1px solid #233244', background:'#121821', color:'var(--text)' }

return (
    <form onSubmit={handleSubmit} style={{ display:'grid', gap:10 }}>
      <input style={inputStyle} placeholder="Task title*" value={title} onChange={e=>setTitle(e.target.value)} />
      <textarea style={{...inputStyle, minHeight:88}} placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      <input style={inputStyle} placeholder="Category (Work, Personal, Urgent)" value={category} onChange={e=>setCategory(e.target.value)} />
      <div style={{ display:'flex', gap:8 }}>
        <button type="submit" style={primaryBtn} className="button">Save</button>
  <button type="button" onClick={onCancel} style={ghostBtn} className="button">Cancel</button>
</div>
    </form>
  )
}