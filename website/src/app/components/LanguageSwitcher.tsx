"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Lang } from "@/lib/dict";

const langs: Lang[] = ["fa", "en", "ar"];

export default function LangSwitcher({ current }: { current: Lang }) {
  const path = usePathname() || "/";
  // path like /fa/xxx → swap the first segment
  const seg = path.split("/");
  const rest = seg.slice(2).join("/");
  return (
    <div className="flex gap-1">
      {langs.map(l => (
        <Link key={l} className={`btn-ghost text-sm ${l===current?"font-semibold":""}`} href={`/${l}/${rest}`}>{l.toUpperCase()}</Link>
      ))}
    </div>
  );
}
