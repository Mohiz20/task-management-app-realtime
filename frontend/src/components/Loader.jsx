export default function Loader(){
  return (
    <div style={{ padding:16, display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid #2a3c52', borderTopColor:'var(--primary)', display:'inline-block', animation:'spin .7s linear infinite' }} />
      <span style={{ opacity:.8 }}>Loading…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
