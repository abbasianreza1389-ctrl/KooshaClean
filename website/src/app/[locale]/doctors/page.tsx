'use client'
import {useEffect,useState} from 'react'
import {API_BASE} from '@/lib/api'
export default function Doctors(){
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ fetch(`${API_BASE}/api/doctors/`).then(r=>r.json()).then(setRows) },[])
  return <section><h1 className="text-2xl font-bold">پزشکان/درمانگران</h1><ul>{rows.map(r=><li key={r.id}>{r.display_name}</li>)}</ul></section>
}
