'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
export default function PatientPortal(){
  const [data,setData]=useState<any>(null)
  useEffect(()=>{ fetch(`${API}/api/portal/patient/dashboard/`, { headers: { /* add Bearer token here */ } }).then(r=>r.json()).then(setData) },[])
  return (<section><h1 className="text-2xl font-bold">پرتال بیمار</h1><pre>{JSON.stringify(data,null,2)}</pre></section>)
}
