import { NextRequest, NextResponse } from 'next/server';
import { searchLectures, getAllLectures } from '@/db';

// 型定義
interface SearchParams {
  query?: string;
  dayOfWeek?: string;
  period?: string;
  term?: string;
  target?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータを取得
    const query = searchParams.get('query');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const period = searchParams.get('period');
    const term = searchParams.get('term');
    const target = searchParams.get('target');

    // 検索パラメータがある場合は検索、ない場合は全授業取得
    if (query || dayOfWeek || period || target) {
      // 検索処理
      const processedParams: SearchParams = {
        query: query || '',
        dayOfWeek: dayOfWeek === 'all' ? '' : dayOfWeek || '',
        period: period === 'all' ? '' : period || '',
        term: term || '前学期',
        target: target === 'all' ? '' : target || ''
      };

      const lectures = await searchLectures(processedParams);

      return NextResponse.json({
        success: true,
        data: lectures,
        message: `${lectures.length}件の授業が見つかりました`
      });
    } else {
      // 全授業取得
      const lectures = await getAllLectures();

      return NextResponse.json({
        success: true,
        data: lectures,
        message: `${lectures.length}件の授業を取得しました`
      });
    }
  } catch (error) {
    console.error('授業取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: '授業の取得に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 