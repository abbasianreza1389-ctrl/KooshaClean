export default function Hero(){
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-sky-100 to-white p-10">
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-black mb-3">به کوشا خوش آمدید</h1>
        <p className="text-muted max-w-2xl">کلینیک هوشمند با تیم متخصص؛ نوبت‌دهی آنلاین، پرونده الکترونیک و خدمات جامع درمانی.</p>
        <div className="mt-6 flex gap-3">
          <a className="btn" href="/appointment">رزرو نوبت</a>
          <a className="btn-ghost" href="/services">خدمات</a>
        </div>
      </div>
      <div className="absolute -left-20 -top-20 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl"></div>
      <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-sky-300/40 rounded-full blur-3xl"></div>
    </section>
  )
}
