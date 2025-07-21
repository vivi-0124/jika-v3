import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSchedules } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// 時間割の一括更新（複数授業の追加/削除）
export async function POST(request: NextRequest) {
  try {
    const { userId, addLectureIds = [], removeLectureIds = [] } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ユーザーIDが必要です'
      }, { status: 400 });
    }

    const results = {
      added: [] as number[],
      removed: [] as number[],
      errors: [] as string[]
    };

    // 削除処理
    for (const lectureId of removeLectureIds) {
      try {
        await db
          .delete(userSchedules)
          .where(
            and(
              eq(userSchedules.userId, userId),
              eq(userSchedules.lectureId, lectureId)
            )
          );
        results.removed.push(lectureId);
      } catch {
        results.errors.push(`授業ID ${lectureId} の削除に失敗`);
      }
    }

    // 追加処理
    for (const lectureId of addLectureIds) {
      try {
        // 既に存在するかチェック
        const existing = await db
          .select()
          .from(userSchedules)
          .where(
            and(
              eq(userSchedules.userId, userId),
              eq(userSchedules.lectureId, lectureId)
            )
          );

        if (existing.length === 0) {
          await db
            .insert(userSchedules)
            .values({
              userId,
              lectureId
            });
          results.added.push(lectureId);
        }
      } catch {
        results.errors.push(`授業ID ${lectureId} の追加に失敗`);
      }
    }

    const message = `追加: ${results.added.length}件, 削除: ${results.removed.length}件`;
    
    return NextResponse.json({
      success: results.errors.length === 0,
      data: results,
      message: results.errors.length === 0 ? `時間割を更新しました（${message}）` : message,
      error: results.errors.length > 0 ? results.errors.join(', ') : undefined
    });
  } catch (error) {
    console.error('時間割一括更新エラー:', error);
    return NextResponse.json({
      success: false,
      error: '時間割の更新に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 