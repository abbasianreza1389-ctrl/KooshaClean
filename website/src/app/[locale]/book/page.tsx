'use client'
import { useState, useEffect } from 'react'
import {API_BASE} from '@/lib/api'

export default function BookPage(){
  const [services, setServices] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [slots, setSlots] = useState<any[]>([])
  const [serviceId, setServiceId] = useState<string>('')
  const [providerId, setProviderId] = useState<string>('')
  const [slotId, setSlotId] = useState<string>('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [result, setResult] = useState<any>(null)
  useEffect(()=>{ fetch(`${API_BASE}/api/services/`).then(r=>r.json()).then(setServices) },[])
  useEffect(()=>{ fetch(`${API_BASE}/api/doctors/`).then(r=>r.json()).then(setProviders) },[])
  useEffect(()=>{ if(serviceId||providerId){ fetch(`${API_BASE}/api/slots/?service_id=${serviceId}&provider_id=${providerId}`).then(r=>r.json()).then(setSlots) }},[serviceId,providerId])
  async function book(){
    const res = await fetch(`${API_BASE}/api/appointments/`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ slot: Number(slotId), guest_name: name, amount_minor: amount })})
    const data = await res.json(); setResult(data)
  }
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">رزرو وقت</h1>
      <div><label>خدمت:</label>
        <select value={serviceId} onChange={e=>setServiceId(e.target.value)}><option value="">—</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
      </div>
      <div><label>پزشک/درمانگر:</label>
        <select value={providerId} onChange={e=>setProviderId(e.target.value)}><option value="">—</option>{providers.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select>
      </div>
      <div><label>اسلات:</label>
        <select value={slotId} onChange={e=>setSlotId(e.target.value)}><option value="">—</option>{slots.map(s=><option key={s.id} value={s.id}>{new Date(s.start).toLocaleString('fa-IR')}</option>)}</select>
      </div>
      <div><label>نام مهمان:</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
      <div><label>مبلغ (minor):</label><input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} /></div>
      <button onClick={book}>رزرو</button>
      {result && <pre>{JSON.stringify(result,null,2)}</pre>}
    </section>
  )
}
