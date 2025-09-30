'use client'
import {useEffect,useState} from 'react'
import {API_BASE} from '@/lib/api'
export default function Services(){
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ fetch(`${API_BASE}/api/services/`).then(r=>r.json()).then(setRows) },[])
  return <section><h1 className="text-2xl font-bold">خدمات</h1><ul>{rows.map(r=><li key={r.id}>{r.name} – {r.duration_min}min</li>)}</ul></section>
}
