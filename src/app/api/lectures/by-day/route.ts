import { NextRequest, NextResponse } from 'next/server';
import { getLecturesByDay } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dayOfWeek = searchParams.get('dayOfWeek');
    const term = searchParams.get('term') || '前学期';

    if (!dayOfWeek) {
      return NextResponse.json({
        success: false,
        error: '曜日を指定してください'
      }, { status: 400 });
    }

    // termの値を実際のデータに合わせて変換
    let actualTerm = term;
    if (term === '2024前期') actualTerm = '前学期';
    if (term === '2024後期') actualTerm = '後学期';
    if (term === '2023前期') actualTerm = '前学期';
    if (term === '2023後期') actualTerm = '後学期';

    const lectures = await getLecturesByDay(dayOfWeek, actualTerm);

    return NextResponse.json({
      success: true,
      data: lectures,
      message: `${dayOfWeek}曜日の授業を${lectures.length}件取得しました`
    });
  } catch (error) {
    console.error('曜日別授業取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: '時間割の取得に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 