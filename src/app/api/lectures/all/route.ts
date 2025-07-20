import { NextResponse } from 'next/server';
import { getAllLectures } from '@/db';

export async function GET() {
  try {
    const lectures = await getAllLectures();

    return NextResponse.json({
      success: true,
      data: lectures,
      message: `${lectures.length}件の授業を取得しました`
    });
  } catch (error) {
    console.error('全授業取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '授業の取得に失敗しました。もう一度お試しください。'
      },
      { status: 500 }
    );
  }
} 