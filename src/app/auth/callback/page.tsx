'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Aurora from '@/components/blocks/backgrounds/Aurora/Aurora';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('認証エラー:', error);
        router.push('/login?error=auth_error');
        return;
      }

      if (data.session) {
        router.push('/');
      } else {
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* オーロラ背景 */}
      <div className="fixed inset-0 z-0 bg-black">
        <Aurora
          colorStops={["#000066", "#eb6d9a", "#000066"]}
          amplitude={1.0}
          blend={0.5}
          speed={1.0}
        />
      </div>
      
      <Card className="border-0 shadow-2xl bg-black/20 backdrop-blur-md relative z-10">
        <CardContent className="text-center p-6">
          <Skeleton className="h-12 w-12 rounded-full mx-auto animate-pulse" />
          <p className="mt-4 text-lg text-white">認証中...</p>
        </CardContent>
      </Card>
    </div>
  );
} 