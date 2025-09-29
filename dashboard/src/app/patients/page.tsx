"use client";
import { useEffect, useState } from "react";
import { getPatients, createPatient } from "@/lib/api";

export default function Patients(){
  const [q,setQ]=useState(""); const [rows,setRows]=useState<any[]>([]);
  const load = ()=> getPatients(q).then(setRows);
  useEffect(load,[q]);
  const add = async ()=>{
    const p = await createPatient({ first_name:"مهمان", last_name:"", mobile:"09..." });
    setRows([p, ...rows]);
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input className="input max-w-sm" placeholder="جستجو: نام/موبایل/کدملی" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn" onClick={add}>افزودن بیمار</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th>نام</th><th>موبایل</th><th>ایجاد</th></tr></thead>
          <tbody>
            {rows.map((r:any)=>(
              <tr key={r.id} className="border-t">
                <td className="py-3">{r.first_name} {r.last_name}</td>
                <td>{r.mobile}</td>
                <td>{new Date(r.created).toLocaleDateString("fa-IR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
