import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSchedules, lectures } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const term = searchParams.get('term') || '前学期';

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ユーザーIDが必要です'
        },
        { status: 400 }
      );
    }

    // ユーザーの時間割を取得（授業情報も含める）
    const userSchedule = await db
      .select({
        id: userSchedules.id,
        userId: userSchedules.userId,
        createdAt: userSchedules.createdAt,
        lecture: lectures
      })
      .from(userSchedules)
      .innerJoin(lectures, eq(userSchedules.lectureId, lectures.id))
      .where(
        and(
          eq(userSchedules.userId, userId),
          eq(lectures.term, term)
        )
      )
      .orderBy(lectures.dayOfWeek, lectures.period);

    return NextResponse.json({
      success: true,
      data: userSchedule,
      message: `${userSchedule.length}件の時間割を取得しました`
    });
  } catch (error) {
    console.error('ユーザー時間割取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ユーザー時間割の取得に失敗しました。もう一度お試しください。'
      },
      { status: 500 }
    );
  }
} 