const base = process.env.NEXT_PUBLIC_API_BASE!;
export default async function Post({ params }: { params: { slug:string } }){
  const p = await fetch(`${base}/api/public/posts/${params.slug}/`, { next: { revalidate: 120 } }).then(r=>r.json());
  return (
    <article className="prose prose-slate max-w-none">
      <h1>{p.title}</h1>
      <p className="lead">{p.excerpt}</p>
      <div dangerouslySetInnerHTML={{ __html: p.body || "…" }} />
    </article>
  );
}
