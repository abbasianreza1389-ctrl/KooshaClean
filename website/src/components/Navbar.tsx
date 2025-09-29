"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "خانه" },
  { href: "/services", label: "خدمات" },
  { href: "/doctors", label: "پزشکان" },
  { href: "/news", label: "اخبار" },
  { href: "/appointment", label: "نوبت‌دهی" },
  { href: "/contact", label: "تماس" },
];

export default function Navbar(){
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="container h-14 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl">کلینیک کوشا</Link>
        <ul className="hidden md:flex gap-6 text-sm">
          {links.map(l => (
            <li key={l.href}>
              <Link className={`navlink ${path === l.href ? "navlink-active" : ""}`} href={l.href}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/appointment" className="btn hidden md:inline-flex">رزرو نوبت</Link>
      </nav>
    </header>
  );
}
