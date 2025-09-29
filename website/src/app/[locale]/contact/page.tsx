export const metadata = { title: "ارتباط با ما" };
export default function Contact(){
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ارتباط با ما</h1>
      <form className="grid md:grid-cols-2 gap-4">
        <input className="input" placeholder="نام" />
        <input className="input" placeholder="موبایل" />
        <textarea className="input min-h-32" placeholder="پیام شما..." />
        <button className="btn">ارسال</button>
      </form>
      <div className="card">
        <h3 className="font-semibold mb-2">اطلاعات تماس</h3>
        <p className="text-muted text-sm">اصفهان، … | 021-xxxxxxx</p>
      </div>
    </div>
  );
}
