import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({children, params:{locale}}:{children:React.ReactNode; params:{locale:string}}){
  const messages = await getMessages();
  const dir = locale==='fa' ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <main className="container mx-auto p-6">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
