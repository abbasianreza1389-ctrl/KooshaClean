export const metadata = { title:"تماس با ما" };
import MapLeaflet from "../../components/MapLeaflet";

export default function Contact(){
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تماس با ما</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-2">اطلاعات</h3>
          <p className="text-muted text-sm">تهران، ... خیابان ... پلاک ...</p>
          <p className="text-muted text-sm mt-1">۰۲۱-xxxxxxx</p>
          <p className="text-muted text-sm mt-1">ایمیل: info@example.com</p>
          <form className="mt-4 grid gap-3">
            <input className="input" placeholder="نام"/>
            <input className="input" placeholder="ایمیل"/>
            <textarea className="input h-24" placeholder="پیام شما..."/>
            <button className="btn w-max">ارسال</button>
          </form>
        </div>
        <MapLeaflet />
      </div>
    </div>
  );
}
