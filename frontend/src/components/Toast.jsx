import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 3000 }){
  const [show, setShow] = useState(Boolean(message))
  
  useEffect(()=>{
    if(!message) return; setShow(true)
    const t=setTimeout(()=>{setShow(false); onClose?.()}, duration)
    return ()=>clearTimeout(t)
  },[message])
  
  if(!show) return null

  // Toast type configurations
  const toastTypes = {
    success: {
      icon: '✅',
      background: '#dcfce7',
      borderColor: '#16a34a',
      textColor: '#166534',
      iconColor: '#16a34a'
    },
    error: {
      icon: '❌',
      background: '#fef2f2',
      borderColor: '#dc2626',
      textColor: '#991b1b',
      iconColor: '#dc2626'
    },
    warning: {
      icon: '⚠️',
      background: '#fefce8',
      borderColor: '#ca8a04',
      textColor: '#92400e',
      iconColor: '#ca8a04'
    },
    info: {
      icon: 'ℹ️',
      background: 'var(--card)',
      borderColor: 'var(--border)',
      textColor: 'var(--text)',
      iconColor: 'var(--primary)'
    }
  }

  const config = toastTypes[type] || toastTypes.info

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      maxWidth: 400,
      background: config.background,
      border: `1px solid ${config.borderColor}`,
      borderRadius: 12,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)',
      transform: 'translateX(8px)',
      animation: 'toastSlideIn 0.3s ease forwards',
      zIndex: 1000,
      minWidth: 300
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16
      }}>
        {/* Icon */}
        <div style={{
          fontSize: 18,
          lineHeight: 1,
          flexShrink: 0,
          marginTop: 1
        }}>
          {config.icon}
        </div>
        
        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            color: config.textColor,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.4,
            marginBottom: type === 'info' ? 0 : 4
          }}>
            {message}
          </div>
          
          {type !== 'info' && (
            <div style={{
              fontSize: 12,
              color: config.textColor,
              opacity: 0.7,
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: 0.5
            }}>
              {type}
            </div>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={() => { setShow(false); onClose?.() }}
          style={{
            background: 'none',
            border: 'none',
            color: config.textColor,
            cursor: 'pointer',
            fontSize: 16,
            padding: 4,
            borderRadius: 4,
            opacity: 0.6,
            transition: 'opacity 0.2s ease',
            lineHeight: 1,
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.6}
        >
          ✕
        </button>
      </div>
      
      {/* Progress bar */}
      <div style={{
        height: 3,
        background: `${config.borderColor}20`,
        borderRadius: '0 0 12px 12px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: config.borderColor,
          animation: `toastProgress ${duration}ms linear forwards`,
          transformOrigin: 'left'
        }} />
      </div>
      
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes toastProgress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  )
}
