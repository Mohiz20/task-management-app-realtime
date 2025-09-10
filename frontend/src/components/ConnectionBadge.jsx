import styled from 'styled-components'
import { useSocket } from '../context/SocketProvider'

const Dot = styled.span`
  width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:6px;
  background:${p=>p.$online? 'var(--success)':'var(--danger)'};
`

export default function ConnectionBadge(){
  const { online } = useSocket()
  return <div style={{fontSize:12,opacity:.8}}><Dot $online={online} />{online? 'Online':'Offline'}</div>
}