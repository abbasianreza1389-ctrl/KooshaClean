import { stats } from "../lib/demo";
export default function Stats(){
  return (
    <div className="container grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(s=>(
        <div key={s.label} className="card text-center">
          <div className="text-2xl font-extrabold">{s.value}</div>
          <div className="text-muted text-sm mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
