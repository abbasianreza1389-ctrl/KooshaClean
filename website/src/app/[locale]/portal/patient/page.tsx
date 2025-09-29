'use client'
import {useEffect,useState} from 'react'
import {API_BASE} from '@/src/lib/api'
import Link from 'next/link'
export default function PatientPortal(){
  const [data,setData]=useState<any>(null)
  const token = typeof window!=='undefined'? localStorage.getItem('jwt'):null
  useEffect(()=>{
    if(!token) return
    fetch(`${API_BASE}/api/portal/patient/dashboard/`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r=>r.json()).then(setData)
  },[token])
  if(!token) return <p>برای مشاهده پرتال، اول <Link href="../login" className="underline">وارد شوید</Link>.</p>
  return (<section><h1 className="text-2xl font-bold">پرتال بیمار</h1><pre>{JSON.stringify(data,null,2)}</pre></section>)
}
