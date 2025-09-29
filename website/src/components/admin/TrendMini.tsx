export default function TrendMini({ data }:{ data:number[] }){
  if (!data?.length) return null;
  const w = 160, h = 48;
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v:number)=> (max===min ? h/2 : h - ((v - min) / (max - min)) * h);
  const step = w / (data.length - 1);
  const d = data.map((v,i)=> `${i===0 ? "M" : "L"} ${i*step},${norm(v)}`).join(" ");
  return (
    <svg width={w} height={h} className="mt-2">
      <path d={d} fill="none" stroke="#0284c7" strokeWidth="2" />
    </svg>
  );
}
