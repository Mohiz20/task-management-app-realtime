import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

const SocketCtx = createContext(null)
export const useSocket = ()=> useContext(SocketCtx)

export function SocketProvider({ children }){
  const [socket, setSocket] = useState(null)
  const [online, setOnline] = useState(false)

  useEffect(()=>{
    const s = io(import.meta.env.VITE_API_BASE_URL.replace('/api',''), {
      transports:['websocket'],
      withCredentials: import.meta.env.VITE_WITH_CREDENTIALS === 'true'
    })
    setSocket(s)
    s.on('connect', ()=> setOnline(true))
    s.on('disconnect', ()=> setOnline(false))
    return ()=> s.disconnect()
  },[])

  const value = useMemo(()=>({ socket, online }), [socket, online])
  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>
}