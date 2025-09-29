import Link from "next/link";

export default function Hero({ dict, lang }: { dict: any; lang: "fa"|"en"|"ar" }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-100 to-white p-10">
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-black mb-2">{dict.hero.title}</h1>
        <p className="text-muted max-w-2xl">{dict.hero.lead}</p>
        <div className="mt-6 flex gap-3">
          <Link href={`/${lang}/appointment`} className="btn">{dict.hero.cta1}</Link>
          <Link href={`/${lang}/services`} className="btn-ghost">{dict.hero.cta2}</Link>
        </div>
      </div>
      <div className="absolute -left-20 -top-20 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl"></div>
      <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-sky-300/40 rounded-full blur-3xl"></div>
    </section>
  );
}
