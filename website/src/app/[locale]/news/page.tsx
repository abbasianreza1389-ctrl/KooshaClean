const base = process.env.NEXT_PUBLIC_API_BASE!;
export default async function News(){
  const list = await fetch(`${base}/api/public/posts/`, { next: { revalidate: 120 } }).then(r=>r.json());
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">خبرها و مقالات</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {list.map((p:any)=>(
          <a key={p.id} href={`./news/${p.slug}`} className="card hover:shadow-lg">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-muted text-sm">{p.excerpt}</p>
            <div className="text-xs mt-3">{p.date}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
