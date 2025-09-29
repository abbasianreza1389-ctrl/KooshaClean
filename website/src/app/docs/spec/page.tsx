'use client';
import { useEffect, useState } from 'react';
export default function Spec(){
  const [md,setMd]=useState<string>(''); useEffect(()=>{
    fetch('/spec-fa.md').then(r=>r.text()).then(setMd).catch(()=>setMd('خطا در بارگذاری سند'));
  },[]);
  return (<main dir="rtl" className="container py-6">
    <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold">سند پروژه (نسخهٔ تعبیه‌شده)</h1>
      <button onClick={()=>window.print()} className="px-3 py-1.5 rounded bg-black text-white">چاپ / PDF</button></div>
    <article className="prose prose-zinc max-w-none" dangerouslySetInnerHTML={{__html: md.replaceAll('\n','<br/>')}} />
    <div className="mt-6 card">
      <b>دانلود خام:</b> <a className="text-blue-700 underline" href="/spec-fa.md" download>spec-fa.md</a>
    </div>
  </main>);
}
