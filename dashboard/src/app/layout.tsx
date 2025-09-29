import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="fa">
      <body className="bg-slate-50">
        <div className="grid grid-cols-[260px_1fr] min-h-screen">
          <Sidebar />
          <div>
            <Topbar />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
