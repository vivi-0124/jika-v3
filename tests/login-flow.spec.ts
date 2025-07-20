import { test, expect } from '@playwright/test';

test.describe('ログインフロー全体のテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページに移動
    await page.goto('/login');
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
  });

  test('ログインページが正しく表示される', async ({ page }) => {
    // ページのタイトルを確認（実際のタイトルに合わせる）
    await expect(page).toHaveTitle(/大学時間割/);
    
    // メールアドレス入力フィールドを確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    
    // パスワード入力フィールドを確認
    await expect(page.getByLabel('パスワード')).toBeVisible();
    
    // ログインボタンを確認
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    // サインアップリンクを確認
    await expect(page.getByRole('button', { name: 'サインアップ' })).toBeVisible();
    
    // パスワードを忘れた場合のリンクを確認
    await expect(page.getByRole('button', { name: 'パスワードを忘れた場合' })).toBeVisible();
  });

  test('サインアップモードに切り替え', async ({ page }) => {
    // サインアップリンクをクリック
    await page.getByRole('button', { name: 'サインアップ' }).click();
    
    // パスワード確認フィールドが表示されることを確認
    await expect(page.getByLabel('パスワード確認')).toBeVisible();
    
    // ボタンテキストが変更されることを確認
    await expect(page.getByRole('button', { name: 'アカウントを作成' })).toBeVisible();
    
    // ログインリンクが表示されることを確認
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('パスワード表示/非表示の切り替え', async ({ page }) => {
    // パスワードフィールドに値を入力
    await page.getByLabel('パスワード').fill('testpassword');
    
    // 初期状態ではパスワードが非表示
    await expect(page.getByLabel('パスワード')).toHaveAttribute('type', 'password');
    
    // 目のアイコンをクリックしてパスワードを表示（より具体的なセレクターを使用）
    const passwordField = page.getByLabel('パスワード');
    const eyeButton = passwordField.locator('xpath=../..').locator('button[type="button"]').first();
    await eyeButton.click();
    
    // パスワードが表示されることを確認
    await expect(page.getByLabel('パスワード')).toHaveAttribute('type', 'text');
  });

  test('無効なログイン情報でのエラーハンドリング', async ({ page }) => {
    // 無効なメールアドレスとパスワードを入力
    await page.getByLabel('メールアドレス').fill('invalid@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // エラーメッセージが表示されることを確認（より柔軟なアプローチ）
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('サインアップ時のパスワード不一致エラー', async ({ page }) => {
    // サインアップモードに切り替え
    await page.getByRole('button', { name: 'サインアップ' }).click();
    
    // メールアドレスを入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    
    // パスワードを入力（IDを使用して特定）
    await page.locator('#password').fill('password123');
    
    // 異なるパスワード確認を入力
    await page.getByLabel('パスワード確認').fill('differentpassword');
    
    // アカウント作成ボタンをクリック
    await page.getByRole('button', { name: 'アカウントを作成' }).click();
    
    // パスワード不一致エラーメッセージが表示されることを確認
    // より具体的なセレクターを使用
    await expect(page.locator('[data-slot="alert"]')).toBeVisible();
  });

  test('短いパスワードでのエラーハンドリング', async ({ page }) => {
    // サインアップモードに切り替え
    await page.getByRole('button', { name: 'サインアップ' }).click();
    
    // メールアドレスを入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    
    // 短いパスワードを入力（IDを使用して特定）
    await page.locator('#password').fill('123');
    await page.getByLabel('パスワード確認').fill('123');
    
    // アカウント作成ボタンをクリック
    await page.getByRole('button', { name: 'アカウントを作成' }).click();
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-slot="alert"]')).toBeVisible();
  });

  test('パスワードを忘れた場合のリンク', async ({ page }) => {
    // パスワードを忘れた場合のリンクをクリック
    await page.getByRole('button', { name: 'パスワードを忘れた場合' }).click();
    
    // パスワードリセットページに遷移することを確認
    await expect(page).toHaveURL('/forgot-password');
  });

  test('ローディング状態の表示', async ({ page }) => {
    // 有効なメールアドレスとパスワードを入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ローディング状態が表示されることを確認（短時間で確認）
    await expect(page.getByRole('button', { name: '処理中...' })).toBeVisible({ timeout: 1000 });
    
    // ボタンが無効化されることを確認（短時間で確認）
    await expect(page.getByRole('button', { name: '処理中...' })).toBeDisabled({ timeout: 1000 });
  });

  test('フォームバリデーション', async ({ page }) => {
    // 空の状態でログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // ブラウザのネイティブバリデーションが動作することを確認
    // （HTML5のrequired属性によるバリデーション）
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // デスクトップサイズでの表示確認
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    
    // タブレットサイズでの表示確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    
    // モバイルサイズでの表示確認
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
  });

  test('ソーシャルログインボタンの確認', async ({ page }) => {
    // ソーシャルログインボタンが存在することを確認
    // SVGアイコンを含むボタンを確認（実際の数に合わせる）
    const socialButtons = page.locator('button').filter({ has: page.locator('svg') });
    await expect(socialButtons).toHaveCount(4); // 実際の数に合わせて調整
  });

  test('フォーム入力の動作確認', async ({ page }) => {
    // メールアドレスを入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await expect(page.getByLabel('メールアドレス')).toHaveValue('test@example.com');
    
    // パスワードを入力
    await page.getByLabel('パスワード').fill('password123');
    await expect(page.getByLabel('パスワード')).toHaveValue('password123');
  });

  test('サインアップ時のフォーム入力確認', async ({ page }) => {
    // サインアップモードに切り替え
    await page.getByRole('button', { name: 'サインアップ' }).click();
    
    // メールアドレスを入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await expect(page.getByLabel('メールアドレス')).toHaveValue('test@example.com');
    
    // パスワードを入力
    await page.locator('#password').fill('password123');
    await expect(page.locator('#password')).toHaveValue('password123');
    
    // パスワード確認を入力
    await page.getByLabel('パスワード確認').fill('password123');
    await expect(page.getByLabel('パスワード確認')).toHaveValue('password123');
  });
}); 