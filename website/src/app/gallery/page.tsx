import { gallery } from "../../lib/demo";
export const metadata = { title:"گالری" };
export default function Gallery(){
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">گالری محیط</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {gallery.map((g,i)=>(
          <figure key={i} className="card aspect-video bg-slate-100 flex items-center justify-center">
            <span className="text-muted">{g.alt}</span>
          </figure>
        ))}
      </div>
    </>
  );
}
