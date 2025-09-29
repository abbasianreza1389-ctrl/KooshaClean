export const metadata = { title: 'کلینیک کوشا', description: 'وب‌سایت رسمی کلینیک' };
export default function RootLayout({ children }: {children: React.ReactNode}){
  return (
    <html lang="fa" dir="rtl">
      <body>
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
