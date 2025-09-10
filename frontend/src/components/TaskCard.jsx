import styled from 'styled-components'

// Category color palette
const categoryColors = [
  { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' }, // Blue
  { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' }, // Green
  { bg: '#fff3e0', border: '#ff9800', text: '#ef6c00' }, // Orange
  { bg: '#f3e5f5', border: '#9c27b0', text: '#7b1fa2' }, // Purple
  { bg: '#ffebee', border: '#f44336', text: '#c62828' }, // Red
]

// Function to get color for a category
const getCategoryColor = (category) => {
  if (!category) return categoryColors[0]
  const hash = category.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return categoryColors[Math.abs(hash) % categoryColors.length]
}

const Check = styled.input``
const Title = styled.div`font-weight:600;`
const Meta = styled.div`font-size:12px; color:var(--muted);`
const Tag = styled.span`
  font-size:11px; padding:4px 10px; border-radius:16px; font-weight:600;
  display: inline-flex; align-items: center; white-space: nowrap;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
  }
`
const Actions = styled.div`margin-left:auto; display:flex; gap:8px;`
const Card = styled.div`
background:var(--card); border:1px solid var(--border); border-radius:14px;
padding:12px; display:flex; gap:12px; align-items:flex-start;
transition: transform .2s ease, box-shadow .2s ease;
&:hover{ transform:translateY(-3px); box-shadow:var(--shadow); }
`


const Btn = styled.button`
padding:6px 10px; border-radius:8px; border:1px solid var(--border);
background:var(--card); color:var(--text); opacity:.9; cursor:pointer;
transition: all 0.2s ease;
&:hover{opacity:1; border-color:var(--primary); background:var(--hover); transform:scale(1.05);}
&:active{transform:scale(0.95);}
`

export default function TaskCard({ task, onToggle, onEdit, onDelete, isToggling }){
  // Handle both single category (backward compatibility) and multiple categories
  // Parse comma-separated string into array
  let categories = []
  if (task.categories && Array.isArray(task.categories)) {
    categories = task.categories
  } else if (task.category) {
    // Split comma-separated string and clean up
    categories = task.category.split(',').map(c => c.trim()).filter(Boolean)
  }
  
  return (
    <>
      <Card style={{ opacity: isToggling ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
        <div style={{ position: 'relative' }}>
          <Check 
            type="checkbox" 
            checked={!!task.completed} 
            onChange={()=>onToggle(task)}
            disabled={isToggling}
            style={{ cursor: isToggling ? 'not-allowed' : 'pointer' }}
          />
          {isToggling && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              border: '2px solid transparent',
              borderTop: '2px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>
        <div style={{lineHeight:1.25}}>
          <Title style={{ textDecoration: task.completed? 'line-through':'none', opacity: task.completed? .6:1 }}>{task.title}</Title>
          {task.description? <div style={{ fontSize:14, opacity:.9, marginTop:4 }}>{task.description}</div>:null}
          <Meta style={{ marginTop:8, display:'flex', gap:8, alignItems:'flex-start', flexWrap: 'wrap' }}>
            {categories.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {categories.map((cat, index) => {
                  const categoryColor = getCategoryColor(cat)
                  return (
                    <Tag 
                      key={index}
                      style={{
                        backgroundColor: categoryColor.bg,
                        border: `1px solid ${categoryColor.border}`,
                        color: categoryColor.text,
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        boxShadow: `0 2px 4px ${categoryColor.border}20`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cat}
                    </Tag>
                  )
                })}
              </div>
            )}
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
              {new Date(task.createdAt || Date.now()).toLocaleString()}
            </span>
          </Meta>
        </div>
        <Actions>
          <Btn 
            onClick={()=>onEdit(task)}
            disabled={isToggling}
            style={{ 
              opacity: isToggling ? 0.5 : 1,
              cursor: isToggling ? 'not-allowed' : 'pointer'
            }}
          >
            Edit
          </Btn>
          <Btn 
            onClick={()=>onDelete(task)}
            disabled={isToggling}
            style={{ 
              opacity: isToggling ? 0.5 : 1,
              cursor: isToggling ? 'not-allowed' : 'pointer'
            }}
          >
            Delete
          </Btn>
        </Actions>
      </Card>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}