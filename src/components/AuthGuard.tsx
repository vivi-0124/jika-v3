'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !isRedirecting) {
      if (requireAuth && !user) {
        setIsRedirecting(true);
        // 少し遅延を入れてリダイレクトを実行
        setTimeout(() => {
          router.push('/login');
        }, 100);
      } else if (!requireAuth && user) {
        setIsRedirecting(true);
        // 少し遅延を入れてリダイレクトを実行
        setTimeout(() => {
          router.push('/');
        }, 100);
      }
    }
  }, [user, loading, requireAuth, router, isRedirecting]);

  if (loading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-lg">
            {isRedirecting ? 'リダイレクト中...' : '読み込み中...'}
          </p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-lg">ログインページに移動中...</p>
        </div>
      </div>
    );
  }

  if (!requireAuth && user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-lg">ホームページに移動中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 