import styled from 'styled-components'

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, #4a9eff 100%);
  color: #08111f;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 2px solid #233244;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(74, 158, 255, 0.4);
    border-color: var(--primary);
  }
`

export default function Avatar({ user }) {
  // Function to get initials from user name
  const getInitials = (name) => {
    if (!name) return '?'
    
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].charAt(0)
    }
    
    // Take first letter of first and last word
    return words[0].charAt(0) + words[words.length - 1].charAt(0)
  }

  const initials = getInitials(user?.name || user?.email)

  return (
    <AvatarContainer title={user?.name || user?.email}>
      {initials}
    </AvatarContainer>
  )
}
