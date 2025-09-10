import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import GlobalStyle from './styles/GlobalStyle'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketProvider'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <GlobalStyle />
            <App />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)