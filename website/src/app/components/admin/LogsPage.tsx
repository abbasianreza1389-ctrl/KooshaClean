"use client";
import { useEffect, useState } from "react";
import { AdminApi, AdminMock } from "../../lib/adminApi";
import AdminTable from "./AdminTable";

export default function LogsPage(){
  const [rows,setRows]=useState<any[]>([]);
  const [q,setQ]=useState("");
  async function load(){
    const r = await AdminApi.logs();
    const base = r?._error ? AdminMock.logs : r;
    setRows(base);
  }
  useEffect(()=>{ load(); },[]);
  const filtered = rows.filter(x => !q || (x.action?.includes(q) || x.user?.includes(q) || x.message?.includes(q)));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لاگ و رویدادها</h1>
      <div className="card flex gap-3 items-center">
        <input className="input" placeholder="جست‌وجو در لاگ…" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <AdminTable
        columns={[
          {key:"id",title:"شناسه"},
          {key:"ts",title:"زمان"},
          {key:"user",title:"کاربر"},
          {key:"action",title:"عمل"},
          {key:"message",title:"شرح"},
        ]}
        rows={filtered}
      />
    </div>
  );
}
