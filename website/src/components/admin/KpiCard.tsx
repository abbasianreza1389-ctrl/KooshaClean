export default function KpiCard({ label, value, hint }:{label:string; value:string; hint?:string}){
  return (
    <div className="card">
      <div className="text-sm text-muted">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {hint && <div className="text-xs text-muted mt-2">{hint}</div>}
    </div>
  );
}
