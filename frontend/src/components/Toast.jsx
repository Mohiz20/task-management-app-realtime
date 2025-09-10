import { useEffect, useState } from 'react'

export default function Toast({ message, onClose, duration=3000 }){
  const [show, setShow] = useState(Boolean(message))
  useEffect(()=>{
    if(!message) return; setShow(true)
    const t=setTimeout(()=>{setShow(false); onClose?.()}, duration)
    return ()=>clearTimeout(t)
  },[message])
  if(!show) return null
  return (
    <div style={{ position:'fixed', bottom:14, left:14, right:14, margin:'0 auto', maxWidth:480,
                  background:'#121821', border:'1px solid #233244', padding:12, borderRadius:12,
                  transform:'translateY(8px)', animation:'toastIn .22s ease forwards' }}>
      {message}
      <style>{`@keyframes toastIn{to{transform:translateY(0); opacity:1} from{transform:translateY(8px); opacity:.4}}`}</style>
    </div>
  )
}
