"use client";
import { useEffect, useState } from "react";
import { AdminApi, AdminMock } from "../../lib/adminApi";
import AdminTable from "./AdminTable";
import { useToast } from "../Toast";

export default function AvailabilityManager(){
  const toast = useToast();
  const [rules,setRules]=useState<any[]>([]);
  const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({ dept:"", provider:"", weekday:"شنبه-چهارشنبه", start:"09:00", end:"14:00", slot:30, max_concurrent:1 });

  async function load(){
    const r = await AdminApi.rulesList();
    setRules(r?._error ? AdminMock.rules : r);
  }
  useEffect(()=>{ load(); },[]);

  async function createRule(){
    setBusy(true);
    const r = await AdminApi.ruleCreate(form);
    if (r?._error) toast.push("خطا در ثبت قانون (API حاضر نیست؟)","err");
    else { toast.push("قانون ذخیره شد","ok"); await load(); }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">قوانین دسترس‌پذیری</h1>

      <div className="card grid md:grid-cols-3 gap-3">
        <input className="input" placeholder="دپارتمان" value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}/>
        <input className="input" placeholder="نام درمانگر/بخش" value={form.provider} onChange={e=>setForm(f=>({...f,provider:e.target.value}))}/>
        <input className="input" placeholder="روزهای هفته" value={form.weekday} onChange={e=>setForm(f=>({...f,weekday:e.target.value}))}/>
        <input className="input" placeholder="شروع (HH:MM)" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))}/>
        <input className="input" placeholder="پایان (HH:MM)" value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/>
        <input className="input" placeholder="طول اسلات (دقیقه)" type="number" value={form.slot} onChange={e=>setForm(f=>({...f,slot:+e.target.value}))}/>
        <input className="input" placeholder="حداکثر همزمان" type="number" value={form.max_concurrent} onChange={e=>setForm(f=>({...f,max_concurrent:+e.target.value}))}/>
        <button className="btn md:col-span-3" onClick={createRule} disabled={busy}>ثبت قانون</button>
      </div>

      <AdminTable
        columns={[
          {key:"id",title:"شناسه"},{key:"dept",title:"دپارتمان"},{key:"provider",title:"درمانگر"},
          {key:"weekday",title:"روزها"},{key:"start",title:"شروع"},{key:"end",title:"پایان"},
          {key:"slot",title:"اسلات"},{key:"max_concurrent",title:"حداکثر همزمان"}
        ]}
        rows={rules}
      />
    </div>
  );
}
