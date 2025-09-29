"use client";
import { useMemo, useState } from "react";
import type { Doctor } from "../lib/demo";
import DoctorCard from "./DoctorCard";

export default function DoctorsExplorer({ items }:{ items:Doctor[] }){
  const [dept,setDept]=useState<string|undefined>();
  const depts = useMemo(()=>Array.from(new Set(items.map(i=>i.dept).filter(Boolean))) as string[],[items]);
  const list = items.filter(i=>!dept || i.dept===dept);
  return (
    <>
      <div className="card mb-4">
        <select className="input max-w-xs" value={dept??""} onChange={e=>setDept(e.target.value||undefined)}>
          <option value="">همهٔ بخش‌ها</option>
          {depts.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-6">{list.map(d=> <DoctorCard key={d.id} d={d} />)}</div>
    </>
  );
}
