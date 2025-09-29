export const metadata = { title: "سوالات متداول" };
const faqs = [
  { q: "چطور نوبت رزرو کنم؟", a: "از منوی بالا > نوبت‌دهی." },
  { q: "بیمه‌های طرف قرارداد؟", a: "در صفحهٔ خدمات/بیمه‌ها فهرست شده است." },
];
export default function FAQ(){
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">سوالات متداول</h1>
      <div className="space-y-3">
        {faqs.map((f,i)=>(
          <details key={i} className="card">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
