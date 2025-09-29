"use client";
import { motion, useReducedMotion } from "framer-motion";
export default function Reveal({ children, delay=0 }:{ children:React.ReactNode; delay?:number }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      whileInView={{ opacity:1, y:0 }}
      transition={{ duration:.45, ease:"easeOut", delay }}
      viewport={{ once:true, margin:"-50px" }}
    >
      {children}
    </motion.div>
  );
}
