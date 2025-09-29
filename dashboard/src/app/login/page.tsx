"use client";
import { useState } from "react";
import { login } from "@/lib/api";

export default function Login(){
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  const submit = async (e:any)=>{ e.preventDefault(); const ok = await login(u,p); setErr(ok?"":"نام کاربری/گذرواژه اشتباه است"); if(ok) location.href="/"; };
  return (
    <div className="max-w-sm mx-auto mt-20 card">
      <h1 className="text-xl font-bold mb-4">ورود به مدیریت</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="نام کاربری" value={u} onChange={e=>setU(e.target.value)} />
        <input className="input" placeholder="گذرواژه" type="password" value={p} onChange={e=>setP(e.target.value)} />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="btn w-full">ورود</button>
      </form>
    </div>
  );
}
