"use client";
import { useTheme } from "next-themes";

export default function ThemeToggle(){
  const {theme, setTheme} = useTheme();
  const next = theme==="light" ? "dark" : "light";
  return (
    <button className="rounded-lg border px-3 py-1"
      onClick={()=>setTheme(next)} title="Theme">
      {theme==="light" ? "تیره" : "روشن"}
    </button>
  );
}
