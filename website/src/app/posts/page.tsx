import Link from 'next/link'
export default function PostsPage(){
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">اخبار و مقالات</h1>
      <p>این صفحه به‌زودی از API پر می‌شود.</p>
      <Link href="/" className="underline">بازگشت</Link>
    </section>
  )
}
