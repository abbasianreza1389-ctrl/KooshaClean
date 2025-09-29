"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxHero(){
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset:["start start","end start"] });
  const y1 = useTransform(scrollYProgress, [0,1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0,1], [0,-60]);
  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y:y1 }} className="absolute -z-10 inset-0 bg-gradient-to-b from-sky-50 via-white to-white"/>
      <div className="container py-12">
        <div className="card bg-gradient-to-l from-sky-100 to-white ring-1 ring-sky-100 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black">به کوشا خوش آمدید</h1>
              <p className="text-muted mt-3">نوبت آنلاین، خدمات تشخیصی و درمانی، پیگیری هوشمند؛ همه در یک جا.</p>
              <div className="mt-6 flex gap-3">
                <a href="/appointment" className="btn">رزرو نوبت</a>
                <a href="/services" className="btn-outline">مشاهده خدمات</a>
              </div>
            </div>
            <motion.div style={{ y:y2 }} className="w-full md:w-80 h-40 rounded-2xl skeleton"/>
          </div>
        </div>
      </div>
    </section>
  );
}
