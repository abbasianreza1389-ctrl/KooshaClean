'use client'
import Link from 'next/link'
export default function Home(){
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">کلینیک کوشا</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <Link className="p-4 rounded-xl border" href="./book">رزرو وقت</Link>
        <Link className="p-4 rounded-xl border" href="./portal/patient">پرتال بیمار</Link>
        <Link className="p-4 rounded-xl border" href="./services">خدمات</Link>
        <Link className="p-4 rounded-xl border" href="./doctors">پزشکان</Link>
        <Link className="p-4 rounded-xl border" href="./posts">اخبار</Link>
      </div>
    </section>
  )
}
