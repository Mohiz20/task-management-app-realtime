import { useEffect } from 'react'

export default function DeleteConfirmModal({ isOpen, onConfirm, onCancel, taskTitle, isLoading }) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  }

  const modalStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    transform: 'scale(1)',
    animation: 'modalAppear 0.2s ease-out'
  }

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const messageStyle = {
    fontSize: '14px',
    color: 'var(--muted)',
    marginBottom: '20px',
    lineHeight: '1.5'
  }

  const taskTitleStyle = {
    fontWeight: '600',
    color: 'var(--text)',
    padding: '8px 12px',
    background: 'var(--hover)',
    borderRadius: '8px',
    margin: '12px 0',
    fontSize: '14px'
  }

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  }

  const cancelButtonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--text)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }

  const deleteButtonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #ef4444',
    background: '#ef4444',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  }

  return (
    <>
      <style>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes deleteSpinner {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={overlayStyle} onClick={onCancel}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={titleStyle}>
            <span style={{ fontSize: '20px' }}>🗑️</span>
            Delete Task
          </div>
          
          <div style={messageStyle}>
            Are you sure you want to delete this task? This action cannot be undone.
          </div>
          
          {taskTitle && (
            <div style={taskTitleStyle}>
              "{taskTitle}"
            </div>
          )}
          
          <div style={buttonContainerStyle}>
            <button
              style={cancelButtonStyle}
              onClick={onCancel}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.background = 'var(--hover)'
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.target.style.background = 'var(--card)'
              }}
            >
              Cancel
            </button>
            <button
              style={{
                ...deleteButtonStyle,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              onClick={onConfirm}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#dc2626'
                  e.target.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#ef4444'
                  e.target.style.transform = 'translateY(0)'
                }
              }}
            >
              {isLoading && (
                <span style={{ 
                  width: 16, 
                  height: 16, 
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'deleteSpinner 1s linear infinite'
                }} />
              )}
              {isLoading ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
