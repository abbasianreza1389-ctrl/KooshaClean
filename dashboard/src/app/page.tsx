"use client";
import { useEffect, useState } from "react";
import { getSummary } from "@/lib/api";

export default function Dashboard(){
  const [sum,setSum]=useState<any>({});
  useEffect(()=>{ getSummary().then(setSum); },[]);
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="card"><div className="text-sm text-muted">نوبت‌های امروز</div><div className="text-2xl font-bold mt-2">{sum.appointments_today ?? "—"}</div></div>
      <div className="card"><div className="text-sm text-muted">وصولی امروز</div><div className="text-2xl font-bold mt-2">{(sum.patient_paid_today||0).toLocaleString("fa-IR")}</div></div>
      <div className="md:col-span-2 card"><div className="font-semibold mb-2">گزارش سریع</div><div className="h-40 bg-slate-100 rounded-xl"></div></div>
    </div>
  );
}
