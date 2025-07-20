'use client';

import { useState } from 'react';
import { ArrowLeft, Save, User, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import Aurora from '@/components/blocks/backgrounds/Aurora/Aurora';
import AuthGuard from '@/components/AuthGuard';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    grade: user?.user_metadata?.grade || '3年前期',
    department: user?.user_metadata?.department || '国際文化学部',
  });

  const handleSave = async () => {
    // TODO: プロフィール更新の実装
    console.log('プロフィールを更新:', formData);
    router.push('/');
  };

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
              <h1 className="text-xl font-bold text-white">プロフィール編集</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Save className="h-4 w-4" />
              </Button>
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
                  <Label htmlFor="name" className="text-white">名前</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                    placeholder="名前を入力"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-black/20 border-white/20 text-white/60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    学年・学期
                  </Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData({ ...formData, grade: value })}
                  >
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20 text-white">
                      <SelectItem value="1年前期">1年前期</SelectItem>
                      <SelectItem value="1年後期">1年後期</SelectItem>
                      <SelectItem value="2年前期">2年前期</SelectItem>
                      <SelectItem value="2年後期">2年後期</SelectItem>
                      <SelectItem value="3年前期">3年前期</SelectItem>
                      <SelectItem value="3年後期">3年後期</SelectItem>
                      <SelectItem value="4年前期">4年前期</SelectItem>
                      <SelectItem value="4年後期">4年後期</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-white">学部</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20 text-white">
                      <SelectItem value="国際文化学部">国際文化学部</SelectItem>
                      <SelectItem value="国際観光学部">国際観光学部</SelectItem>
                      <SelectItem value="スポーツ健康学部">スポーツ健康学部</SelectItem>
                      <SelectItem value="看護学部">看護学部</SelectItem>
                      <SelectItem value="健康情報学部">健康情報学部</SelectItem>
                    </SelectContent>
                  </Select>
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