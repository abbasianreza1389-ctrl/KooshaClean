"use client";
import { useEffect, useState } from "react";
import { getAppointmentsByDay } from "@/lib/api";

export default function Calendar(){
  const [date,setDate]=useState<string>(new Date().toISOString().slice(0,10));
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{ getAppointmentsByDay(date).then(setRows); },[date]);
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input className="input max-w-xs" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        <button className="btn">نوبت جدید</button>
      </div>
      <div className="card">
        <div className="font-semibold mb-3">نوبت‌های {new Date(date).toLocaleDateString("fa-IR")}</div>
        <div className="space-y-2 text-sm">
          {rows.map((a:any)=>(
            <div key={a.id} className="p-3 rounded-lg bg-green-50 border border-green-200">
              {new Date(a.date_time).toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"})} — {a.patient_name} — {a.service_title || "—"}
            </div>
          ))}
          {!rows.length && <div className="text-muted">نوبتی برای این روز ثبت نشده است.</div>}
        </div>
      </div>
    </div>
  );
}
