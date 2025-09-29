"use client";
import { useState } from "react";

type Props = {
  patientId?: number;
  appointmentId?: number;
  billingEntryId?: number;
  referralId?: number;
  token?: string;                 // JWT در داشبورد
  onDone?: (items:any[]) => void; // خروجی رکوردهای ساخته‌شده
};

const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function Uploader({
  patientId, appointmentId, billingEntryId, referralId, token, onDone
}: Props){
  const [files,setFiles] = useState<File[]>([]);
  const [progress,setProgress] = useState(0);
  const [busy,setBusy] = useState(false);
  const [msg,setMsg] = useState("");

  const upload = async () => {
    if (!files.length) return;
    setBusy(true); setMsg("در حال بارگذاری…");
    const items:any[] = [];
    for (const f of files){
      const kind = f.type.startsWith("image") ? "image" : f.type.startsWith("video") ? "video" : "doc";
      const fd = new FormData();
      fd.append("file", f);
      fd.append("kind", kind);
      if (patientId)      fd.append("patient", String(patientId));
      if (appointmentId)  fd.append("appointment", String(appointmentId));
      if (billingEntryId) fd.append("billing_entry", String(billingEntryId));
      if (referralId)     fd.append("referral", String(referralId));

      const r = await fetch(`${base}/api/attachments/`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      });
      if (!r.ok){ setMsg("خطا در آپلود"); setBusy(false); return; }
      const data = await r.json();
      items.push(data);
      setProgress(Math.round((items.length / files.length) * 100));
    }
    setBusy(false); setMsg("آپلود کامل شد");
    onDone?.(items);
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-3">
        <input type="file" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/>
        <button className="btn" onClick={upload} disabled={busy || !files.length}>آپلود</button>
        {busy && <span className="text-sm">{progress}%</span>}
      </div>
      {msg && <div className="text-xs text-slate-600">{msg}</div>}
      {!!files.length && (
        <ul className="text-xs list-disc pr-5">
          {files.map(f => <li key={f.name}>{f.name} ({Math.round(f.size/1024)} KB)</li>)}
        </ul>
      )}
    </div>
  );
}
