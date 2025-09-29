export default function Topbar(){
  return (
    <div className="h-14 bg-white border-b px-4 flex items-center justify-between">
      <div className="text-sm text-muted">سلام! امروز {new Date().toLocaleDateString("fa-IR")}</div>
      <div className="flex gap-3">
        <button className="btn-ghost">راهنما</button>
        <button className="btn">خروج</button>
      </div>
    </div>
  );
}
