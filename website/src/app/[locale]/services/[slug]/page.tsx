const base = process.env.NEXT_PUBLIC_API_BASE!;
export default async function ServiceDetail({ params }: { params: { slug: string } }){
  const s = await fetch(`${base}/api/public/services/${params.slug}/`, { next: { revalidate: 120 } }).then(r=>r.json());
  return (
    <article className="prose prose-slate max-w-none">
      <h1>{s.title}</h1>
      <p className="lead">{s.desc}</p>
      <p>هزینهٔ پایه: {Number(s.price||0).toLocaleString("fa-IR")} ریال</p>
    </article>
  );
}
