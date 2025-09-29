'use client'
import {useState} from 'react'
import {API_BASE} from '@/src/lib/api'
import {useTranslations} from 'next-intl'

export default function Login(){
  const t = useTranslations('login')
  const [username,setU]=useState(''); const [password,setP]=useState('')
  const [msg,setMsg]=useState<string>('')
  async function submit(e:any){
    e.preventDefault()
    const res = await fetch(`${API_BASE}/api/auth/jwt/create/`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username, password}) })
    if(res.ok){
      const data = await res.json()
      localStorage.setItem('jwt', data.access)
      setMsg(t('ok') as string)
    } else {
      setMsg('خطا در ورود')
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div><label>{t('username')}</label><input value={username} onChange={e=>setU(e.target.value)} /></div>
      <div><label>{t('password')}</label><input type="password" value={password} onChange={e=>setP(e.target.value)} /></div>
      <button type="submit">{t('login')}</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}
