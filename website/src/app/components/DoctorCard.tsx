import type { Doctor } from "../lib/demo";
export default function DoctorCard({ d }:{ d:Doctor }){
  return (
    <div className="card hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
        <div>
          <div className="font-semibold">{d.name}</div>
          <div className="text-sm text-muted">{d.role}</div>
        </div>
      </div>
      <p className="text-sm mt-3">{d.bio}</p>
    </div>
  );
}
