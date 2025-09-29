'use client'; import {useState} from 'react';
const API=process.env.NEXT_PUBLIC_API||"http://localhost:8000";
export default function Booking(){const [form,setForm]=useState({full_name:'',phone:'',provider_name:'',date:'',slot:''}); const [res,setRes]=useState<any>(null);
async function submit(){const r=await fetch(`${API}/api/public-booking-requests/`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('access')||''}`},body:JSON.stringify(form)}); setRes({ok:r.ok,status:r.status});}
return(<main dir="rtl" className="container py-6"><h1 className="text-xl font-bold mb-4">رزرو آنلاین</h1>
<div className="card space-y-3">{['full_name','phone','provider_name','date','slot'].map(k=>(<input key={k} className="form-input w-full" placeholder={k} value={(form as any)[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>))}
<button onClick={submit} className="px-4 py-2 rounded bg-black text-white">ارسال</button><pre>{JSON.stringify(res,null,2)}</pre></div></main>);}
