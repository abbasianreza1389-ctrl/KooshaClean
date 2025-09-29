"use client";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { services, doctors, posts } from "../lib/demo";

export default function SearchBox(){
  const dataset = useMemo(()=>[
    ...services.map(s=>({type:"service", title:s.title, desc:s.desc, href:`/services/${s.slug}`})),
    ...doctors.map(d=>({type:"doctor",  title:d.name,  desc:d.role, href:`/doctors`})),
    ...posts.map(p=>({type:"post",    title:p.title, desc:p.excerpt, href:`/news/${p.slug}`})),
  ],[]);
  const fuse = useMemo(()=> new Fuse(dataset, { keys:["title","desc"], threshold:.3 }),[dataset]);
  const [q,setQ]=useState("");
  const results = q ? fuse.search(q).map(r=>r.item) : [];

  return (
    <div className="space-y-4">
      <input className="input" placeholder="چه چیزی می‌خواهید؟ مثلا: فیزیوتراپی"
             value={q} onChange={e=>setQ(e.target.value)} />
      <div className="grid gap-3">
        {!q && <div className="text-muted">عبارت جست‌وجو را بنویسید.</div>}
        {q && results.length===0 && <div className="text-muted">موردی یافت نشد.</div>}
        {results.map((it,i)=>(
          <a key={i} href={it.href} className="card hover:shadow-lg transition">
            <div className="text-xs text-muted">{it.type}</div>
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-muted">{it.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
