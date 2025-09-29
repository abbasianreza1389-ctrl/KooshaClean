"use client";
import { useState } from "react";

const base = process.env.NEXT_PUBLIC_API_BASE!;

export default function Appointment(){
  const [step,setStep] = useState(1);
  const [form,setForm] = useState<any>({ first_name:"", last_name:"", mobile:"", service_slug:"consult", doctor_id:"", date_time:"" });
  const [msg,setMsg] = useState("");

  const submit = async () => {
    setMsg("در حال ثبت...");
    const r = await fetch(`${base}/api/appointments/`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form)
    });
    if(r.ok){ setStep(3); setMsg("نوبت با موفقیت ثبت شد."); }
    else { setMsg("خطا در ثبت نوبت"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">رزرو نوبت</h1>
      {step===1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="نام" value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/>
          <input className="input" placeholder="نام خانوادگی" value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/>
          <input className="input" placeholder="موبایل" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/>
          <select className="input" value={form.service_slug} onChange={e=>setForm({...form,service_slug:e.target.value})}>
            <option value="consult">ویزیت عمومی</option>
            <option value="physio">فیزیوتراپی</option>
          </select>
          <button className="btn" onClick={()=>setStep(2)}>انتخاب زمان</button>
        </div>
      )}
      {step===2 && (
        <div className="card">
          <p className="text-muted mb-3">تاریخ و ساعت (ISO)</p>
          <input className="input" placeholder="مثال: 2025-10-05T09:30:00Z" value={form.date_time} onChange={e=>setForm({...form,date_time:e.target.value})}/>
          <div className="mt-3 flex gap-3">
            <button className="btn" onClick={submit}>ثبت نهایی</button>
            <button className="btn-ghost" onClick={()=>setStep(1)}>بازگشت</button>
          </div>
          {msg && <div className="text-sm mt-3">{msg}</div>}
        </div>
      )}
      {step===3 && <div className="card">{msg}</div>}
    </div>
  );
}
