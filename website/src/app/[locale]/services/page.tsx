const base = process.env.NEXT_PUBLIC_API_BASE!;
export default async function Services(){
  const list = await fetch(`${base}/api/public/services/`, { next: { revalidate: 120 } }).then(r=>r.json());
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">خدمات کلینیک</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {list.map((s:any)=>(
          <a key={s.id} href={`./services/${s.slug}`} className="card hover:shadow-lg">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-muted text-sm">{s.desc}</p>
            <div className="text-sm mt-3 text-brand">{s.price?.toLocaleString("fa-IR")}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
