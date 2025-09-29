const base = process.env.NEXT_PUBLIC_API_BASE!;
export default async function Doctors(){
  const list = await fetch(`${base}/api/public/doctors/`, { next: { revalidate: 120 } }).then(r=>r.json());
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">پزشکان و درمانگران</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {list.map((d:any)=>(
          <div key={d.id} className="card">
            <div className="h-36 bg-slate-100 rounded-xl mb-4" />
            <h3 className="font-semibold">{d.name}</h3>
            <p className="text-muted text-sm">{d.role} — {d.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
