import { test, expect } from '@playwright/test';

test.describe('データベース関数のAPIテスト', () => {
  // ===== searchLectures関数のAPIテスト =====
  test('searchLectures - 基本検索', async ({ request }) => {
    const response = await request.get('/api/lectures');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  test('searchLectures - 科目名検索', async ({ request }) => {
    const response = await request.get('/api/lectures?query=数学');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        expect(lecture.subjectName).toContain('数学');
      });
    }
  });

  test('searchLectures - 教員名検索', async ({ request }) => {
    const response = await request.get('/api/lectures?query=田中');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        expect(lecture.instructorName).toContain('田中');
      });
    }
  });

  test('searchLectures - 曜日絞り込み', async ({ request }) => {
    const response = await request.get('/api/lectures?dayOfWeek=月');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        expect(lecture.dayOfWeek).toBe('月');
      });
    }
  });

  test('searchLectures - 時限絞り込み', async ({ request }) => {
    const response = await request.get('/api/lectures?period=1');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        expect(lecture.period).toBe('1');
      });
    }
  });

  test('searchLectures - 学期絞り込み', async ({ request }) => {
    const response = await request.get('/api/lectures?term=前学期');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        expect(lecture.term).toBe('前学期');
      });
    }
  });

  test('searchLectures - 対象学科絞り込み', async ({ request }) => {
    const response = await request.get('/api/lectures?target=国際教養学科');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        const hasTarget = 
          lecture.targetCommon === '国際教養学科' ||
          lecture.targetIntlStudies === '国際教養学科' ||
          lecture.targetIntlCulture === '国際教養学科' ||
          lecture.targetIntlTourism === '国際教養学科' ||
          lecture.targetSportsHealth === '国際教養学科' ||
          lecture.targetNursing === '国際教養学科' ||
          lecture.targetHealthInfo === '国際教養学科';
        expect(hasTarget).toBe(true);
      });
    }
  });

  test('searchLectures - 複数条件', async ({ request }) => {
    const params = new URLSearchParams({
      query: '数学',
      dayOfWeek: '月',
      period: '1',
      term: '前学期'
    });
    
    const response = await request.get(`/api/lectures?${params.toString()}`);
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        expect(lecture.subjectName).toContain('数学');
        expect(lecture.dayOfWeek).toBe('月');
        expect(lecture.period).toBe('1');
        expect(lecture.term).toBe('前学期');
      });
    }
  });

  // ===== getAllLectures関数のAPIテスト =====
  test('getAllLectures - 全授業取得', async ({ request }) => {
    const response = await request.get('/api/lectures');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // 空の科目名が含まれていないことを確認
    results.forEach((lecture: any) => {
      expect(lecture.subjectName).toBeTruthy();
      expect(lecture.subjectName.trim()).not.toBe('');
    });
  });

  // ===== getLectureById関数のAPIテスト =====
  test('getLectureById - 有効なID', async ({ request }) => {
    // まず全授業を取得して有効なIDを取得
    const listResponse = await request.get('/api/lectures');
    const lectures = await listResponse.json();
    
    if (lectures.length > 0) {
      const lectureId = lectures[0].id;
      
      const response = await request.get(`/api/lectures/${lectureId}`);
      expect(response.ok()).toBeTruthy();
      
      const result = await response.json();
      expect(result).toBeDefined();
      expect(result.id).toBe(lectureId);
    }
  });

  test('getLectureById - 無効なID', async ({ request }) => {
    const response = await request.get('/api/lectures/999999');
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error).toHaveProperty('error', '授業が見つかりません');
  });

  // ===== getLecturesByDay関数のAPIテスト =====
  test('getLecturesByDay - 曜日別取得', async ({ request }) => {
    const response = await request.get('/api/schedule?dayOfWeek=月&term=前学期');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        expect(lecture.dayOfWeek).toBe('月');
        expect(lecture.term).toBe('前学期');
      });
    }
  });

  // ===== getLecturesByTarget関数のAPIテスト =====
  test('getLecturesByTarget - 対象学科別取得', async ({ request }) => {
    const response = await request.get('/api/lectures?target=国際教養学科&term=前学期');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      results.forEach((lecture: any) => {
        const hasTarget = 
          lecture.targetCommon === '国際教養学科' ||
          lecture.targetIntlStudies === '国際教養学科' ||
          lecture.targetIntlCulture === '国際教養学科' ||
          lecture.targetIntlTourism === '国際教養学科' ||
          lecture.targetSportsHealth === '国際教養学科' ||
          lecture.targetNursing === '国際教養学科' ||
          lecture.targetHealthInfo === '国際教養学科';
        expect(hasTarget).toBe(true);
        expect(lecture.term).toBe('前学期');
      });
    }
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

  // ===== パフォーマンステスト =====
  test('データベース関数のパフォーマンス', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/api/lectures');
    expect(response.ok()).toBeTruthy();
    
    const results = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が1秒以内であることを確認
    expect(responseTime).toBeLessThan(1000);
    console.log(`データベース関数レスポンス時間: ${responseTime}ms, 結果件数: ${results.length}`);
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
    
    const results = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // レスポンス時間が2秒以内であることを確認
    expect(responseTime).toBeLessThan(2000);
    console.log(`複雑検索レスポンス時間: ${responseTime}ms, 結果件数: ${results.length}`);
  });
}); 