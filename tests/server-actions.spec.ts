import { test, expect } from '@playwright/test';

test.describe('Server Actions E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページに移動
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // ログイン情報を入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // メインページにリダイレクトされるまで待機
    await page.waitForURL('/');
    await page.waitForLoadState('networkidle');
    
    // 検索タブに切り替え
    await page.locator('[data-testid="search-tab"]').click();
    await page.waitForLoadState('networkidle');
  });

  // ===== 授業検索のテスト =====
  test('授業一覧の表示', async ({ page }) => {
    // 授業一覧が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    // 授業カードが存在することを確認
    const lectureCards = page.locator('[data-testid="lecture-card"]');
    await expect(lectureCards.first()).toBeVisible();
  });

  test('授業検索機能', async ({ page }) => {
    // 検索フィールドを確認
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // 検索を実行
    await searchInput.fill('数学');
    await searchInput.press('Enter');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
  });

  test('フィルター機能', async ({ page }) => {
    // 曜日フィルターを確認
    const dayFilter = page.locator('[data-testid="day-filter"]');
    await expect(dayFilter).toBeVisible();
    
    // 時限フィルターを確認
    const periodFilter = page.locator('[data-testid="period-filter"]');
    await expect(periodFilter).toBeVisible();
    
    // 学期フィルターを確認
    const termFilter = page.locator('[data-testid="term-filter"]');
    await expect(termFilter).toBeVisible();
  });

  // ===== 時間割操作のテスト =====
  test('授業を時間割に追加', async ({ page }) => {
    // ログインが必要な場合の処理
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // メインページに戻る
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 授業カードの追加ボタンをクリック
    const addButton = page.locator('[data-testid="add-to-schedule"]').first();
    await addButton.click();
    
    // 成功メッセージが表示されることを確認
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('授業を時間割から削除', async ({ page }) => {
    // ログインが必要な場合の処理
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // メインページに戻る
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 時間割ビューに切り替え
    await page.locator('[data-testid="schedule-view-tab"]').click();
    
    // 削除ボタンをクリック
    const removeButton = page.locator('[data-testid="remove-from-schedule"]').first();
    await removeButton.click();
    
    // 成功メッセージが表示されることを確認
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // ===== エラーハンドリングのテスト =====
  test('無効な検索条件でのエラーハンドリング', async ({ page }) => {
    // 無効な検索を実行
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('存在しない科目名12345');
    await searchInput.press('Enter');
    
    // エラーメッセージまたは空の結果が表示されることを確認
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
  });

  test('未ログイン状態での時間割操作', async ({ page }) => {
    // ログインせずに授業追加を試行
    const addButton = page.locator('[data-testid="add-to-schedule"]').first();
    await addButton.click();
    
    // ログインが必要なメッセージが表示されることを確認
    await expect(page.locator('[data-testid="login-required"]')).toBeVisible();
  });

  // ===== パフォーマンステスト =====
  test('大量データでの表示パフォーマンス', async ({ page }) => {
    const startTime = Date.now();
    
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // 読み込み時間が3秒以内であることを確認
    expect(loadTime).toBeLessThan(3000);
    console.log(`ページ読み込み時間: ${loadTime}ms`);
  });

  test('検索のレスポンス時間', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    const startTime = Date.now();
    await searchInput.fill('数学');
    await searchInput.press('Enter');
    
    // 検索結果の表示を待機
    await page.waitForSelector('[data-testid="lecture-list"]');
    
    const endTime = Date.now();
    const searchTime = endTime - startTime;
    
    // 検索時間が2秒以内であることを確認
    expect(searchTime).toBeLessThan(2000);
    console.log(`検索レスポンス時間: ${searchTime}ms`);
  });

  // ===== レスポンシブデザインのテスト =====
  test('モバイル表示での動作', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 検索フィールドが表示されることを確認
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // 授業カードが表示されることを確認
    await expect(page.locator('[data-testid="lecture-card"]').first()).toBeVisible();
  });

  test('タブレット表示での動作', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 検索フィールドが表示されることを確認
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // 授業カードが表示されることを確認
    await expect(page.locator('[data-testid="lecture-card"]').first()).toBeVisible();
  });

  // ===== アクセシビリティテスト =====
  test('キーボードナビゲーション', async ({ page }) => {
    // Tabキーでフォーカス移動
    await page.keyboard.press('Tab');
    
    // 検索フィールドにフォーカスが移動することを確認
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
  });

  test('スクリーンリーダー対応', async ({ page }) => {
    // aria-label属性が設定されていることを確認
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveAttribute('aria-label');
    
    // ボタンにaria-labelが設定されていることを確認
    const addButton = page.locator('[data-testid="add-to-schedule"]').first();
    await expect(addButton).toHaveAttribute('aria-label');
  });
}); 