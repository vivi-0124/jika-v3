'use client';
import { Eye, EyeOff, User } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Aurora from '@/components/blocks/backgrounds/Aurora/Aurora';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Aurora背景をメモ化して不要な再描画を防ぐ
const MemoizedAurora = memo(() => (
  <div className="fixed inset-0 z-0 bg-black">
    <Aurora
      colorStops={["#000066", "#eb6d9a", "#000066"]}
      amplitude={1.0}
      blend={0.5}
      speed={1.0}
    />
  </div>
));
MemoizedAurora.displayName = 'MemoizedAurora';

// パスワード入力フィールドをメモ化
const PasswordField = memo(({ 
  id, 
  label, 
  value, 
  onChange, 
  showPassword, 
  onToggleShow, 
  placeholder, 
  isLoading 
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  placeholder: string;
  isLoading: boolean;
}) => (
  <div className="relative">
    <Label htmlFor={id} className="font-medium text-white">{label}</Label>
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={isLoading}
        className="mt-2 w-full rounded-lg border-white/20 bg-black/20 backdrop-blur-sm px-3 py-2 pr-10 shadow-sm outline-none focus:border-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder:text-white/60"
        placeholder={placeholder}
        minLength={6}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggleShow}
        disabled={isLoading}
        className="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center justify-center h-8 w-8 p-0"
      >
        {showPassword ? ( 
          <EyeOff size={20} className="text-secondary" /> 
        ) : ( 
          <Eye size={20} className="text-secondary" />
        )}
      </Button>
    </div>
  </div>
));
PasswordField.displayName = 'PasswordField';

// Googleアイコンをメモ化
const GoogleIcon = memo(() => (
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
));
GoogleIcon.displayName = 'GoogleIcon';

