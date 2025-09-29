"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

// --- i18n سبک
type Lang = "fa" | "en";
const MSG: Record<Lang, Record<string,string>> = {
  fa: {
    dashboard: "داشبورد",
    calendar: "تقویم",
    patients: "بیماران",
    reports: "گزارش‌ها",
    settings: "تنظیمات",
    logout: "خروج",
    login: "ورود مدیر",
    print: "چاپ",
    exportCsv: "خروجی CSV",
    from: "از",
    to: "تا",
    apply: "اعمال",
    title: "عنوان",
    start: "شروع",
    end: "پایان",
    amount: "مبلغ",
    receipt: "رسید نوبت",
    save: "ذخیره",
    duration: "مدت هر نوبت (دقیقه)",
    capacity: "ظرفیت هر بازه",
    worktime: "ساعت کاری",
    days: "روزهای فعال",
  },
  en: {
    dashboard: "Dashboard",
    calendar: "Calendar",
    patients: "Patients",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    login: "Admin Login",
    print: "Print",
    exportCsv: "Export CSV",
    from: "From",
    to: "To",
    apply: "Apply",
    title: "Title",
    start: "Start",
    end: "End",
    amount: "Amount",
    receipt: "Appointment Receipt",
    save: "Save",
    duration: "Slot duration (min)",
    capacity: "Capacity per slot",
    worktime: "Work time",
    days: "Active days",
  }
};
const I18nCtx = createContext<{lang:Lang,setLang:(l:Lang)=>void,t:(k:string)=>string}>({
  lang:"fa", setLang:()=>{}, t:(k)=>k
});
export function useI18n(){ return useContext(I18nCtx); }

export default function Providers({children}:{children:ReactNode}){
  const [lang,setLang] = useState<Lang>("fa");
  useEffect(()=>{
    const l = (typeof window!=="undefined" && (localStorage.getItem("lang") as Lang)) || "fa";
    setLang(l);
    document.documentElement.dir = l==="fa" ? "rtl":"ltr";
  },[]);
  const t = useMemo(()=> (k:string)=> MSG[lang][k] ?? k, [lang]);
  const onSet = (l:Lang)=>{ setLang(l); if(typeof window!=="undefined") localStorage.setItem("lang", l); };
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nCtx.Provider value={{lang,setLang:onSet,t}}>
        {children}
      </I18nCtx.Provider>
    </ThemeProvider>
  );
}
