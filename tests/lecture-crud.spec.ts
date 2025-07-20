import { test, expect } from '@playwright/test';

test.describe('授業CRUD操作のテスト', () => {
  test.beforeEach(async ({ page }) => {
    // メインページに移動
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ===== READ (読み取り) テスト =====
  test('授業一覧の取得', async ({ request }) => {
    const response = await request.get('/api/lectures');
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    expect(lectures.length).toBeGreaterThan(0);
    
    // 基本的な授業データ構造を確認
    if (lectures.length > 0) {
      const lecture = lectures[0];
      expect(lecture).toHaveProperty('id');
      expect(lecture).toHaveProperty('subjectName');
      expect(lecture).toHaveProperty('term');
      expect(lecture).toHaveProperty('dayOfWeek');
      expect(lecture).toHaveProperty('period');
    }
  });

  test('授業詳細の取得', async ({ request }) => {
    // まず授業一覧を取得して有効なIDを取得
    const listResponse = await request.get('/api/lectures');
    const lectures = await listResponse.json();
    
    if (lectures.length > 0) {
      const lectureId = lectures[0].id;
      
      const response = await request.get(`/api/lectures/${lectureId}`);
      expect(response.ok()).toBeTruthy();
      
      const lecture = await response.json();
      expect(lecture).toHaveProperty('id', lectureId);
      expect(lecture).toHaveProperty('subjectName');
      expect(lecture).toHaveProperty('instructorName');
    }
  });

  test('無効な授業IDでのエラーハンドリング', async ({ request }) => {
    const response = await request.get('/api/lectures/999999');
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error).toHaveProperty('error');
  });

  // ===== SEARCH (検索) テスト =====
  test('科目名での検索', async ({ request }) => {
    const searchQuery = '数学';
    const response = await request.get(`/api/lectures?query=${encodeURIComponent(searchQuery)}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    
    // 検索結果が科目名に含まれていることを確認
    if (lectures.length > 0) {
      lectures.forEach((lecture: any) => {
        expect(lecture.subjectName).toContain(searchQuery);
      });
    }
  });

  test('教員名での検索', async ({ request }) => {
    const searchQuery = '田中';
    const response = await request.get(`/api/lectures?query=${encodeURIComponent(searchQuery)}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    
    // 検索結果が教員名に含まれていることを確認
    if (lectures.length > 0) {
      lectures.forEach((lecture: any) => {
        expect(lecture.instructorName).toContain(searchQuery);
      });
    }
  });

  test('曜日での絞り込み', async ({ request }) => {
    const dayOfWeek = '月';
    const response = await request.get(`/api/lectures?dayOfWeek=${dayOfWeek}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    
    // すべての結果が指定された曜日であることを確認
    if (lectures.length > 0) {
      lectures.forEach((lecture: any) => {
        expect(lecture.dayOfWeek).toBe(dayOfWeek);
      });
    }
  });

  test('時限での絞り込み', async ({ request }) => {
    const period = '1';
    const response = await request.get(`/api/lectures?period=${period}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    
    // すべての結果が指定された時限であることを確認
    if (lectures.length > 0) {
      lectures.forEach((lecture: any) => {
        expect(lecture.period).toBe(period);
      });
    }
  });

  test('学期での絞り込み', async ({ request }) => {
    const term = '前学期';
    const response = await request.get(`/api/lectures?term=${encodeURIComponent(term)}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    
    // すべての結果が指定された学期であることを確認
    if (lectures.length > 0) {
      lectures.forEach((lecture: any) => {
        expect(lecture.term).toBe(term);
      });
    }
  });

  test('対象学科での絞り込み', async ({ request }) => {
    const target = '国際教養学科';
    const response = await request.get(`/api/lectures?target=${encodeURIComponent(target)}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    
    // 検索結果が対象学科に含まれていることを確認
    if (lectures.length > 0) {
      lectures.forEach((lecture: any) => {
        const hasTarget = 
          lecture.targetCommon === target ||
          lecture.targetIntlStudies === target ||
          lecture.targetIntlCulture === target ||
          lecture.targetIntlTourism === target ||
          lecture.targetSportsHealth === target ||
          lecture.targetNursing === target ||
          lecture.targetHealthInfo === target;
        expect(hasTarget).toBe(true);
      });
    }
  });

  test('複数条件での検索', async ({ request }) => {
    const params = new URLSearchParams({
      query: '数学',
      dayOfWeek: '月',
      period: '1',
      term: '前学期'
    });
    
    const response = await request.get(`/api/lectures?${params.toString()}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    
    // すべての条件に合致することを確認
    if (lectures.length > 0) {
      lectures.forEach((lecture: any) => {
        expect(lecture.subjectName).toContain('数学');
        expect(lecture.dayOfWeek).toBe('月');
        expect(lecture.period).toBe('1');
        expect(lecture.term).toBe('前学期');
      });
    }
  });

  test('空の検索結果', async ({ request }) => {
    const searchQuery = '存在しない科目名12345';
    const response = await request.get(`/api/lectures?query=${encodeURIComponent(searchQuery)}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    expect(Array.isArray(lectures)).toBe(true);
    expect(lectures.length).toBe(0);
  });

  // ===== エラーハンドリングテスト =====
  test('無効なパラメータでのエラーハンドリング', async ({ request }) => {
    // 無効なID
    const response1 = await request.get('/api/lectures/abc');
    expect(response1.status()).toBe(400);
    
    // 無効なクエリパラメータ
    const response2 = await request.get('/api/lectures?invalid=param');
    expect(response2.ok()).toBeTruthy(); // 無効なパラメータは無視される
  });

  test('データベースエラー時のハンドリング', async ({ request }) => {
    // 存在しないID
    const response = await request.get('/api/lectures/999999');
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error).toHaveProperty('error', '授業が見つかりません');
  });

  // ===== パフォーマンステスト =====
  test('大量データでの検索パフォーマンス', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/api/lectures');
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が1秒以内であることを確認
    expect(responseTime).toBeLessThan(1000);
    console.log(`検索レスポンス時間: ${responseTime}ms, 結果件数: ${lectures.length}`);
  });

  test('複雑な検索条件でのパフォーマンス', async ({ request }) => {
    const startTime = Date.now();
    
    const params = new URLSearchParams({
      query: '数学',
      dayOfWeek: '月',
      period: '1',
      term: '前学期',
      target: '国際教養学科'
    });
    
    const response = await request.get(`/api/lectures?${params.toString()}`);
    expect(response.ok()).toBeTruthy();
    
    const lectures = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が2秒以内であることを確認
    expect(responseTime).toBeLessThan(2000);
    console.log(`複雑検索レスポンス時間: ${responseTime}ms, 結果件数: ${lectures.length}`);
  });
}); 