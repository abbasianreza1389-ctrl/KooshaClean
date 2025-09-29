"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

const langs = [
  {code:"fa", label:"فا"},
  {code:"en", label:"EN"},
  {code:"ar", label:"ع"}
];

export default function LanguageSwitcher({locale}:{locale:string}){
  const path = usePathname() || "/";
  // حذف prefix فعلی زبان و جایگزینی با جدید
  const strip = path.replace(/^\/(fa|en|ar)(?=\/|$)/,"");
  return (
    <div className="flex gap-2">
      {langs.map(l => (
        <Link key={l.code}
          className={`px-2 py-1 rounded ${l.code===locale?"bg-slate-900 text-white":"bg-slate-200"}`}
          href={`/${l.code}${strip||"/"}`}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
