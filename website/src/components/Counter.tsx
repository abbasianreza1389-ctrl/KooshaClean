"use client";
import { useEffect } from "react";
import { motion, useAnimation, useMotionValue, animate } from "framer-motion";
export default function Counter({ value }:{ value:number }) {
  const mv = useMotionValue(0); const controls = useAnimation();
  useEffect(()=>{ const c = animate(0, value, { duration:1.2 }); c.on("update", v=>mv.set(v)); return ()=>c.stop(); },[value]);
  return <motion.span animate={controls}>{Math.round(mv.get())}</motion.span>;
}
