'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthGuard from '@/components/AuthGuard';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processResetToken = async () => {
      try {
        // URLパラメータからトークンを取得
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        // URLハッシュからもトークンを取得（フォールバック）
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');

        const finalAccessToken = accessToken || hashAccessToken;
        const finalRefreshToken = refreshToken || hashRefreshToken;

        console.log('Processing reset tokens...'); // デバッグ用
        console.log('Access token exists:', !!finalAccessToken); // デバッグ用
        console.log('Refresh token exists:', !!finalRefreshToken); // デバッグ用

        if (finalAccessToken && finalRefreshToken) {
          // セッションを設定
          const { error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken,
          });

          if (error) {
            console.error('Session setting error:', error); // デバッグ用
            setError('セッションの設定に失敗しました。新しいパスワードリセットを要求してください。');
          } else {
            console.log('Session set successfully'); // デバッグ用
          }
        } else {
          console.log('No tokens found in URL'); // デバッグ用
          setError('無効なリセットリンクです。新しいパスワードリセットを要求してください。');
        }
      } catch (err) {
        console.error('Token processing error:', err); // デバッグ用
        setError('トークンの処理中にエラーが発生しました。');
      } finally {
        setIsProcessing(false);
      }
    };

    processResetToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Updating password...'); // デバッグ用
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Password update error:', error); // デバッグ用
        setError('パスワードの更新に失敗しました。もう一度お試しください。');
      } else {
        console.log('Password updated successfully'); // デバッグ用
        setMessage('パスワードが正常に更新されました。ログインページに移動します。');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err); // デバッグ用
      setError('予期しないエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isProcessing) {
    return (
      <AuthGuard requireAuth={false}>
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background sm:px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
            <p className="mt-4 text-lg">リセットリンクを処理中...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

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
                <CardTitle className="text-2xl">新しいパスワードを設定</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                新しいパスワードを入力してください。
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
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">新しいパスワード</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6文字以上のパスワード"
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 mr-1 h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワードを再入力</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="パスワードを再入力"
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 mr-1 h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? '更新中...' : 'パスワードを更新'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background sm:px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-lg">読み込み中...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 