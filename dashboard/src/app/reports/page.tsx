export default function Reports(){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card">
        <div className="font-semibold mb-2">گزارش عملکرد درمانگر</div>
        <div className="h-48 bg-slate-100 rounded-xl"></div>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">گزارش درآمد/بیمه</div>
        <div className="h-48 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );
}
