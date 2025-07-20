'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { db } from '@/db';
import { userSchedules, lectures } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ユーザーの時間割を取得
export async function getUserScheduleAction(userId: string, term: string = '前学期'): Promise<ActionResult> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'ユーザーIDが必要です'
      };
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

    return {
      success: true,
      data: userSchedule,
      message: `${userSchedule.length}件の時間割を取得しました`
    };
  } catch (error) {
    console.error('ユーザー時間割取得エラー:', error);
    return {
      success: false,
      error: 'ユーザー時間割の取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 授業を時間割に追加
export async function addLectureToScheduleAction(userId: string, lectureId: number): Promise<ActionResult> {
  try {
    if (!userId || !lectureId) {
      return {
        success: false,
        error: 'ユーザーIDと授業IDが必要です'
      };
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
      return {
        success: false,
        error: 'この授業は既に時間割に追加されています'
      };
    }

    // 時間割に追加
    const newSchedule = await db
      .insert(userSchedules)
      .values({
        userId,
        lectureId
      })
      .returning();

    // キャッシュの再検証
    revalidateTag(`user-schedule-${userId}`);
    revalidatePath('/');

    return {
      success: true,
      data: newSchedule[0],
      message: '授業を時間割に追加しました'
    };
  } catch (error) {
    console.error('授業追加エラー:', error);
    return {
      success: false,
      error: '授業の追加に失敗しました。もう一度お試しください。'
    };
  }
}

// 授業を時間割から削除
export async function removeLectureFromScheduleAction(userId: string, lectureId: number): Promise<ActionResult> {
  try {
    if (!userId || !lectureId) {
      return {
        success: false,
        error: 'ユーザーIDと授業IDが必要です'
      };
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
      return {
        success: false,
        error: '削除対象の授業が見つかりません'
      };
    }

    // キャッシュの再検証
    revalidateTag(`user-schedule-${userId}`);
    revalidatePath('/');

    return {
      success: true,
      data: deletedRows[0],
      message: '授業を時間割から削除しました'
    };
  } catch (error) {
    console.error('授業削除エラー:', error);
    return {
      success: false,
      error: '授業の削除に失敗しました。もう一度お試しください。'
    };
  }
}

// 時間割の一括更新（複数授業の追加/削除）
export async function updateScheduleBatchAction(
  userId: string,
  addLectureIds: number[] = [],
  removeLectureIds: number[] = []
): Promise<ActionResult> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'ユーザーIDが必要です'
      };
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

    // キャッシュの再検証
    revalidateTag(`user-schedule-${userId}`);
    revalidatePath('/');

    const message = `追加: ${results.added.length}件, 削除: ${results.removed.length}件`;
    
    return {
      success: results.errors.length === 0,
      data: results,
      message: results.errors.length === 0 ? `時間割を更新しました（${message}）` : message,
      error: results.errors.length > 0 ? results.errors.join(', ') : undefined
    };
  } catch (error) {
    console.error('時間割一括更新エラー:', error);
    return {
      success: false,
      error: '時間割の更新に失敗しました。もう一度お試しください。'
    };
  }
} 