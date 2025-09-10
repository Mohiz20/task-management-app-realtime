import React, { createContext, useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (token){
      try{ setUser(jwtDecode(token)) }catch{ localStorage.removeItem('token') }
    }
    setLoading(false)
  },[])

  const login = useCallback(async (email, password)=>{I see the user has reverted the setTimeout changes. You're absolutely right - we need a proper solution. The best approach is to create a global toast context that persists across navigation. Let me implement this:


    const { data } = await api.post('/auth/login', { email, password })
    if (data?.token) localStorage.setItem('token', data.token)
    setUser(data.user || (data.token ? jwtDecode(data.token) : null))
  },[])

  const register = useCallback(async (payload)=>{
    const { data } = await api.post('/auth/register', payload)
    if (data?.token) localStorage.setItem('token', data.token)
    setUser(data.user || (data.token ? jwtDecode(data.token) : null))
  },[])

  const logout = useCallback(()=>{ localStorage.removeItem('token'); setUser(null) },[])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}