import { NextRequest, NextResponse } from 'next/server';
import { searchLectures } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || '';
    const dayOfWeek = searchParams.get('dayOfWeek') || '';
    const period = searchParams.get('period') || '';
    const term = searchParams.get('term') || '前学期';
    const target = searchParams.get('target') || '';

    const processedParams = {
      query: query,
      dayOfWeek: dayOfWeek === 'all' ? '' : dayOfWeek,
      period: period === 'all' ? '' : period,
      term: term,
      target: target === 'all' ? '' : target
    };

    const lectures = await searchLectures(processedParams);

    return NextResponse.json({
      success: true,
      data: lectures,
      message: `${lectures.length}件の授業が見つかりました`
    });
  } catch (error) {
    console.error('授業検索エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '授業の検索に失敗しました。もう一度お試しください。'
      },
      { status: 500 }
    );
  }
} 