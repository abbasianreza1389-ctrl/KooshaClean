import { pricing } from "../../lib/demo";
export const metadata = { title:"تعرفه‌ها" };
export default function Pricing(){
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">تعرفه خدمات</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b">
              <th className="py-3">خدمت</th><th>قیمت</th><th>توضیح</th>
            </tr>
          </thead>
          <tbody>
          {pricing.map((r,i)=>(
            <tr key={i} className="border-b last:border-0">
              <td className="py-3 font-medium">{r.title}</td>
              <td>{r.price}</td>
              <td className="text-muted">{r.note}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
