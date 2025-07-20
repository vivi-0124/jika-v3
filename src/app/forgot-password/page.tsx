'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthGuard from '@/components/AuthGuard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // リダイレクトURLを明示的に指定
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('Redirect URL:', redirectUrl); // デバッグ用

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset error:', error); // デバッグ用
        setError('パスワードリセットメールの送信に失敗しました。メールアドレスをご確認ください。');
      } else {
        setMessage('パスワードリセット用のメールを送信しました。メールをご確認ください。');
        console.log('Password reset email sent successfully'); // デバッグ用
      }
    } catch (err) {
      console.error('Unexpected error:', err); // デバッグ用
      setError('予期しないエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background sm:px-4">
        <div className="w-full space-y-4 sm:max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl">パスワードをリセット</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {message && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? '送信中...' : 'パスワードリセットメールを送信'}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push('/login')}
                  disabled={isLoading}
                  className="text-sm"
                >
                  ログインページに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
} 