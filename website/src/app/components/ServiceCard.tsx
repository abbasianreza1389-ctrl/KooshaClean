import type { Service } from "../lib/demo";
export default function ServiceCard({ s }:{ s:Service }){
  return (
    <a href={`/services/${s.slug}`} className="block card hover:-translate-y-1 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-lg">{s.title}</h3>
        <span className="text-xs bg-slate-100 rounded-full px-2 py-1">{s.price}</span>
      </div>
      <p className="text-sm text-muted mt-2">{s.desc}</p>
      <span className="mt-4 inline-flex text-brand">جزئیات →</span>
    </a>
  );
}
