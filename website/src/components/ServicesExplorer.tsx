"use client";
import { useMemo, useState } from "react";
import type { Service } from "../lib/demo";
import ServiceCard from "./ServiceCard";

export default function ServicesExplorer({ items }:{ items:Service[] }){
  const [q,setQ]=useState(""); const [cat,setCat]=useState<string|undefined>();
  const cats = useMemo(()=>Array.from(new Set(items.map(i=>i.cat).filter(Boolean))) as string[],[items]);
  const list = items.filter(i=>{
    const okQ = !q || (i.title+i.desc).includes(q);
    const okC = !cat || i.cat===cat;
    return okQ && okC;
  });
  return (
    <div className="space-y-4">
      <div className="card grid md:grid-cols-3 gap-3">
        <input className="input" placeholder="جست‌وجوی خدمت…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={cat??""} onChange={e=>setCat(e.target.value||undefined)}>
          <option value="">همهٔ دسته‌ها</option>
          {cats.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <a className="btn-ghost" href="/appointment">رزرو سریع</a>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {list.map(s => <ServiceCard key={s.slug} s={s} />)}
        {list.length===0 && <div className="text-muted">نتیجه‌ای یافت نشد.</div>}
      </div>
    </div>
  );
}
