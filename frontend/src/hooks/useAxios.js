import { useState, useCallback } from 'react'
import api from '../api/client'

export default function useAxios(){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (config)=>{
    setLoading(true); setError(null)
    try{ const res = await api.request(config); return res }
    catch(err){ setError(err?.response?.data?.message || err.message); throw err }
    finally{ setLoading(false) }
  },[])

  return { request, loading, error }
}