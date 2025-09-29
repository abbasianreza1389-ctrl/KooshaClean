'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API || 'http://localhost:8000';
export default function Page(){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{ fetch(${API}/api/kpi/overview/).then(r=>r.json()).then(setData).catch(()=>setData({error:true})); },[]);
  return (
    <main dir="rtl" className="container py-6">
      <h1 className="text-xl font-bold mb-4">admin-dashboard</h1>
      <pre className="card whitespace-pre-wrap">{JSON.stringify(data,null,2)}</pre>
    </main>
  )
}
export const metadata = { title: "داشبورد مدیریت" };
import AdminDashboard from "../../components/admin/Dashboard";
export default function Page(){ return <AdminDashboard/>; }
