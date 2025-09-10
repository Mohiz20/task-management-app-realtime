import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import { RequireAuth } from './router'
import { useToast } from './context/ToastContext'

export default function App(){
  const { toast, hideToast } = useToast()

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<RequireAuth><Tasks/></RequireAuth>} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
      <Toast message={toast} onClose={hideToast} />
    </>
  )
}