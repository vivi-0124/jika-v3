'use client';

import { ArrowLeft, User, Mail, Calendar, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import Aurora from '@/components/blocks/backgrounds/Aurora/Aurora';
import AuthGuard from '@/components/AuthGuard';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
      window.location.href = '/login';
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex flex-col min-h-screen relative overflow-hidden">
        {/* オーロラ背景 */}
        <div className="fixed inset-0 z-0 bg-black">
          <Aurora
            colorStops={["#000066", "#eb6d9a", "#000066"]}
            amplitude={1.0}
            blend={0.5}
            speed={1.0}
          />
        </div>

        {/* ヘッダー */}
        <header className="bg-transparent backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              <h1 className="text-xl font-bold text-white">プロフィール</h1>
              <div className="w-10"></div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 container mx-auto px-6 py-8 relative z-10">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* プロフィール情報 */}
            <Card className="border-0 shadow-2xl bg-transparent backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/60 text-sm">名前</Label>
                  <div className="bg-black/20 border border-white/20 rounded-md px-3 py-2 text-white">
                    {user?.user_metadata?.name || '未設定'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white/60 text-sm flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    メールアドレス
                  </Label>
                  <div className="bg-black/20 border border-white/20 rounded-md px-3 py-2 text-white">
                    {user?.email || '未設定'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/60 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    学年・学期
                  </Label>
                  <div className="bg-black/20 border border-white/20 rounded-md px-3 py-2 text-white">
                    {user?.user_metadata?.grade || '未設定'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/60 text-sm flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    学部
                  </Label>
                  <div className="bg-black/20 border border-white/20 rounded-md px-3 py-2 text-white">
                    {user?.user_metadata?.department || '未設定'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アカウント管理 */}
            <Card className="border-0 shadow-2xl bg-transparent backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">アカウント管理</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  ログアウト
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 