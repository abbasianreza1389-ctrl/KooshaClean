import { testimonials } from "../lib/demo";
export default function Testimonials(){
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map(t=>(
        <figure key={t.name} className="card">
          <blockquote className="text-sm leading-7">“{t.text}”</blockquote>
          <figcaption className="mt-3 text-sm text-muted">— {t.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}
