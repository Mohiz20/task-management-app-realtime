import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

export function RequireAuth({ children }){
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}