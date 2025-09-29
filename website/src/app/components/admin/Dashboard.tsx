"use client";
import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import TrendMini from "./TrendMini";
import AdminTable from "./AdminTable";
import ApproveButtons from "./ApproveButtons";
import { AdminApi, AdminMock } from "../../lib/adminApi";
import { useToast } from "../Toast";

type Pending = { id:number; name:string; phone:string; service:string; slot:string; note?:string };

export default function Dashboard(){
  const toast = useToast();
  const [kpi,setKpi] = useState<any>(null);
  const [pending,setPending] = useState<Pending[]>([]);
  const [busy,setBusy] = useState(false);

  async function load(){
    const r1 = await AdminApi.kpis();
    const r2 = await AdminApi.pendingRequests();
    setKpi(r1?._error ? AdminMock.kpis : r1);
    setPending(r2?._error ? AdminMock.pendingRequests : r2);
  }
  useEffect(()=>{ load(); },[]);

  async function act(id:number, action:"approve"|"reject"){
    setBusy(true);
    const r = await AdminApi.approveRequest(id, action);
    if (r?._error) { toast.push("خطا در عملیات تایید/رد","err"); }
    else { toast.push(action==="approve"?"درخواست تایید شد":"درخواست رد شد","ok"); setPending(p=>p.filter(x=>x.id!==id)); }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>

      {/* KPI ها */}
      <div className="grid md:grid-cols-4 gap-4">
        <KpiCard label="درآمد ماه جاری" value={(kpi?.revenue_month || AdminMock.kpis.revenue_month).toLocaleString("fa-IR")+" ریال"} />
        <KpiCard label="جلسات انجام‌شده" value={(kpi?.sessions_done || AdminMock.kpis.sessions_done).toLocaleString("fa-IR")} />
        <KpiCard label="نرخ اشغال ظرفیت" value={((kpi?.occupancy ?? AdminMock.kpis.occupancy)) + "%"} />
        <KpiCard label="مراجعین جدید" value={(kpi?.new_patients || AdminMock.kpis.new_patients).toLocaleString("fa-IR")} />
      </div>

      {/* روند درآمد */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="font-semibold">روند درآمد (۱۲ هفته)</div>
          <div className="text-sm text-muted">نمونهٔ نمایشی؛ با API واقعی جایگزین می‌شود</div>
        </div>
        <TrendMini data={kpi?.trend || AdminMock.kpis.trend} />
      </div>

      {/* درخواست‌های رزرو در انتظار تایید */}
      <div className="space-y-3">
        <div className="font-semibold">درخواست‌های رزرو (منشی)</div>
        <AdminTable
          columns={[
            { key:"id", title:"شناسه" },
            { key:"name", title:"نام" },
            { key:"phone", title:"موبایل" },
            { key:"service", title:"خدمت" },
            { key:"slot", title:"زمان" },
            { key:"_actions", title:"عملیات" },
          ]}
          rows={pending.map(p=>({
            ...p,
            _actions: <ApproveButtons disabled={busy} onApprove={()=>act(p.id,"approve")} onReject={()=>act(p.id,"reject")} />
          }))}
        />
      </div>
    </div>
  );
}
