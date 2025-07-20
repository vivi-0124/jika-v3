'use client';
import { Github, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginForm1() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータからエラーメッセージを取得
  const urlError = searchParams.get('error');
  if (urlError && !error) {
    setError('認証に失敗しました。もう一度お試しください。');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (authError) {
        // エラーメッセージを日本語に変換
        const errorMessage = getJapaneseErrorMessage(authError.message);
        setError(errorMessage);
      } else {
        if (isSignUp) {
          setError('');
          alert('確認メールを送信しました。メールを確認してアカウントを有効化してください。');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setError('予期しないエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(getJapaneseErrorMessage(error.message));
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError('');
    const { error } = await signInWithGithub();
    if (error) {
      setError(getJapaneseErrorMessage(error.message));
      setIsLoading(false);
    }
  };

  const getJapaneseErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'メールアドレスまたはパスワードが間違っています。';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'メールアドレスが確認されていません。確認メールをご確認ください。';
    }
    if (errorMessage.includes('Password should be at least 6 characters')) {
      return 'パスワードは6文字以上で入力してください。';
    }
    if (errorMessage.includes('User already registered')) {
      return 'このメールアドレスは既に登録されています。';
    }
    if (errorMessage.includes('Invalid email')) {
      return '有効なメールアドレスを入力してください。';
    }
    return errorMessage;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background sm:px-4">
      <div className="w-full space-y-4 sm:max-w-md">
        <div className="text-center">
          <div className="mt-5 space-y-2">
            <h3 className="text-2xl font-bold sm:text-3xl">
              {isSignUp ? 'アカウントを作成' : 'アカウントにログイン'}
            </h3>
            <p className="">
              {isSignUp ? '既にアカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="font-medium text-rose-600 hover:text-rose-500"
                disabled={isLoading}
              >
                {isSignUp ? 'ログイン' : 'サインアップ'}
              </button>
            </p>
          </div>
        </div>

        <div className="space-y-6 p-4 py-6 shadow sm:rounded-lg sm:p-6 border">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-x-3">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center rounded-lg border py-2.5 duration-150 hover:bg-secondary active:bg-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_17_40)">
                  <path
                    d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                    fill="#34A853"
                  />
                  <path
                    d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                    fill="#FBBC04"
                  />
                  <path
                    d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                    fill="#EA4335"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>
            <button 
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="flex items-center justify-center rounded-lg border py-2.5 duration-150 hover:bg-secondary active:bg-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github size={24} />
            </button>
          </div>
          <div className="relative">
            <span className="block h-px w-full bg-secondary"></span>
            <p className="absolute inset-x-0 -top-2 mx-auto inline-block w-fit px-2 text-sm bg-background">
              または
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="font-medium">メールアドレス</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2 shadow-sm outline-none focus:border-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="example@email.com"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="font-medium">パスワード</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2 pr-10 shadow-sm outline-none focus:border-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={isSignUp ? "6文字以上のパスワード" : "パスワードを入力"}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 mr-3 mt-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? ( 
                    <EyeOff size={20} className="text-secondary" /> 
                  ) : ( 
                    <Eye size={20} className="text-secondary" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  パスワードは6文字以上で入力してください
                </p>
              )}
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-rose-600 px-4 py-2 font-medium text-white duration-150 hover:bg-rose-500 active:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '処理中...' : (isSignUp ? 'アカウントを作成' : 'ログイン')}
            </button>
          </form>
        </div>
        
        {!isSignUp && (
          <div className="text-center">
            <button 
              onClick={() => router.push('/forgot-password')}
              className="hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              パスワードを忘れた場合
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
