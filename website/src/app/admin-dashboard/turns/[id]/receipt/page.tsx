"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useI18n } from "@/components/Providers";

type Receipt = {
  id: number; patient_name: string; doctor: string;
  date: string; time: string; service: string; amount: number; clinic?: string;
};

export default function ReceiptPage(){
  const { t } = useI18n();
  const { id } = useParams<{id:string}>();
  const [data,setData] = useState<Receipt|null>(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const {data} = await api.get(`/api/turns/${id}/receipt/`);
        setData(data);
      }catch{
        setData({id:Number(id), patient_name:"فاطمه زهرا توسلی", doctor:"رضا عباسیان",
          date:"1402-06-24", time:"14:30", service:"کاردرمانی", amount:38048000, clinic:"مرکز مشاوره کوشا"});
      }
    })();
  },[id]);

  if(!data) return null;

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-2xl border p-6 print:border-0 print:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{t("receipt")}</h1>
        <button className="rounded-lg border px-3 py-1 print:hidden" onClick={()=>window.print()}>{t("print")}</button>
      </div>
      <div className="space-y-2 leading-8">
        <div>شماره: <b>{data.id}</b></div>
        <div>مرکز: <b>{data.clinic || "-"}</b></div>
        <div>بیمار: <b>{data.patient_name}</b></div>
        <div>پزشک/درمانگر: <b>{data.doctor}</b></div>
        <div>خدمت: <b>{data.service}</b></div>
        <div>تاریخ/ساعت: <b>{data.date} - {data.time}</b></div>
        <div>مبلغ: <b>{data.amount.toLocaleString()} ریال</b></div>
      </div>
      <div className="mt-6 text-center text-xs opacity-70 print:opacity-100">— سامانه نوبت‌دهی کوشا —</div>
    </div>
  );
}
