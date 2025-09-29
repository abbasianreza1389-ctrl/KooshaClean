import Testimonials from "../../components/Testimonials";
export const metadata = { title:"نظرات بیماران" };
export default function Page(){
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">نظرات بیماران</h1>
      <Testimonials />
    </>
  );
}
