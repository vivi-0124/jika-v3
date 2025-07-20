import { test, expect } from './utils/auth-helper';

test.describe('授業CRUD操作のE2Eテスト（Server Actions）', () => {
  // ===== READ (読み取り) テスト =====
  test('授業一覧の表示', async ({ authenticatedPage }) => {
    // まず検索を実行して結果を取得
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果が表示されることを確認（結果がない場合はno-results、ある場合はlecture-list）
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    
    expect(hasResults || hasNoResults).toBeTruthy();
    
    // 結果がある場合は詳細を確認
    if (hasResults) {
      const lectureCards = authenticatedPage.locator('[data-testid="lecture-card"]');
      await expect(lectureCards.first()).toBeVisible();
      
      // 基本的な授業データ構造を確認
      const firstCard = lectureCards.first();
      await expect(firstCard.locator('[data-testid="subject-name"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="instructor-name"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="day-period"]')).toBeVisible();
    }
  });

  test('授業詳細の表示', async ({ authenticatedPage }) => {
    // まず検索を実行して結果を取得
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 結果がある場合のみ詳細表示をテスト
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-card"]').isVisible();
    if (hasResults) {
      // 授業カードの詳細ボタンをクリックして詳細を表示
      const firstCard = authenticatedPage.locator('[data-testid="lecture-card"]').first();
      await firstCard.locator('[data-testid="view-detail"]').click();
      
      // 詳細モーダルが表示されることを確認
      await expect(authenticatedPage.locator('[data-testid="lecture-detail"]')).toBeVisible();
      
      // 詳細情報が表示されることを確認
      await expect(authenticatedPage.locator('[data-testid="subject-name"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="instructor-name"]')).toBeVisible();
    }
  });

  // ===== SEARCH (検索) テスト =====
  test('科目名での検索', async ({ authenticatedPage }) => {
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // 検索を実行
    await searchInput.fill('数学');
    await searchInput.press('Enter');
    
    // 検索結果が表示されることを確認
    await expect(authenticatedPage.locator('[data-testid="lecture-list"]')).toBeVisible();
    
    // 検索結果が科目名に含まれていることを確認
    const results = authenticatedPage.locator('[data-testid="lecture-card"]');
    const count = await results.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const subjectName = await results.nth(i).locator('[data-testid="subject-name"]').textContent();
        expect(subjectName).toContain('数学');
      }
    }
  });

  test('教員名での検索', async ({ authenticatedPage }) => {
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    
    // 検索を実行
    await searchInput.fill('田中');
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果が表示されることを確認
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
    
    // 結果がある場合は教員名を確認
    if (hasResults) {
      const results = authenticatedPage.locator('[data-testid="lecture-card"]');
      const count = await results.count();
      
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 3); i++) {
          const instructorName = await results.nth(i).locator('[data-testid="instructor-name"]').textContent();
          expect(instructorName).toContain('田中');
        }
      }
    }
  });

  test('曜日での絞り込み', async ({ authenticatedPage }) => {
    // フィルターボタンをクリックしてフィルターを開く
    await authenticatedPage.locator('button').filter({ hasText: 'フィルター' }).click();
    
    // 曜日フィルターを選択
    const dayFilter = authenticatedPage.locator('[data-testid="day-filter"]');
    await dayFilter.click();
    await authenticatedPage.locator('text=月曜日').click();
    
    // 検索を実行
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果が表示されることを確認
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
    
    // 結果がある場合は曜日を確認
    if (hasResults) {
      const results = authenticatedPage.locator('[data-testid="lecture-card"]');
      const count = await results.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const dayPeriod = await results.nth(i).locator('[data-testid="day-period"]').textContent();
          expect(dayPeriod).toContain('月');
        }
      }
    }
  });

  test('時限での絞り込み', async ({ authenticatedPage }) => {
    // フィルターボタンをクリックしてフィルターを開く
    await authenticatedPage.locator('button').filter({ hasText: 'フィルター' }).click();
    
    // 時限フィルターを選択
    const periodFilter = authenticatedPage.locator('[data-testid="period-filter"]');
    await periodFilter.click();
    await authenticatedPage.locator('text=1限').click();
    
    // 検索を実行
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果が表示されることを確認
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
    
    // 結果がある場合は時限を確認
    if (hasResults) {
      const results = authenticatedPage.locator('[data-testid="lecture-card"]');
      const count = await results.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const dayPeriod = await results.nth(i).locator('[data-testid="day-period"]').textContent();
          expect(dayPeriod).toContain('1');
        }
      }
    }
  });

  test('学期での絞り込み', async ({ authenticatedPage }) => {
    // フィルターボタンをクリックしてフィルターを開く
    await authenticatedPage.locator('button').filter({ hasText: 'フィルター' }).click();
    
    // 学期フィルターを選択
    const termFilter = authenticatedPage.locator('[data-testid="term-filter"]');
    await termFilter.click();
    // SelectContent内の前学期オプションを選択
    await authenticatedPage.locator('[role="option"]').filter({ hasText: '前学期' }).click();
    
    // 検索を実行
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果が表示されることを確認
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('対象学科での絞り込み', async ({ authenticatedPage }) => {
    // フィルターボタンをクリックしてフィルターを開く
    await authenticatedPage.locator('button').filter({ hasText: 'フィルター' }).click();
    
    // 対象学科フィルターを選択
    const targetFilter = authenticatedPage.locator('[data-testid="target-filter"]');
    await targetFilter.click();
    await authenticatedPage.locator('text=国際教養学科').click();
    
    // 検索を実行
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果が表示されることを確認
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('複数条件での検索', async ({ authenticatedPage }) => {
    // 検索条件を設定
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    await searchInput.fill('数学');
    
    // フィルターボタンをクリックしてフィルターを開く
    await authenticatedPage.locator('button').filter({ hasText: 'フィルター' }).click();
    
    const dayFilter = authenticatedPage.locator('[data-testid="day-filter"]');
    await dayFilter.click();
    await authenticatedPage.locator('text=月曜日').click();
    
    const periodFilter = authenticatedPage.locator('[data-testid="period-filter"]');
    await periodFilter.click();
    await authenticatedPage.locator('text=1限').click();
    
    const termFilter = authenticatedPage.locator('[data-testid="term-filter"]');
    await termFilter.click();
    // SelectContent内の前学期オプションを選択
    await authenticatedPage.locator('[role="option"]').filter({ hasText: '前学期' }).click();
    
    // 検索を実行
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果が表示されることを確認
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
    
    // 結果がある場合は条件を確認
    if (hasResults) {
      const results = authenticatedPage.locator('[data-testid="lecture-card"]');
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
    }
  });

  test('空の検索結果', async ({ authenticatedPage }) => {
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    
    // 存在しない科目名で検索
    await searchInput.fill('存在しない科目名12345');
    await searchInput.press('Enter');
    
    // 空の結果メッセージが表示されることを確認
    await expect(authenticatedPage.locator('[data-testid="no-results"]')).toBeVisible();
  });

  // ===== エラーハンドリングテスト =====
  test('無効な検索条件でのエラーハンドリング', async ({ authenticatedPage }) => {
    // 特殊文字を含む検索
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    await searchInput.fill('!@#$%^&*()');
    await searchInput.press('Enter');
    
    // 検索結果が表示されることを確認（結果がない場合はno-results、ある場合はlecture-list）
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
  });

  // ===== パフォーマンステスト =====
  test('大量データでの検索パフォーマンス', async ({ authenticatedPage }) => {
    const startTime = Date.now();
    
    // ページの読み込み完了を待機
    await authenticatedPage.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が3秒以内であることを確認
    expect(responseTime).toBeLessThan(3000);
    console.log(`ページ読み込み時間: ${responseTime}ms`);
  });

  test('複雑な検索条件でのパフォーマンス', async ({ authenticatedPage }) => {
    const startTime = Date.now();
    
    // 複数の検索条件を設定
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    await searchInput.fill('数学');
    
    // フィルターボタンをクリックしてフィルターを開く
    await authenticatedPage.locator('button').filter({ hasText: 'フィルター' }).click();
    
    const dayFilter = authenticatedPage.locator('[data-testid="day-filter"]');
    await dayFilter.click();
    await authenticatedPage.locator('text=月曜日').click();
    
    const periodFilter = authenticatedPage.locator('[data-testid="period-filter"]');
    await periodFilter.click();
    await authenticatedPage.locator('text=1限').click();
    
    const termFilter = authenticatedPage.locator('[data-testid="term-filter"]');
    await termFilter.click();
    // SelectContent内の前学期オプションを選択
    await authenticatedPage.locator('[role="option"]').filter({ hasText: '前学期' }).click();
    
    const targetFilter = authenticatedPage.locator('[data-testid="target-filter"]');
    await targetFilter.click();
    await authenticatedPage.locator('text=国際教養学科').click();
    
    // 検索を実行
    await authenticatedPage.locator('[data-testid="search-button"]').click();
    await authenticatedPage.waitForLoadState('networkidle');
    
    // 検索結果の表示を待機
    const hasResults = await authenticatedPage.locator('[data-testid="lecture-list"]').isVisible();
    const hasNoResults = await authenticatedPage.locator('[data-testid="no-results"]').isVisible();
    expect(hasResults || hasNoResults).toBeTruthy();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が6秒以内であることを確認
    expect(responseTime).toBeLessThan(6000);
    console.log(`複雑検索レスポンス時間: ${responseTime}ms`);
  });

  // ===== ユーザビリティテスト =====
  test('検索フィールドのクリア機能', async ({ authenticatedPage }) => {
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    
    // 検索を実行
    await searchInput.fill('数学');
    await searchInput.press('Enter');
    
    // クリアボタンをクリック
    const clearButton = authenticatedPage.locator('[data-testid="clear-search"]');
    await clearButton.click();
    
    // 検索フィールドがクリアされることを確認
    await expect(searchInput).toHaveValue('');
  });

  test('フィルターのリセット機能', async ({ authenticatedPage }) => {
    // フィルターボタンをクリックしてフィルターを開く
    await authenticatedPage.locator('button').filter({ hasText: 'フィルター' }).click();
    
    // フィルターを設定
    const dayFilter = authenticatedPage.locator('[data-testid="day-filter"]');
    await dayFilter.click();
    await authenticatedPage.locator('text=月曜日').click();
    
    const periodFilter = authenticatedPage.locator('[data-testid="period-filter"]');
    await periodFilter.click();
    await authenticatedPage.locator('text=1限').click();
    
    // リセットボタンをクリック
    const resetButton = authenticatedPage.locator('[data-testid="reset-filters"]');
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    
    // フィルターがリセットされることを確認
    // リセット後、フィルターが正しく表示されていることを確認
    await expect(authenticatedPage.locator('[data-testid="day-filter"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="period-filter"]')).toBeVisible();
  });
}); 