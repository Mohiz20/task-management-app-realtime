import styled from 'styled-components'
import { useAuth } from '../hooks/useAuth'
import ConnectionBadge from './ConnectionBadge'

const Bar = styled.nav`
  position: sticky; top: 0; z-index: 10; backdrop-filter: blur(8px);
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 16px; background:rgba(11,15,20,.7); border-bottom:1px solid #1f2a36;
`
const Brand = styled.div`font-weight:700; letter-spacing:.2px;`
const Actions = styled.div`display:flex; gap:10px; align-items:center;`
const Btn = styled.button`
  padding:8px 12px; border-radius:12px; border:1px solid #233244; background:#121821; color:#e6eef8;
  box-shadow:0 0 0 0 rgba(98,161,255,.2);
  transform:translateY(0);
  &:hover{ border-color:var(--ring); transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,0,0,.25) }
  &:active{ transform:translateY(0); filter:saturate(1.1) }
  &:focus-visible{ outline:none; box-shadow:0 0 0 3px color-mix(in oklab, var(--primary) 40%, transparent) }
`

export default function Navbar(){
  const { user, logout } = useAuth()
  return (
    <Bar>
      <Brand>Tasks</Brand>
      <Actions>
        <ConnectionBadge />
        {user ? <Btn className="appear" onClick={logout}>Logout</Btn> : null}
      </Actions>
    </Bar>
  )
}