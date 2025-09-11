import { useEffect, useState } from 'react'
import useAxios from '../hooks/useAxios'

// Category color palette (same as TaskCard)
const categoryColors = [
  { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' }, // Blue
  { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' }, // Green
  { bg: '#fff3e0', border: '#ff9800', text: '#ef6c00' }, // Orange
  { bg: '#f3e5f5', border: '#9c27b0', text: '#7b1fa2' }, // Purple
  { bg: '#ffebee', border: '#f44336', text: '#c62828' }, // Red
]

const getCategoryColor = (category) => {
  if (!category) return categoryColors[0]
  const hash = category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return categoryColors[Math.abs(hash) % categoryColors.length]
}

export default function TaskForm({ onSubmit, onCancel, initial, isLoading }){
  const { request } = useAxios()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categories, setCategories] = useState([])
  const [categoryInput, setCategoryInput] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [aiContext, setAiContext] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [suggestedSubtasks, setSuggestedSubtasks] = useState([])

  useEffect(()=>{
    if(initial){
      setTitle(initial.title || '')
      setDescription(initial.description || '')
      setPriority(initial.priority || 'MEDIUM')
      setDueDate(initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 16) : '')
      setEstimatedMinutes(initial.estimatedMinutes || '')
      // Parse categories from string (backward compatibility)
      let cats = []
      if (initial.categories && Array.isArray(initial.categories)) {
        cats = initial.categories
      } else if (initial.category) {
        // Split comma-separated string and clean up
        cats = initial.category.split(',').map(c => c.trim()).filter(Boolean)
      }
      setCategories(cats)
      setCategoryInput('')
    }
  },[initial])

  function handleCategoryKeyDown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      const newCategory = categoryInput.trim()
      if (newCategory && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory])
      }
      setCategoryInput('')
    } else if (e.key === 'Backspace' && !categoryInput && categories.length > 0) {
      // Remove last category if input is empty and backspace is pressed
      setCategories(categories.slice(0, -1))
    }
  }

  function removeCategory(categoryToRemove) {
    setCategories(categories.filter(cat => cat !== categoryToRemove))
  }

  async function handleAISuggest() {
    if (isAiLoading || !aiContext.trim()) return;
    
    setIsAiLoading(true);
    try {
      const { data: suggestion } = await request({
        method: 'POST',
        url: '/ai/suggest-task',
        data: { context: aiContext }
      });
      
      // Apply AI suggestions to form fields
      if (suggestion.title && !title) {
        setTitle(suggestion.title);
      }
      if (suggestion.description && !description) {
        setDescription(suggestion.description);
      }
      if (suggestion.category && categories.length === 0) {
        setCategories([suggestion.category]);
      }
      if (suggestion.priority) {
        setPriority(suggestion.priority);
      }
      if (suggestion.estimatedMinutes && !estimatedMinutes) {
        setEstimatedMinutes(suggestion.estimatedMinutes.toString());
      }
      if (suggestion.dueDate && !dueDate) {
        // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:MM)
        const date = new Date(suggestion.dueDate);
        const localDatetime = date.toISOString().slice(0, 16);
        setDueDate(localDatetime);
      }
      if (suggestion.subtasks && suggestion.subtasks.length > 0) {
        setSuggestedSubtasks(suggestion.subtasks);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      // You could add toast notification here
      alert(error?.response?.data?.message || error.message || 'AI suggestion failed');
    } finally {
      setIsAiLoading(false);
    }
  }

  function handleSubmit(e){
    e.preventDefault()
    if(!title.trim() || isLoading) return
    // Add any remaining category input
    const finalCategories = [...categories]
    if (categoryInput.trim() && !finalCategories.includes(categoryInput.trim())) {
      finalCategories.push(categoryInput.trim())
    }
    onSubmit({ 
      title: title.trim(), 
      description: description.trim(), 
      categories: finalCategories,
      // Keep backward compatibility
      category: finalCategories.join(', '),
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null
    })
  }

const inputStyle = { 
  width:'100%', padding:'10px 12px', background:'var(--card)', 
  border:'1px solid var(--border)', borderRadius:12, color:'var(--text)',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
}
const primaryBtn = { 
  flex:1, padding:12, borderRadius:12, border:'1px solid var(--ring)', 
  background:'var(--primary)', color:'var(--bg)', fontWeight:700, 
  boxShadow:'0 10px 20px color-mix(in srgb, var(--primary) 15%, transparent)',
  transition: 'all 0.2s ease', cursor: 'pointer'
}
const ghostBtn = { 
  padding:12, borderRadius:12, border:'1px solid var(--border)', 
  background:'var(--card)', color:'var(--text)',
  transition: 'all 0.2s ease', cursor: 'pointer'
}

return (
    <form onSubmit={handleSubmit} style={{ display:'grid', gap:10 }}>
      {/* AI Suggestion Section */}
      {!initial && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 8
        }}>
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            alignItems: 'flex-end',
            marginBottom: 6
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                fontSize: '12px', 
                color: 'white', 
                marginBottom: 4, 
                display: 'block',
                opacity: 0.9
              }}>
                ✨ AI Task Helper (Optional)
              </label>
              <input
                style={{
                  ...inputStyle,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  opacity: isAiLoading ? 0.6 : 1
                }}
                placeholder="Describe your task with timeline... e.g., 'Fix payment bug by Friday', 'Build user auth system (should take 2 hours)'"
                value={aiContext}
                onChange={e => setAiContext(e.target.value)}
                disabled={isLoading || isAiLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={isLoading || isAiLoading || !aiContext.trim()}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: (isLoading || isAiLoading || !aiContext.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || isAiLoading || !aiContext.trim()) ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap'
              }}
            >
              {isAiLoading ? (
                <>
                  <span style={{ 
                    width: 14, 
                    height: 14, 
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Thinking...
                </>
              ) : (
                <>🚀 Suggest</>
              )}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
            AI will suggest title, priority, category, estimated time, due date (if mentioned), and subtasks
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
            Note: Unfortunately, this feature is currenlty available offline due to limited time constraint
          </div>
        </div>
      )}
      
      <input 
        style={{...inputStyle, opacity: isLoading ? 0.6 : 1}} 
        placeholder="Task title*" 
        value={title} 
        onChange={e=>setTitle(e.target.value)}
        disabled={isLoading}
      />
      <textarea 
        style={{...inputStyle, minHeight:88, opacity: isLoading ? 0.6 : 1}} 
        placeholder="Description" 
        value={description} 
        onChange={e=>setDescription(e.target.value)}
        disabled={isLoading}
      />
      
      {/* Categories Section */}
      <div>
        <div style={{ 
          ...inputStyle, 
          minHeight: 40,
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 6, 
          alignItems: 'center',
          padding: '8px 12px',
          opacity: isLoading ? 0.6 : 1
        }}>
          {/* Existing category tags */}
          {categories.map((cat, index) => {
            const color = getCategoryColor(cat)
            return (
              <span
                key={index}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 500
                }}
              >
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: color.text,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    padding: 0,
                    lineHeight: 1,
                    opacity: isLoading ? 0.5 : 1
                  }}
                >
                  ×
                </button>
              </span>
            )
          })}
          
          {/* Category input */}
          <input
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              color: 'var(--text)',
              flex: 1,
              minWidth: 120,
              fontSize: '14px'
            }}
            placeholder={categories.length === 0 ? "Add categories (press space to add)" : "Add more..."}
            value={categoryInput}
            onChange={e => setCategoryInput(e.target.value)}
            onKeyDown={handleCategoryKeyDown}
            disabled={isLoading}
          />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 4 }}>
          Press space or enter to add a category. Backspace to remove the last one.
        </div>
      </div>

      {/* Priority and Due Date Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
            Priority
          </label>
          <select
            style={{...inputStyle, opacity: isLoading ? 0.6 : 1}}
            value={priority}
            onChange={e => setPriority(e.target.value)}
            disabled={isLoading}
          >
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🔴 High</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
            Due Date
          </label>
          <input
            type="datetime-local"
            style={{...inputStyle, opacity: isLoading ? 0.6 : 1}}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Estimated Time */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
          Estimated Time (minutes)
        </label>
        <input
          type="number"
          min="1"
          step="1"
          style={{...inputStyle, opacity: isLoading ? 0.6 : 1}}
          placeholder="e.g. 30, 60, 120"
          value={estimatedMinutes}
          onChange={e => setEstimatedMinutes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* AI Suggested Tasks */}
      {suggestedSubtasks.length > 0 && (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 12
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--muted)', 
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>🤖</span>
            AI Suggested Sub-Tasks
            <button
              type="button"
              onClick={() => setSuggestedSubtasks([])}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕ Clear
            </button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {suggestedSubtasks.map((subtask, index) => (
              <div
                key={index}
                style={{
                  fontSize: '13px',
                  padding: '8px 12px',
                  background: 'var(--hover)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span style={{ opacity: 0.7 }}>•</span>
                {subtask}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 8 }}>
            These are suggestions from AI. You can include them in your task description or create separate tasks for each.
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:8 }}>
        <button 
          type="submit" 
          style={{
            ...primaryBtn,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }} 
          className="button"
          disabled={isLoading}
        >
          {isLoading && (
            <span style={{ 
              width: 16, 
              height: 16, 
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          style={{
            ...ghostBtn,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }} 
          className="button"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}