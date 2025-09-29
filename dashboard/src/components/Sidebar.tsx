import Link from "next/link";
const items = [
  { href: "/", label: "داشبورد" },
  { href: "/calendar", label: "تقویم نوبت‌ها" },
  { href: "/patients", label: "بیماران" },
  { href: "/billing", label: "مالی/صندوق" },
  { href: "/reports", label: "گزارش‌ها" }
];
export default function Sidebar(){
  return (
    <aside className="bg-white border-l p-4">
      <div className="font-bold mb-4">مدیریت کوشا</div>
      <ul className="space-y-2">{items.map(i=>(
        <li key={i.href}><Link className="navlink block" href={i.href}>{i.label}</Link></li>
      ))}</ul>
    </aside>
  );
}
