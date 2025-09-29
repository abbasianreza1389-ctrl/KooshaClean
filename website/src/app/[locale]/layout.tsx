import "../globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { t, Lang } from "@/lib/dict";

export const metadata: Metadata = { title: "کلینیک کوشا", description: "وب‌سایت رسمی کلینیک کوشا" };

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: Lang } }) {
  const lang = params.locale;
  const dict = t(lang);
  return (
    <html lang={lang} dir={lang === "en" ? "ltr" : "rtl"}>
      <body>
        <Navbar lang={lang} dict={dict} />
        <main className="container py-8">{children}</main>
        <Footer dict={dict} />
      </body>
    </html>
  );
}
