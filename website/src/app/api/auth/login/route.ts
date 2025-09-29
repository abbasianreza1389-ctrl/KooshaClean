import {NextResponse} from 'next/server';

export async function POST(req:Request){
  const {username, password} = await req.json();
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/token/`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  });
  if(!r.ok) return NextResponse.json({ok:false}, {status:401});
  const data = await r.json();
  const res = NextResponse.json({ok:true});
  res.cookies.set('access', data.access, {httpOnly:true, sameSite:'lax', path:'/', maxAge:3600});
  res.cookies.set('refresh', data.refresh, {httpOnly:true, sameSite:'lax', path:'/', maxAge:60*60*24*7});
  return res;
}
