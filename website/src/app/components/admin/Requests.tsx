"use client";
import { useEffect, useState } from "react";
import { AdminApi, AdminMock } from "../../lib/adminApi";
import AdminTable from "./AdminTable";
import ApproveButtons from "./ApproveButtons";
import { useToast } from "../Toast";

export default function AdminRequests(){
  const toast = useToast();
  const [rows,setRows]=useState<any[]>([]);
  const [busy,setBusy]=useState(false);
  async function load(){
    const r = await AdminApi.pendingRequests();
    setRows(r?._error ? AdminMock.pendingRequests : r);
  }
  useEffect(()=>{ load(); },[]);
  async function act(id:number, action:"approve"|"reject"){
    setBusy(true);
    const r = await AdminApi.approveRequest(id, action);
    if (r?._error) toast.push("خطا در تایید/رد درخواست","err");
    else { toast.push(action==="approve"?"تایید شد":"رد شد","ok"); setRows(s=>s.filter(x=>x.id!==id)); }
    setBusy(false);
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">درخواست‌های رزرو در انتظار</h1>
      <AdminTable
        columns={[
          {key:"id",title:"شناسه"},{key:"name",title:"نام"},{key:"phone",title:"موبایل"},
          {key:"service",title:"خدمت"},{key:"slot",title:"زمان"},{key:"_actions",title:"عملیات"},
        ]}
        rows={rows.map(r=>({...r, _actions:<ApproveButtons disabled={busy} onApprove={()=>act(r.id,"approve")} onReject={()=>act(r.id,"reject")} />}))}
      />
    </div>
  );
}
