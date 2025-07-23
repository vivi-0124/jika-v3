import { NextRequest, NextResponse } from 'next/server';
import { getLectureById } from '@/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({
        success: false,
        error: '無効な授業IDです'
      }, { status: 400 });
    }

    const lecture = await getLectureById(id);

    if (!lecture) {
      return NextResponse.json({
        success: false,
        error: '授業が見つかりません'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: lecture
    });
  } catch (error) {
    console.error('授業詳細取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: '授業の詳細取得に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 