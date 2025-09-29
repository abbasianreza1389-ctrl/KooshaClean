'use client'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

export default function Home(){
  const t = useTranslations('home')
  const nav = useTranslations('nav')
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-slate-600">{t('subtitle')}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Link className="p-4 rounded-xl border" href="./book">{nav('book')}</Link>
        <Link className="p-4 rounded-xl border" href="./portal/patient">{nav('patient')}</Link>
        <Link className="p-4 rounded-xl border" href="./portal/reception">{nav('reception')}</Link>
        <Link className="p-4 rounded-xl border" href="./portal/therapist">{nav('therapist')}</Link>
        <Link className="p-4 rounded-xl border" href="./services">{nav('services')}</Link>
        <Link className="p-4 rounded-xl border" href="./doctors">{nav('doctors')}</Link>
        <Link className="p-4 rounded-xl border" href="./posts">{nav('posts')}</Link>
      </div>
    </section>
  )
}
