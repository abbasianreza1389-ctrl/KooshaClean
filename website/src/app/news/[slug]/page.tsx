import { services } from "../../../lib/demo";
export async function generateStaticParams(){ return services.map(s=>({ slug:s.slug })); }

export async function generateMetadata({ params }:{ params:{ slug:string } }){
  const s = services.find(x=>x.slug===params.slug);
  return { title: s ? s.title : "خدمت" };
}

export default function ServiceDetail({ params }:{ params:{ slug:string } }){
  const s = services.find(x=>x.slug===params.slug)!;
  return (
    <article className="prose prose-slate max-w-none">
      <h1>{s.title}</h1>
      <p className="lead">{s.desc}</p>
      <p><strong>تعرفه:</strong> {s.price}</p>
      <a className="btn mt-4" href="/appointment">رزرو نوبت مرتبط</a>
    </article>
  );
}
