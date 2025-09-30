'use client'
import {useEffect,useState} from 'react'
import {API_BASE} from '@/lib/api'
export default function Posts(){
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ fetch(`${API_BASE}/api/posts/`).then(r=>r.json()).then(setRows) },[])
  return <section><h1 className="text-2xl font-bold">اخبار</h1>{rows.map(p=>(<article key={p.id}><h3 className="font-semibold">{p.title}</h3><p>{(p.body||'').slice(0,160)}...</p></article>))}</section>
}
