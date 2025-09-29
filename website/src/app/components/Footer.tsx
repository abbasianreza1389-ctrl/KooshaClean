import Link from "next/link";

export default function Footer({ dict }: { dict: any }) {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="container py-6 flex flex-wrap gap-4 justify-between">
        <p className="text-muted">© {new Date().getFullYear()} {dict.brand} — {dict.footer.rights}</p>
        <div className="flex gap-4">
          <Link className="navlink" href="./privacy">{dict.footer.privacy}</Link>
          <Link className="navlink" href="./about">{dict.footer.about}</Link>
          <Link className="navlink" href="./news">{dict.footer.faq}</Link>
        </div>
      </div>
    </footer>
  );
}
