import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import Navbar from './components/Navbar'
import { RequireAuth } from './router'

export default function App(){
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
    </>
  )
}