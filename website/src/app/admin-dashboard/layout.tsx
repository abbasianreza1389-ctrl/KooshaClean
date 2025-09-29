// website/src/app/admin/layout.tsx
"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const r = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) r.replace("/login");
  }, [r]);

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b bg-white/70 backdrop-blur dark:bg-zinc-900 sticky top-0 z-10">
        <nav className="container flex gap-4 py-3">
          <Link className="font-bold" href="/admin">داشبورد</Link>
          <Link href="/admin/calendar">تقویم</Link>
          <Link href="/admin/patients">بیماران</Link>
          <button onClick={()=>{localStorage.clear(); r.push("/login");}} className="ms-auto text-red-600">خروج</button>
        </nav>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}
"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/Providers";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const r = useRouter(); const p = usePathname(); const {t} = useI18n();
  useEffect(()=>{ const t = localStorage.getItem("access_token"); if(!t) r.replace("/login"); },[r]);

  const Item = ({href,label}:{href:string,label:string}) => (
    <Link href={href} className={`px-3 py-1 rounded-lg ${p===href?"bg-blue-600 text-white":"hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>{label}</Link>
  );

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b bg-white/70 backdrop-blur dark:bg-zinc-900 sticky top-0 z-10">
        <nav className="container flex gap-2 py-3 items-center">
          <Item href="/admin" label={t("dashboard")}/>
          <Item href="/admin/calendar" label={t("calendar")}/>
          <Item href="/admin/patients" label={t("patients")}/>
          <Item href="/admin/reports" label={t("reports")}/>
          <Item href="/admin/settings" label={t("settings")}/>
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher/>
            <ThemeToggle/>
            <button onClick={()=>{localStorage.clear(); r.push("/login");}} className="text-red-600">{t("logout")}</button>
          </div>
        </nav>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}
