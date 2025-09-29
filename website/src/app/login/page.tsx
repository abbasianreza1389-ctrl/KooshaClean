export const metadata = { title:"ورود" };
"use client";
import { useState } from "react";
import { setAuth } from "../../lib/auth";
export default function Login(){
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [role,setRole]=useState("manager");
  const [err,setErr]=useState("");
  async function submit(e:any){ e.preventDefault(); setErr("");
    try{
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const r = await fetch(base+"/api/token/", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({username:u, password:p}) });
      if(!r.ok) throw new Error("نام کاربری/رمز نادرست");
      const j = await r.json();
      setAuth(j.access, role); window.location.href="/admin-dashboard";
    }catch(e:any){ setErr(e?.message||"خطا"); }
  }
  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-xl font-bold">ورود مدیر/کارکنان</h1>
      <form className="mt-4 grid gap-3" onSubmit={submit}>
        <input className="input" placeholder="نام کاربری" value={u} onChange={e=>setU(e.target.value)} />
        <input className="input" placeholder="رمز عبور" type="password" value={p} onChange={e=>setP(e.target.value)} />
        <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="manager">مدیر</option>
          <option value="accountant">حسابدار</option>
          <option value="reception">منشی</option>
          <option value="doctor">درمانگر/پزشک</option>
        </select>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="btn">ورود</button>
      </form>
    </div>
  );
}
