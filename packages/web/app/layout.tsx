import './globals.css';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/ui/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LockerRoom AI - Ultimate Fantasy Football Platform',
  description: 'AI-powered fantasy football platform with advanced commissioner tools, real-time scoring, and intelligent assistants.',
  icons: {
    icon: [
      {
        url: '/logo.png',
        href: '/logo.png',
      }
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}