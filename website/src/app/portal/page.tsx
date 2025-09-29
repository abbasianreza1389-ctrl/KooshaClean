'use client'; import {useState} from 'react';
const API=process.env.NEXT_PUBLIC_API||"http://localhost:8000";
export default function Portal(){const [code,setCode]=useState('PB1'); const [phone,setPhone]=useState(''); const [items,setItems]=useState<any[]>([]);
async function load(){const r=await fetch(`${API}/api/portal/my-appointments/?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`); const j=await r.json(); setItems(j);}
return(<main dir="rtl" className="container py-6"><h1 className="text-xl font-bold mb-4">پرتال بیمار</h1>
<div className="card space-y-3"><input className="form-input w-full" value={code} onChange={e=>setCode(e.target.value)} placeholder="کد بیمار"/>
<input className="form-input w-full" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="تلفن (اختیاری)"/>
<button onClick={load} className="px-4 py-2 rounded bg-black text-white">نمایش نوبت‌ها</button><pre>{JSON.stringify(items,null,2)}</pre></div></main>);}
