"use client";
import { useEffect, useState } from "react";
import { AdminApi, AdminMock } from "../../lib/adminApi";
import AdminTable from "./AdminTable";
import { useToast } from "../Toast";

export default function BillingManager(){
  const toast = useToast();
  const [settlements,setSettlements]=useState<any[]>([]);
  const [period,setPeriod]=useState<string>("1404-06");
  const [busy,setBusy]=useState(false);

  async function load(){
    const r = await AdminApi.settlements();
    setSettlements(r?._error ? AdminMock.settlements : r);
  }
  useEffect(()=>{ load(); },[]);

  async function close(){
    setBusy(true);
    const r = await AdminApi.closePeriod({ period });
    if (r?._error) toast.push("بستن دوره ناموفق بود (API آماده نیست؟)","err");
    else { toast.push("دوره بسته شد","ok"); await load(); }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">حسابداری و تسویه</h1>

      <div className="card flex flex-col md:flex-row gap-3 items-center">
        <input className="input md:w-48" placeholder="دوره (YYYY-MM)" value={period} onChange={e=>setPeriod(e.target.value)}/>
        <button className="btn" onClick={close} disabled={busy}>بستن دوره</button>
        <a className="btn-ghost" href={AdminApi.exportUrl("csv")} target="_blank">خروجی CSV</a>
      </div>

      <AdminTable
        columns={[
          {key:"id",title:"شناسه"},
          {key:"provider",title:"درمانگر"},
          {key:"period",title:"دوره"},
          {key:"gross",title:"جمع ناخالص"},
          {key:"clinic_share",title:"سهم کلینیک"},
          {key:"provider_share",title:"سهم درمانگر"},
          {key:"status",title:"وضعیت"},
        ]}
        rows={settlements.map(s=>({
          ...s,
          gross: Number(s.gross).toLocaleString("fa-IR"),
          clinic_share: Number(s.clinic_share).toLocaleString("fa-IR"),
          provider_share: Number(s.provider_share).toLocaleString("fa-IR"),
        }))}
      />
    </div>
  );
}
