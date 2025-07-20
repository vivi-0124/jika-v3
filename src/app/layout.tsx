import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import { AuthProvider } from '@/contexts/AuthContext';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '大学時間割',
  description: '大学の授業検索・時間割管理アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <UserProvider>
            {children}
            <StagewiseToolbar
              config={{
                plugins: [ReactPlugin],
              }}
            />
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
