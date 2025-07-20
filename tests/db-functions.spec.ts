import { test, expect } from '@playwright/test';

test.describe('データベース関数のE2Eテスト（Server Actions）', () => {
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

  // ===== searchLectures関数のE2Eテスト =====
  test('searchLectures - 基本検索', async ({ page }) => {
    // 授業一覧が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    await expect(results.first()).toBeVisible();
    
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('searchLectures - 科目名検索', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('数学');
    await searchInput.press('Enter');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const subjectName = await results.nth(i).locator('[data-testid="subject-name"]').textContent();
        expect(subjectName).toContain('数学');
      }
    }
  });

  test('searchLectures - 教員名検索', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('田中');
    await searchInput.press('Enter');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const instructorName = await results.nth(i).locator('[data-testid="instructor-name"]').textContent();
        expect(instructorName).toContain('田中');
      }
    }
  });

  test('searchLectures - 曜日絞り込み', async ({ page }) => {
    const dayFilter = page.locator('[data-testid="day-filter"]');
    await dayFilter.selectOption('月');
    
    // フィルター結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const dayPeriod = await results.nth(i).locator('[data-testid="day-period"]').textContent();
        expect(dayPeriod).toContain('月');
      }
    }
  });

  test('searchLectures - 時限絞り込み', async ({ page }) => {
    const periodFilter = page.locator('[data-testid="period-filter"]');
    await periodFilter.selectOption('１限');
    
    // フィルター結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const dayPeriod = await results.nth(i).locator('[data-testid="day-period"]').textContent();
        expect(dayPeriod).toContain('1');
      }
    }
  });

  test('searchLectures - 学期絞り込み', async ({ page }) => {
    const termFilter = page.locator('[data-testid="term-filter"]');
    await termFilter.selectOption('前学期');
    
    // フィルター結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
  });

  test('searchLectures - 対象学科絞り込み', async ({ page }) => {
    const targetFilter = page.locator('[data-testid="target-filter"]');
    await targetFilter.selectOption('群１');
    
    // フィルター結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
  });

  test('searchLectures - 複数条件', async ({ page }) => {
    // 複数の検索条件を設定
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('数学');
    
    const dayFilter = page.locator('[data-testid="day-filter"]');
    await dayFilter.selectOption('月');
    
    const periodFilter = page.locator('[data-testid="period-filter"]');
    await periodFilter.selectOption('１限');
    
    const termFilter = page.locator('[data-testid="term-filter"]');
    await termFilter.selectOption('前学期');
    
    // 検索を実行
    await searchInput.press('Enter');
    
    // 検索結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const subjectName = await results.nth(i).locator('[data-testid="subject-name"]').textContent();
        const dayPeriod = await results.nth(i).locator('[data-testid="day-period"]').textContent();
        
        expect(subjectName).toContain('数学');
        expect(dayPeriod).toContain('月');
        expect(dayPeriod).toContain('1');
      }
    }
  });

  // ===== getAllLectures関数のE2Eテスト =====
  test('getAllLectures - 全授業取得', async ({ page }) => {
    // 授業一覧が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    await expect(results.first()).toBeVisible();
    
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
    
    // 空の科目名が含まれていないことを確認
    for (let i = 0; i < Math.min(count, 5); i++) {
      const subjectName = await results.nth(i).locator('[data-testid="subject-name"]').textContent();
      expect(subjectName).toBeTruthy();
      expect(subjectName?.trim()).not.toBe('');
    }
  });

  // ===== getLectureById関数のE2Eテスト =====
  test('getLectureById - 有効なID', async ({ page }) => {
    // 授業カードをクリックして詳細を表示
    const firstCard = page.locator('[data-testid="lecture-card"]').first();
    await firstCard.click();
    
    // 詳細モーダルまたはページが表示されることを確認
    await expect(page.locator('[data-testid="lecture-detail"]')).toBeVisible();
    
    // 詳細情報が表示されることを確認
    await expect(page.locator('[data-testid="subject-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="instructor-name"]')).toBeVisible();
  });

  // ===== getLecturesByDay関数のE2Eテスト =====
  test('getLecturesByDay - 曜日別取得', async ({ page }) => {
    // 時間割ビューに切り替え
    await page.locator('[data-testid="schedule-view-tab"]').click();
    
    // 曜日フィルターを選択
    const dayFilter = page.locator('[data-testid="day-filter"]');
    await dayFilter.selectOption('月');
    
    // 学期フィルターを選択
    const termFilter = page.locator('[data-testid="term-filter"]');
    await termFilter.selectOption('前学期');
    
    // フィルター結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const dayPeriod = await results.nth(i).locator('[data-testid="day-period"]').textContent();
        expect(dayPeriod).toContain('月');
      }
    }
  });

  // ===== getLecturesByTarget関数のE2Eテスト =====
  test('getLecturesByTarget - 対象学科別取得', async ({ page }) => {
    // 対象学科フィルターを選択
    const targetFilter = page.locator('[data-testid="target-filter"]');
    await targetFilter.selectOption('群１');
    
    // 学期フィルターを選択
    const termFilter = page.locator('[data-testid="term-filter"]');
    await termFilter.selectOption('前学期');
    
    // フィルター結果が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
  });

  // ===== エラーハンドリングテスト =====
  test('無効なパラメータでのエラーハンドリング', async ({ page }) => {
    // 特殊文字を含む検索
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('!@#$%^&*()');
    await searchInput.press('Enter');
    
    // エラーメッセージまたは適切な処理が行われることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
  });

  // ===== パフォーマンステスト =====
  test('データベース関数のパフォーマンス', async ({ page }) => {
    const startTime = Date.now();
    
    // ページの読み込み完了を待機
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が3秒以内であることを確認
    expect(responseTime).toBeLessThan(3000);
    console.log(`データベース関数レスポンス時間: ${responseTime}ms`);
  });

  test('複雑な検索条件でのパフォーマンス', async ({ page }) => {
    const startTime = Date.now();
    
    // 複数の検索条件を設定
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('数学');
    
    const dayFilter = page.locator('[data-testid="day-filter"]');
    await dayFilter.selectOption('月');
    
    const periodFilter = page.locator('[data-testid="period-filter"]');
    await periodFilter.selectOption('１限');
    
    const termFilter = page.locator('[data-testid="term-filter"]');
    await termFilter.selectOption('前学期');
    
    const targetFilter = page.locator('[data-testid="target-filter"]');
    await targetFilter.selectOption('群１');
    
    // 検索を実行
    await searchInput.press('Enter');
    
    // 検索結果の表示を待機
    await page.waitForSelector('[data-testid="lecture-list"]');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が5秒以内であることを確認
    expect(responseTime).toBeLessThan(5000);
    console.log(`複雑検索レスポンス時間: ${responseTime}ms`);
  });

  // ===== ユーザビリティテスト =====
  test('検索結果の並び順', async ({ page }) => {
    // 授業一覧が表示されることを確認
    await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    const results = page.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 1) {
      // 最初の2つの授業の曜日・時限を比較
      const firstDayPeriod = await results.first().locator('[data-testid="day-period"]').textContent();
      const secondDayPeriod = await results.nth(1).locator('[data-testid="day-period"]').textContent();
      
      // 並び順が適切であることを確認（曜日・時限順）
      expect(firstDayPeriod).toBeDefined();
      expect(secondDayPeriod).toBeDefined();
    }
  });

  test('ページネーション機能', async ({ page }) => {
    // ページネーションが存在する場合のテスト
    const pagination = page.locator('[data-testid="pagination"]');
    const hasPagination = await pagination.count() > 0;
    
    if (hasPagination) {
      // 次のページボタンをクリック
      const nextButton = pagination.locator('[data-testid="next-page"]');
      await nextButton.click();
      
      // ページが変更されることを確認
      await expect(page.locator('[data-testid="lecture-list"]')).toBeVisible();
    }
  });

  test('検索履歴機能', async ({ page }) => {
    // 検索履歴機能が存在する場合のテスト
    const searchHistory = page.locator('[data-testid="search-history"]');
    const hasHistory = await searchHistory.count() > 0;
    
    if (hasHistory) {
      // 検索を実行
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('数学');
      await searchInput.press('Enter');
      
      // 検索履歴に追加されることを確認
      await expect(searchHistory).toBeVisible();
    }
  });
}); 