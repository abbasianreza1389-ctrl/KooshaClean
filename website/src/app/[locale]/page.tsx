import Hero from "@/components/Hero";
import Section from "@/components/Section";
import { Lang } from "@/lib/dict";

const base = process.env.NEXT_PUBLIC_API_BASE!;

async function getData() {
  const [s, p] = await Promise.all([
    fetch(`${base}/api/public/services/`, { next: { revalidate: 60 } }).then(r=>r.json()),
    fetch(`${base}/api/public/posts/`,    { next: { revalidate: 60 } }).then(r=>r.json())
  ]);
  return { services: s, posts: p };
}

export default async function Home({ params }: { params: { locale: Lang } }) {
  const { services, posts } = await getData();
  const lang = params.locale;
  return (
    <div className="space-y-10">
      <Hero dict={{hero:{title:"به کوشا خوش آمدید",lead:"کلینیک هوشمند…",cta1:"رزرو نوبت",cta2:"خدمات"}}} lang={lang}/>
      <Section title="خدمات پرمراجعه">
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s:any)=>(
            <a key={s.id} href={`/${lang}/services/${s.slug}`} className="card hover:shadow-lg">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-muted text-sm">{s.desc}</p>
              <div className="text-sm mt-3 text-brand">{s.price?.toLocaleString("fa-IR")}</div>
            </a>
          ))}
        </div>
      </Section>
      <Section title="خبرها و مقالات">
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((p:any)=>(
            <a key={p.id} href={`/${lang}/news/${p.slug}`} className="card hover:shadow-lg">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-muted text-sm">{p.excerpt}</p>
              <div className="text-xs mt-3">{p.date}</div>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