export default function LoginForm1() {
  // フォーム状態を統合
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    error: '',
    isSignUp: false
  });

  const { signIn, signUp, signInWithGoogle, signInAnonymously } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータからエラーメッセージを取得
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError && !formState.error) {
      setFormState(prev => ({ 
        ...prev, 
        error: '認証に失敗しました。もう一度お試しください。' 
      }));
    }
  }, [searchParams, formState.error]);

  // ハンドラー関数をメモ化
  const handleEmailChange = useCallback((value: string) => {
    setFormState(prev => ({ ...prev, email: value }));
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setFormState(prev => ({ ...prev, password: value }));
  }, []);

  const handleConfirmPasswordChange = useCallback((value: string) => {
    setFormState(prev => ({ ...prev, confirmPassword: value }));
  }, []);

  const toggleShowPassword = useCallback(() => {
    setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setFormState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  }, []);

  const toggleSignUp = useCallback(() => {
    setFormState(prev => ({ 
      ...prev, 
      isSignUp: !prev.isSignUp,
      error: '',
      password: '',
      confirmPassword: ''
    }));
  }, []);

  const getJapaneseErrorMessage = useCallback((errorMessage: string): string => {
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
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));

    // サインアップ時のパスワード確認
    if (formState.isSignUp && formState.password !== formState.confirmPassword) {
      setFormState(prev => ({ 
        ...prev, 
        error: 'パスワードが一致しません。',
        isLoading: false 
      }));
      return;
    }

    try {
      const { error: authError } = formState.isSignUp 
        ? await signUp(formState.email, formState.password)
        : await signIn(formState.email, formState.password);

      if (authError) {
        const errorMessage = getJapaneseErrorMessage(authError.message);
        setFormState(prev => ({ ...prev, error: errorMessage }));
      } else {
        if (formState.isSignUp) {
          setFormState(prev => ({ ...prev, error: '' }));
          alert('確認メールを送信しました。メールを確認してアカウントを有効化してください。');
        } else {
          router.push('/');
        }
      }
    } catch {
      setFormState(prev => ({ ...prev, error: '予期しないエラーが発生しました。' }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  }, [formState.email, formState.password, formState.confirmPassword, formState.isSignUp, signIn, signUp, router, getJapaneseErrorMessage]);

  const handleGoogleSignIn = useCallback(async () => {
    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));
    const { error } = await signInWithGoogle();
    if (error) {
      setFormState(prev => ({ 
        ...prev, 
        error: getJapaneseErrorMessage(error.message),
        isLoading: false 
      }));
    }
  }, [signInWithGoogle, getJapaneseErrorMessage]);

  const handleAnonymousSignIn = useCallback(async () => {
    setFormState(prev => ({ ...prev, isLoading: true, error: '' }));
    const { error } = await signInAnonymously();
    if (error) {
      setFormState(prev => ({ 
        ...prev, 
        error: getJapaneseErrorMessage(error.message),
        isLoading: false 
      }));
    }
  }, [signInAnonymously, getJapaneseErrorMessage]);

  const handleForgotPassword = useCallback(() => {
    router.push('/forgot-password');
  }, [router]);

  // メモ化された値
  const cardTitle = useMemo(() => 
    formState.isSignUp ? 'アカウントを作成' : 'アカウントにログイン',
    [formState.isSignUp]
  );

  const cardSubtitle = useMemo(() => 
    formState.isSignUp ? '既にアカウントをお持ちですか？' : 'アカウントをお持ちでないですか？',
    [formState.isSignUp]
  );

  const toggleButtonText = useMemo(() =>
    formState.isSignUp ? 'ログイン' : 'サインアップ',
    [formState.isSignUp]
  );

  const submitButtonText = useMemo(() =>
    formState.isLoading ? '処理中...' : (formState.isSignUp ? 'アカウントを作成' : 'ログイン'),
    [formState.isLoading, formState.isSignUp]
  );

  const passwordPlaceholder = useMemo(() =>
    formState.isSignUp ? "6文字以上のパスワード" : "パスワードを入力",
    [formState.isSignUp]
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center relative overflow-hidden">
      {/* オーロラ背景をメモ化 */}
      <MemoizedAurora />
      
      <div className="w-full space-y-4 sm:max-w-md relative z-10">
        <Card className="border-0 shadow-2xl bg-transparent">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold sm:text-3xl text-white">
              {cardTitle}
            </CardTitle>
            <p className="text-white/80">
              {cardSubtitle}{' '}
              <Button
                onClick={toggleSignUp}
                variant="link"
                className="font-medium text-rose-600 hover:text-rose-500 p-0 h-auto"
                disabled={formState.isLoading}
              >
                {toggleButtonText}
              </Button>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {formState.error && (
              <Alert variant="destructive">
                <AlertDescription>{formState.error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-x-3">
              <Button 
                onClick={handleGoogleSignIn}
                disabled={formState.isLoading}
                variant="outline"
                className="flex items-center justify-center bg-black/20 backdrop-blur-sm"
              >
                <GoogleIcon />
              </Button>
              <Button 
                onClick={handleAnonymousSignIn}
                disabled={formState.isLoading}
                variant="outline"
                className="flex items-center justify-center text-white bg-black/20 backdrop-blur-sm"
              >
                <User size={24} />
              </Button>
            </div>
            <div className="relative">
              <Separator className="block h-px w-full bg-secondary" />
              <p className="absolute inset-x-0 -top-2 mx-auto inline-block w-fit px-2 text-sm bg-background">
                または
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="font-medium text-white">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  disabled={formState.isLoading}
                  className="mt-2 w-full rounded-lg border-white/20 bg-black/20 backdrop-blur-sm px-3 py-2 shadow-sm outline-none focus:border-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder:text-white/60"
                  placeholder="example@email.com"
                />
              </div>
              
              <PasswordField
                id="password"
                label="パスワード"
                value={formState.password}
                onChange={handlePasswordChange}
                showPassword={formState.showPassword}
                onToggleShow={toggleShowPassword}
                placeholder={passwordPlaceholder}
                isLoading={formState.isLoading}
              />
              
              {formState.isSignUp && (
                <PasswordField
                  id="confirmPassword"
                  label="パスワード確認"
                  value={formState.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  showPassword={formState.showConfirmPassword}
                  onToggleShow={toggleShowConfirmPassword}
                  placeholder="パスワードを再入力"
                  isLoading={formState.isLoading}
                />
              )}
              
              <Button 
                type="submit"
                disabled={formState.isLoading}
                className="w-full rounded-lg bg-rose-600 px-4 py-2 font-medium text-white duration-150 hover:bg-rose-500 active:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitButtonText}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {!formState.isSignUp && (
          <div className="text-center">
            <Button 
              onClick={handleForgotPassword}
              variant="link"
              className="text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={formState.isLoading}
            >
              パスワードを忘れた場合
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}