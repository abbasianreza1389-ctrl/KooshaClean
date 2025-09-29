"use client";
import { useEffect, useState } from "react";
import { AdminApi } from "../../lib/adminApi";
import AdminTable from "./AdminTable";
import { useToast } from "../Toast";
import AuthGate from "../AuthGate";
export default function Capacity(){ return <AuthGate allow={["manager","reception"]}><Inner/></AuthGate>; }
function Inner(){
  const toast = useToast();
  const [rows,setRows]=useState<any[]>([]); const [form,setForm]=useState({ dept:"", provider:"", max_concurrent:1 });
  async function load(){ const r = await AdminApi.capacityList(); setRows(r?._error?[]:r); }
  useEffect(()=>{ load(); },[]);
  async function save(){ const r = await AdminApi.capacityUpsert(form); if(r?._error) toast.push("ذخیره ناموفق","err"); else { toast.push("ذخیره شد","ok"); await load(); } }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ظرفیت/حداکثر همزمان</h1>
      <div className="card grid md:grid-cols-3 gap-3">
        <input className="input" placeholder="دپارتمان" value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}/>
        <input className="input" placeholder="درمانگر" value={form.provider} onChange={e=>setForm(f=>({...f,provider:e.target.value}))}/>
        <input className="input" type="number" placeholder="حداکثر همزمان" value={form.max_concurrent} onChange={e=>setForm(f=>({...f,max_concurrent:+e.target.value}))}/>
        <button className="btn md:col-span-3" onClick={save}>ثبت/به‌روزرسانی</button>
      </div>
      <AdminTable columns={[{key:"id",title:"شناسه"},{key:"dept",title:"دپارتمان"},{key:"provider",title:"درمانگر"},{key:"max_concurrent",title:"حداکثر همزمان"}]} rows={rows}/>
    </div>
  );
}
