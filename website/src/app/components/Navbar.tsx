"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LangSwitcher from "./LangSwitcher";
import type { Lang } from "@/lib/dict";

export default function Navbar({ lang, dict }: { lang: Lang; dict: any }) {
  const path = usePathname();
  const base = (p: string) => `/${lang}${p}`;
  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/services", label: dict.nav.services },
    { href: "/doctors", label: dict.nav.doctors },
    { href: "/news", label: dict.nav.news },
    { href: "/appointment", label: dict.nav.appointment },
    { href: "/contact", label: dict.nav.contact }
  ];
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="container h-14 flex items-center justify-between">
        <Link href={`/${lang}`} className="font-bold">{dict.brand}</Link>
        <ul className="hidden md:flex gap-6">
          {links.map(l => (
            <li key={l.href}>
              <Link href={base(l.href)} className={`navlink ${path === base(l.href) ? "navlink-active" : ""}`}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link href={base("/appointment")} className="btn hidden sm:inline-flex">{dict.nav.appointment}</Link>
          <LangSwitcher current={lang} />
        </div>
      </nav>
    </header>
  );
}
