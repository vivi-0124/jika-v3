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

    // allの値を空文字列に変換
    const processedDayOfWeek = dayOfWeek === 'all' ? '' : dayOfWeek;
    const processedPeriod = period === 'all' ? '' : period;
    const processedTarget = target === 'all' ? '' : target;

    const lectures = await searchLectures({
      query,
      dayOfWeek: processedDayOfWeek,
      period: processedPeriod,
      term,
      target: processedTarget
    });

    return NextResponse.json(lectures);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 