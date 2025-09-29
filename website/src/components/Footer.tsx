export default function Footer(){
  return (
    <footer className="mt-16 border-t bg-white/60">
      <div className="container py-6 text-sm flex flex-wrap gap-4 justify-between">
        <div>© {new Date().getFullYear()} کلینیک کوشا</div>
        <div className="flex gap-4">
          <a className="navlink" href="/privacy">حریم خصوصی</a>
          <a className="navlink" href="/about">درباره</a>
          <a className="navlink" href="/faq">سوالات متداول</a>
        </div>
      </div>
    </footer>
  )
}
