"use client";
import { useState } from "react";
import { AdminApi } from "../../lib/adminApi";
import { useToast } from "../Toast";
import AuthGate from "../AuthGate";
export default function CashierClose(){ return <AuthGate allow={["reception","manager","accountant"]}><Inner/></AuthGate>; }
function Inner(){
  const toast = useToast();
  const [d,setD]=useState({ date:"", shift:"صبح", cash:0, pos:0, transfer:0, cheque:0, insurance_count:0, sessions_count:0, notes:"" });
  const total = (Number(d.cash)||0)+(Number(d.pos)||0)+(Number(d.transfer)||0)+(Number(d.cheque)||0);
  async function submit(){
    const r = await AdminApi.closeShift(d);
    if (r?._error) toast.push("ثبت تحویل ناموفق بود","err"); else toast.push("ثبت شد و در انتظار تایید حسابداری","ok");
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تحویل صندوق/شیفت</h1>
      <div className="card grid md:grid-cols-3 gap-3">
        <input className="input" placeholder="تاریخ (YYYY-MM-DD)" value={d.date} onChange={e=>setD({...d, date:e.target.value})}/>
        <select className="input" value={d.shift} onChange={e=>setD({...d, shift:e.target.value})}>
          <option>صبح</option><option>عصر</option><option>شب</option>
        </select>
        <input className="input" type="number" placeholder="نقد" value={d.cash} onChange={e=>setD({...d, cash:+e.target.value})}/>
        <input className="input" type="number" placeholder="پوز" value={d.pos} onChange={e=>setD({...d, pos:+e.target.value})}/>
        <input className="input" type="number" placeholder="کارت به کارت" value={d.transfer} onChange={e=>setD({...d, transfer:+e.target.value})}/>
        <input className="input" type="number" placeholder="چک" value={d.cheque} onChange={e=>setD({...d, cheque:+e.target.value})}/>
        <input className="input" type="number" placeholder="تعداد نسخ بیمه" value={d.insurance_count} onChange={e=>setD({...d, insurance_count:+e.target.value})}/>
        <input className="input" type="number" placeholder="تعداد جلسات پذیرش‌شده" value={d.sessions_count} onChange={e=>setD({...d, sessions_count:+e.target.value})}/>
        <textarea className="input md:col-span-3 h-24" placeholder="توضیحات" value={d.notes} onChange={e=>setD({...d, notes:e.target.value})}/>
        <div className="md:col-span-3 text-sm text-muted">جمع کل: <b>{total.toLocaleString("fa-IR")}</b> ریال</div>
        <button className="btn md:col-span-3" onClick={submit}>ثبت تحویل</button>
      </div>
    </div>
  );
}
