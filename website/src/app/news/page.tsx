import { posts } from "../../lib/demo";
export const metadata = { title:"اخبار و مقالات" };
export default function News(){
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">اخبار و مقالات</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map(p=>(
          <article key={p.slug} className="card">
            <div className="text-xs text-muted">{p.date}</div>
            <h3 className="font-semibold mt-2">{p.title}</h3>
            <p className="text-sm text-muted mt-1">{p.excerpt}</p>
            <a className="btn-ghost mt-4 inline-flex" href={`/news/${p.slug}`}>مطالعه</a>
          </article>
        ))}
      </div>
    </>
  );
}
