import React, { createContext, useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token){
      try{ 
        // Verify token is still valid
        jwtDecode(token)
        // Use stored user data if available, otherwise fallback to token decode
        if (userData) {
          setUser(JSON.parse(userData))
        } else {
          setUser(jwtDecode(token))
        }
      } catch { 
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  },[])

  const login = useCallback(async (email, password)=>{
    const { data } = await api.post('/auth/login', { email, password })
    if (data?.token) localStorage.setItem('token', data.token)
    const user = data.user || (data.token ? jwtDecode(data.token) : null)
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
    }
  },[])

  const register = useCallback(async (payload)=>{
    const { data } = await api.post('/auth/register', payload)
    if (data?.token) localStorage.setItem('token', data.token)
    const user = data.user || (data.token ? jwtDecode(data.token) : null)
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
    }
  },[])

  const logout = useCallback(()=>{ 
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null) 
  },[])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}