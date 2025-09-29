"use client";
import { useEffect, useState } from "react";
import { AdminApi } from "../../lib/adminApi";
import AdminTable from "./AdminTable";
import { useToast } from "../Toast";
import AuthGate from "../AuthGate";
export default function Exceptions(){
  return <AuthGate allow={["manager","reception"]}><Inner/></AuthGate>;
}
function Inner(){
  const toast = useToast();
  const [rows,setRows]=useState<any[]>([]); const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({ date:"", dept:"", provider:"", start:"09:00", end:"12:00", closed:false });
  async function load(){ const r = await AdminApi.exceptionsList(); setRows(r?._error?[]:r); }
  useEffect(()=>{ load(); },[]);
  async function create(){ setBusy(true); const r = await AdminApi.exceptionCreate(form); if(r?._error) toast.push("خطا در ثبت","err"); else{ toast.push("ثبت شد","ok"); await load(); } setBusy(false); }
  async function del(id:number){ setBusy(true); const r = await AdminApi.exceptionDelete(id); if(r?._error) toast.push("حذف ناموفق","err"); else{ toast.push("حذف شد","ok"); setRows(s=>s.filter(x=>x.id!==id)); } setBusy(false); }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">استثناهای زمان‌بندی</h1>
      <div className="card grid md:grid-cols-3 gap-3">
        <input className="input" placeholder="تاریخ (YYYY-MM-DD)" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
        <input className="input" placeholder="دپارتمان" value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}/>
        <input className="input" placeholder="درمانگر" value={form.provider} onChange={e=>setForm(f=>({...f,provider:e.target.value}))}/>
        <input className="input" placeholder="شروع" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))}/>
        <input className="input" placeholder="پایان" value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.closed} onChange={e=>setForm(f=>({...f,closed:e.target.checked}))}/> تعطیل</label>
        <button className="btn md:col-span-3" onClick={create} disabled={busy}>افزودن استثنا</button>
      </div>
      <AdminTable
        columns={[{key:"id",title:"شناسه"},{key:"date",title:"تاریخ"},{key:"dept",title:"دپارتمان"},{key:"provider",title:"درمانگر"},{key:"start",title:"شروع"},{key:"end",title:"پایان"},{key:"closed",title:"تعطیل"},{key:"_del",title:""}]}
        rows={rows.map((r:any)=>({...r,_del:<button className="btn-ghost h-8 px-3" onClick={()=>del(r.id)}>حذف</button>}))}
      />
    </div>
  );
}
