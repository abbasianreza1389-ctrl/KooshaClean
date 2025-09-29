"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useI18n } from "@/components/Providers";

type Settings = {
  duration: number; capacity: number;
  start: string; end: string;
  days: {sat:boolean,sun:boolean,mon:boolean,tue:boolean,wed:boolean,thu:boolean,fri:boolean};
};

export default function SettingsPage(){
  const {t} = useI18n();
  const [s,setS] = useState<Settings>({
    duration: 15, capacity: 1, start:"08:00", end:"20:00",
    days:{sat:true,sun:true,mon:true,tue:true,wed:true,thu:true,fri:false}
  });
  const [msg,setMsg]=useState("");

  useEffect(()=>{
    (async()=>{
      try{
        const {data} = await api.get("/api/turn/settings");
        setS(data);
      }catch{}
    })();
  },[]);

  const save = async ()=>{
    try{
      await api.put("/api/turn/settings", s);
      setMsg("ذخیره شد.");
      setTimeout(()=>setMsg(""),1500);
    }catch{ setMsg("خطا در ذخیره!"); }
  };

  const Day = ({k,label}:{k:keyof Settings["days"], label:string})=>(
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={s.days[k]} onChange={e=>setS({...s, days:{...s.days,[k]:e.target.checked}})} />
      {label}
    </label>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t("settings")}</h1>
      <div className="grid gap-4 rounded-2xl border p-4 bg-white dark:bg-zinc-900">
        <label className="grid gap-1">
          <span className="text-sm">{t("duration")}</span>
          <input type="number" className="rounded-lg border p-2" value={s.duration}
            onChange={e=>setS({...s, duration: Number(e.target.value||0)})}/>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">{t("capacity")}</span>
          <input type="number" className="rounded-lg border p-2" value={s.capacity}
            onChange={e=>setS({...s, capacity: Number(e.target.value||0)})}/>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm">{t("worktime")} (از)</span>
            <input type="time" className="rounded-lg border p-2" value={s.start}
              onChange={e=>setS({...s, start: e.target.value})}/>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t("worktime")} (تا)</span>
            <input type="time" className="rounded-lg border p-2" value={s.end}
              onChange={e=>setS({...s, end: e.target.value})}/>
          </label>
        </div>
        <div className="grid gap-2">
          <span className="text-sm">{t("days")}</span>
          <div className="flex flex-wrap gap-4">
            <Day k="sat" label="شنبه"/><Day k="sun" label="یکشنبه"/><Day k="mon" label="دوشنبه"/>
            <Day k="tue" label="سه‌شنبه"/><Day k="wed" label="چهارشنبه"/><Day k="thu" label="پنجشنبه"/>
            <Day k="fri" label="جمعه"/>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="rounded-lg border px-4 py-2">{t("save")}</button>
          {msg && <span className="text-sm opacity-70">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
