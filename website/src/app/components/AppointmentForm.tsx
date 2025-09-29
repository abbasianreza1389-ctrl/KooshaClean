"use client";
import { useMemo, useState } from "react";
import { postAppointment } from "../lib/api";
import { useToast } from "./Toast";

const init = { service:"ویزیت عمومی", slot:"اولین زمان آزاد", name:"", phone:"", note:"" };
export default function AppointmentForm(){
  const toast = useToast();
  const [step,setStep]=useState(1);
  const [loading,setLoading]=useState(false);
  const [form,setForm]=useState(init);
  const validStep2 = useMemo(()=> form.name.trim().length>=3 && /^0\d{10}$/.test(form.phone), [form]);

  async function submit(){
    setLoading(true);
    try{
      await postAppointment(form);
      toast.push("نوبت با موفقیت ثبت شد 🎉","ok");
      setStep(1); setForm(init);
    }catch(e:any){
      toast.push("خطا در ثبت نوبت: "+(e?.message||"نامشخص"),"err");
    }finally{ setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        {["انتخاب خدمت","اطلاعات تماس","تایید"].map((t,i)=>{
          const n=i+1, on=step===n;
          return <div key={t} className={`px-2 py-1 rounded ${on?"bg-sky-100 text-sky-800":"bg-slate-100 text-slate-700"}`}>{n}. {t}</div>;
        })}
      </div>

      {step===1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <select className="input" value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value}))}>
            <option>ویزیت عمومی</option><option>فیزیوتراپی</option><option>آزمایش‌ها</option>
          </select>
          <select className="input" value={form.slot} onChange={e=>setForm(f=>({...f,slot:e.target.value}))}>
            <option>اولین زمان آزاد</option><option>فردا عصر</option><option>هفتهٔ آینده</option>
          </select>
          <button className="btn mt-2" onClick={()=>setStep(2)}>ادامه</button>
        </div>
      )}

      {step===2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="نام و نام خانوادگی" value={form.name}
                 onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input className="input" placeholder="شماره تماس (مثال: 09123456789)" value={form.phone}
                 onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
          <textarea className="input h-24 md:col-span-2" placeholder="توضیحات (اختیاری)"
                    value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
          <div className="flex gap-3">
            <button className="btn-ghost" onClick={()=>setStep(1)}>بازگشت</button>
            <button className="btn" disabled={!validStep2} onClick={()=>setStep(3)}>بررسی نهایی</button>
          </div>
          {!validStep2 && <div className="text-sm text-red-600 md:col-span-2">
            نام حداقل ۳ کاراکتر و شماره باید با ۰ شروع و ۱۱ رقمی باشد.
          </div>}
        </div>
      )}

      {step===3 && (
        <div className="space-y-4">
          <div className="card bg-slate-50">
            <div><b>خدمت:</b> {form.service}</div>
            <div><b>زمان:</b> {form.slot}</div>
            <div><b>نام:</b> {form.name}</div>
            <div><b>تلفن:</b> {form.phone}</div>
            {form.note && <div><b>توضیحات:</b> {form.note}</div>}
          </div>
          <div className="flex gap-3">
            <button className="btn-ghost" onClick={()=>setStep(2)}>ویرایش</button>
            <button className="btn" onClick={submit} disabled={loading}>{loading?"در حال ثبت…":"ثبت نهایی"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
