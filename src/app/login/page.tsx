'use client';

import LoginForm1 from '@/components/mvpblocks/login-form1';
import AuthGuard from '@/components/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <LoginForm1 />
    </AuthGuard>
  );
} 