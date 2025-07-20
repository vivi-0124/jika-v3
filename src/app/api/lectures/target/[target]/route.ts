import { NextRequest, NextResponse } from 'next/server';
import { getLecturesByTarget } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ target: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || '前学期';
    const resolvedParams = await params;
    const target = resolvedParams.target;

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          error: '対象学科を指定してください'
        },
        { status: 400 }
      );
    }

    const lectures = await getLecturesByTarget(target, term);

    return NextResponse.json({
      success: true,
      data: lectures,
      message: `${target}対象の授業を${lectures.length}件取得しました`
    });
  } catch (error) {
    console.error('対象学科別授業取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '授業の取得に失敗しました。もう一度お試しください。'
      },
      { status: 500 }
    );
  }
} 