import { insurers } from "../../lib/demo";
export const metadata = { title:"بیمه‌های طرف قرارداد" };
export default function Insurers(){
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">بیمه‌های طرف قرارداد</h1>
      <div className="card flex flex-wrap gap-3">
        {insurers.map(n => <span key={n} className="px-3 py-1 bg-slate-100 rounded-full">{n}</span>)}
      </div>
    </>
  );
}
