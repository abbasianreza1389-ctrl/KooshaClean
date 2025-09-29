export default function Home(){
  return (
    <section className="space-y-6">
      <div className="rounded-2xl p-6">
        <h1 className="text-3xl font-bold">به کوشا خوش آمدید</h1>
        <p className="text-slate-600 mt-2">کلینیک هوشمند توانبخشی و خدمات سلامت.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <a className="p-4 rounded-xl border" href="/services">خدمات</a>
        <a className="p-4 rounded-xl border" href="/doctors">پزشکان</a>
        <a className="p-4 rounded-xl border" href="/posts">اخبار و مقالات</a>
      </div>
    </section>
  );
}
