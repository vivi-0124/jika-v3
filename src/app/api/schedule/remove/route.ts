import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSchedules } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, lectureId } = body;

    if (!userId || !lectureId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ユーザーIDと授業IDが必要です'
        },
        { status: 400 }
      );
    }

    // 時間割から削除
    const deletedRows = await db
      .delete(userSchedules)
      .where(
        and(
          eq(userSchedules.userId, userId),
          eq(userSchedules.lectureId, lectureId)
        )
      )
      .returning();

    if (deletedRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '削除対象の授業が見つかりません'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedRows[0],
      message: '授業を時間割から削除しました'
    });
  } catch (error) {
    console.error('授業削除エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '授業の削除に失敗しました。もう一度お試しください。'
      },
      { status: 500 }
    );
  }
} 