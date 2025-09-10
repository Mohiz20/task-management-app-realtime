import styled from 'styled-components'

const Check = styled.input``
const Title = styled.div`font-weight:600;`
const Meta = styled.div`font-size:12px; color:var(--muted);`
const Tag = styled.span`
  font-size:10px; padding:4px 8px; border:1px solid #2a3c52; border-radius:999px; opacity:.9
`
const Actions = styled.div`margin-left:auto; display:flex; gap:8px;`
const Card = styled.div`
background:var(--card); border:1px solid #1f2a36; border-radius:14px;
padding:12px; display:flex; gap:12px; align-items:flex-start;
transition: transform .2s ease, box-shadow .2s ease;
&:hover{ transform:translateY(-3px); box-shadow:0 4px 12px rgba(0,0,0,.4); }
`


const Btn = styled.button`
padding:6px 10px; border-radius:8px; border:1px solid #233244;
background:#0b0f14; color:#e6eef8; opacity:.9; cursor:pointer;
&:hover{opacity:1; border-color:var(--primary); background:#1b2532; transform:scale(1.05);}
&:active{transform:scale(0.95);}
`

export default function TaskCard({ task, onToggle, onEdit, onDelete }){
  return (
    <Card>
      <Check type="checkbox" checked={!!task.completed} onChange={()=>onToggle(task)} />
      <div style={{lineHeight:1.25}}>
        <Title style={{ textDecoration: task.completed? 'line-through':'none', opacity: task.completed? .6:1 }}>{task.title}</Title>
        {task.description? <div style={{ fontSize:14, opacity:.9, marginTop:4 }}>{task.description}</div>:null}
        <Meta style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
          {task.category? <Tag>{task.category}</Tag>:null}
          <span>{new Date(task.createdAt || Date.now()).toLocaleString()}</span>
        </Meta>
      </div>
      <Actions>
        <Btn onClick={()=>onEdit(task)}>Edit</Btn>
        <Btn onClick={()=>onDelete(task)}>Delete</Btn>
      </Actions>
    </Card>
  )
}