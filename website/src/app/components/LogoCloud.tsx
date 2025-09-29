import { insurers } from "../lib/demo";
export default function LogoCloud(){
  return (
    <div className="card flex flex-wrap items-center gap-3">
      {insurers.map(n => <span key={n} className="px-3 py-1 rounded-full bg-slate-100 text-sm">{n}</span>)}
    </div>
  );
}
