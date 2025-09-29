"use client";
import { useEffect, useState } from "react";
import { getBillingEntries } from "@/lib/api";

export default function Billing(){
  const [from,setFrom]=useState(""); const [to,setTo]=useState("");
  const [rows,setRows]=useState<any[]>([]);
  const load = ()=> getBillingEntries(from,to).then(setRows);
  useEffect(load,[]);
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input className="input max-w-xs" type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
        <input className="input max-w-xs" type="date" value={to} onChange={e=>setTo(e.target.value)}/>
        <button className="btn" onClick={load}>اعمال فیلتر</button>
        <button className="btn-ghost">Excel</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th>#</th><th>بیمار</th><th>خدمت</th><th>کل</th><th>پایه</th><th>تکمیلی</th><th>پرداختی</th></tr></thead>
          <tbody>
            {rows.map((r:any)=>(
              <tr key={r.id} className="border-t">
                <td className="py-3">{r.id}</td>
                <td>{r.appointment_obj?.patient_name}</td>
                <td>{r.appointment_obj?.service_title}</td>
                <td>{r.total_amount?.toLocaleString("fa-IR")}</td>
                <td>{r.base_insurance?.toLocaleString("fa-IR")}</td>
                <td>{r.complementary_ins?.toLocaleString("fa-IR")}</td>
                <td>{r.patient_paid?.toLocaleString("fa-IR")}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="py-6 text-center text-muted">داده‌ای نیست.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
