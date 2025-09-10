export default function EmptyState({ title="No data", subtitle }){
  return (
    <div style={{ padding:24, textAlign:'center', opacity:.8 }}>
      <div style={{ fontWeight:600, marginBottom:6 }}>{title}</div>
      {subtitle? <div style={{ fontSize:14 }}>{subtitle}</div> : null}
    </div>
  )
}