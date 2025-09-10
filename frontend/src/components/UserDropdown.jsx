import styled from 'styled-components'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'

const Container = styled.div`
  position: relative;
  display: inline-block;
`

const Menu = styled.div`
  position: ${props => props.isMobile ? 'fixed' : 'absolute'};
  ${props => props.isMobile ? 'bottom: 16px; left: 16px; right: 16px;' : 'top: calc(100% + 8px); right: 0; min-width: 280px;'}
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(8px);
  z-index: ${props => props.isMobile ? 1001 : 1000};
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : (props.isMobile ? '100%' : '-8px')});
  transition: all 0.2s ease;
  ${props => props.isMobile ? 'max-height: 70vh; overflow-y: auto;' : ''}
`

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border);
`

const Name = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: var(--text);
  margin-bottom: 4px;
`

const Email = styled.div`
  font-size: 14px;
  color: var(--muted);
  opacity: 0.8;
`

const Actions = styled.div`
  padding: 8px;
`

const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text);
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;

  &:hover { background: var(--hover); color: var(--primary); }
  &.logout { color: var(--danger); &:hover { background: rgba(239,68,68,0.1); } }
  
  @media (max-width: 768px) {
    padding: 16px;
    font-size: 16px;
    min-height: 48px;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,${props => props.isMobile ? 0.5 : 0.3});
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
  backdrop-filter: blur(2px);
`

export default function UserDropdown({ user, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { showToast } = useToast()
  const ref = useRef(null)
  const mobileMenuRef = useRef(null)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    const handleClickOutside = (e) => {
      const isClickOutside = ref.current && !ref.current.contains(e.target) &&
                            (!mobileMenuRef.current || !mobileMenuRef.current.contains(e.target))
      if (isClickOutside) setIsOpen(false)
    }
    const handleEscape = (e) => e.key === 'Escape' && setIsOpen(false)

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = isMobile ? 'hidden' : 'unset'
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isMobile])

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully')
    setIsOpen(false)
  }

  const content = (
    <Menu isOpen={isOpen} isMobile={isMobile} ref={isMobile ? mobileMenuRef : null}>
      <Header>
        <Name>{user?.name || 'Unknown User'}</Name>
        <Email>{user?.email || 'No email'}</Email>
      </Header>
      <Actions>
        <Button onClick={toggle}>
          {theme==='dark'? '☀️ Light' : '🌙 Dark'}
        </Button>
        <Button className="logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </Button>
      </Actions>
    </Menu>
  )

  return (
    <>
      <Overlay isOpen={isOpen} isMobile={isMobile} onClick={() => setIsOpen(false)} />
      <Container ref={ref}>
        <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
        {!isMobile && content}
      </Container>
      {isMobile && isOpen && createPortal(content, document.body)}
    </>
  )
}
