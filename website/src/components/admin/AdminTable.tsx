export default function AdminTable({ columns, rows }:{ columns:{key:string; title:string}[]; rows:any[] }){
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-right text-muted">
            {columns.map(c=> <th key={c.key} className="py-2 px-3">{c.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length===0 && (
            <tr><td className="py-6 px-3 text-muted" colSpan={columns.length}>موردی یافت نشد.</td></tr>
          )}
          {rows.map((r,i)=>(
            <tr key={i} className="border-t">
              {columns.map(c=> <td key={c.key} className="py-2 px-3">{(r as any)[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
