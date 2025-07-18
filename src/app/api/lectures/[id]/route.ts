import { NextRequest, NextResponse } from 'next/server';
import { getLectureById } from '@/db';

// 授業詳細取得API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効な授業IDです' },
        { status: 400 }
      );
    }

    const lecture = await getLectureById(id);
    
    if (!lecture) {
      return NextResponse.json(
        { error: '授業が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error('Error fetching lecture:', error);
    return NextResponse.json(
      { error: '授業の取得に失敗しました' },
      { status: 500 }
    );
  }
} 