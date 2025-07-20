import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSchedules } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    // 既に同じ授業が追加されているかチェック
    const existingSchedule = await db
      .select()
      .from(userSchedules)
      .where(
        and(
          eq(userSchedules.userId, userId),
          eq(userSchedules.lectureId, lectureId)
        )
      );

    if (existingSchedule.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'この授業は既に時間割に追加されています'
        },
        { status: 409 }
      );
    }

    // 時間割に追加
    const newSchedule = await db
      .insert(userSchedules)
      .values({
        userId,
        lectureId
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newSchedule[0],
      message: '授業を時間割に追加しました'
    });
  } catch (error) {
    console.error('授業追加エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '授業の追加に失敗しました。もう一度お試しください。'
      },
      { status: 500 }
    );
  }
} 