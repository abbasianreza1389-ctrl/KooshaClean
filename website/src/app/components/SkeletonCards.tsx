export default function SkeletonCards({ n=6 }:{ n?:number }){
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({length:n}).map((_,i)=>(
        <div key={i} className="card">
          <div className="skeleton h-5 w-1/3" />
          <div className="skeleton h-4 w-2/3 mt-3" />
          <div className="skeleton h-4 w-1/2 mt-2" />
          <div className="skeleton h-8 w-24 mt-6" />
        </div>
      ))}
    </div>
  );
}
