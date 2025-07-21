import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSchedules, lectures } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ユーザーの時間割を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const term = searchParams.get('term') || '前学期';

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ユーザーIDが必要です'
      }, { status: 400 });
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
    return NextResponse.json({
      success: false,
      error: 'ユーザー時間割の取得に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
}

// 授業を時間割に追加
export async function POST(request: NextRequest) {
  try {
    const { userId, lectureId } = await request.json();

    if (!userId || !lectureId) {
      return NextResponse.json({
        success: false,
        error: 'ユーザーIDと授業IDが必要です'
      }, { status: 400 });
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
      return NextResponse.json({
        success: false,
        error: 'この授業は既に時間割に追加されています'
      }, { status: 409 });
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
    return NextResponse.json({
      success: false,
      error: '授業の追加に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
}

// 授業を時間割から削除
export async function DELETE(request: NextRequest) {
  try {
    const { userId, lectureId } = await request.json();

    if (!userId || !lectureId) {
      return NextResponse.json({
        success: false,
        error: 'ユーザーIDと授業IDが必要です'
      }, { status: 400 });
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
      return NextResponse.json({
        success: false,
        error: '削除対象の授業が見つかりません'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deletedRows[0],
      message: '授業を時間割から削除しました'
    });
  } catch (error) {
    console.error('授業削除エラー:', error);
    return NextResponse.json({
      success: false,
      error: '授業の削除に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 