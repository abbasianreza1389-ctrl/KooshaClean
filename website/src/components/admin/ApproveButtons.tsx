export default function ApproveButtons({ onApprove, onReject, disabled }:{
  onApprove:()=>void; onReject:()=>void; disabled?:boolean;
}){
  return (
    <div className="flex gap-2">
      <button className="btn h-9 px-3" disabled={disabled} onClick={onApprove}>تایید</button>
      <button className="btn-ghost h-9 px-3" disabled={disabled} onClick={onReject}>رد</button>
    </div>
  );
}
