"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
export default function Breadcrumbs(){
  const path = usePathname();
  if (path === "/") return null;
  const parts = path.split("/").filter(Boolean);
  const items = parts.map((p,i)=>({ label: decodeURIComponent(p), href: "/"+parts.slice(0,i+1).join("/") }));
  return (
    <div className="bg-white/70 backdrop-blur border-b border-slate-200/60">
      <div className="container py-2 text-sm flex gap-2 flex-wrap">
        <Link href="/" className="text-muted hover:text-sky-700">خانه</Link>
        {items.map((it,i)=>(
          <span key={it.href} className="flex gap-2 items-center">
            <span className="text-muted">/</span>
            {i === items.length-1 ? <span className="font-semibold">{it.label}</span> : <Link href={it.href} className="text-muted hover:text-sky-700">{it.label}</Link>}
          </span>
        ))}
      </div>
    </div>
  );
}
