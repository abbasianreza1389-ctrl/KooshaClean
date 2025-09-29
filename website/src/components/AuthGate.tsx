"use client";
import { useEffect, useState } from "react";
import { getToken, getRole } from "../lib/auth";
export default function AuthGate({ children, allow }:{ children:React.ReactNode; allow?:string[] }){
  const [ok,setOk] = useState(false);
  useEffect(()=>{
    const t = getToken(); const r = getRole();
    if (!t) { window.location.href="/login"; return; }
    if (allow && allow.length && !allow.includes(r||"")) { window.location.href="/"; return; }
    setOk(true);
  },[]);
  if (!ok) return null;
  return <>{children}</>;
}
