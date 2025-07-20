import { test as base, type Page } from '@playwright/test';

// 認証済みのページコンテキストを作成するためのヘルパー
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // テスト環境用の環境変数を設定
    await page.addInitScript(() => {
      // テスト環境フラグを設定
      (window as any).__TEST_MODE__ = true;
      (window as any).__MOCK_AUTH__ = true;
    });
    
    // 認証をバイパスするために、ローカルストレージにモック認証情報を設定
    await page.goto('/');
    
    // ページが読み込まれた後、認証状態をモック
    await page.evaluate(() => {
      // モック認証セッションを作成
      const mockSession = {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };
      
      // ローカルストレージに認証情報を保存
      localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
      
      // 認証状態を強制的に設定
      (window as any).supabase = (window as any).supabase || {};
      (window as any).supabase.auth = (window as any).supabase.auth || {};
      (window as any).supabase.auth.getSession = () => Promise.resolve({ data: { session: mockSession }, error: null });
      (window as any).supabase.auth.getUser = () => Promise.resolve({ data: { user: mockSession.user }, error: null });
      (window as any).supabase.auth.onAuthStateChange = (callback: any) => {
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: () => {} } } };
      };
    });
    
    // ページを再読み込みして認証状態を反映
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 検索タブに切り替え
    await page.locator('[data-testid="search-tab"]').click();
    await page.waitForLoadState('networkidle');
    
    await use(page);
  },
});

export { expect } from '@playwright/test'; 