export default function Card({ title, subtitle, children }: { title:string; subtitle?:string; children?: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-muted text-sm mb-3">{subtitle}</p>}
      {children}
    </div>
  );
}
