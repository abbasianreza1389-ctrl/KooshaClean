"use client";
import {useState} from 'react';
import {useParams, useRouter} from 'next/navigation';

export default function Login(){
  const [u,setU]=useState(''); const [p,setP]=useState('');
  const [err,setErr]=useState(''); const {locale} = useParams() as {locale:string};
  const router = useRouter();

  async function submit(e:any){
    e.preventDefault(); setErr('');
    const r = await fetch('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:u,password:p})});
    if(r.ok) router.push(`/${locale}/dashboard`);
    else setErr('ورود ناموفق بود');
  }
  return (
    <form onSubmit={submit} className="max-w-sm mx-auto space-y-4 bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-bold">ورود کارکنان</h1>
      <input className="w-full border rounded p-2" placeholder="نام کاربری" value={u} onChange={e=>setU(e.target.value)} />
      <input className="w-full border rounded p-2" placeholder="گذرواژه" type="password" value={p} onChange={e=>setP(e.target.value)} />
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button className="w-full py-2 rounded-xl bg-sky-600 text-white">ورود</button>
      <a href={`${process.env.NEXT_PUBLIC_API_BASE}/admin/`} className="text-xs text-slate-500 block text-center">ورود به پنل Django Admin</a>
    </form>
  );
}
