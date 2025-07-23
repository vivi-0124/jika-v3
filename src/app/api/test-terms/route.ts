import { NextResponse } from 'next/server';
import { db } from '@/db';
import { lectures, userSchedules } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // lecturesテーブルから全てのユニークなterm値を取得
    const uniqueTerms = await db
      .selectDistinct({
        term: lectures.term
      })
      .from(lectures)
      .orderBy(lectures.term);

    // 各ユーザーの時間割に含まれる学期も確認
    const userScheduleTerms = await db
      .selectDistinct({
        term: lectures.term,
        count: sql<number>`count(*)`.as('count')
      })
      .from(userSchedules)
      .innerJoin(lectures, sql`${userSchedules.lectureId} = ${lectures.id}`)
      .groupBy(lectures.term)
      .orderBy(lectures.term);

    // 特定のユーザーIDの時間割を確認（テスト用）
    const testUserId = '9a7c90f5-d3a3-4bb9-812f-49eb890b15cb';
    const userLectures = await db
      .select({
        term: lectures.term,
        dayOfWeek: lectures.dayOfWeek,
        period: lectures.period,
        subjectName: lectures.subjectName
      })
      .from(userSchedules)
      .innerJoin(lectures, sql`${userSchedules.lectureId} = ${lectures.id}`)
      .where(sql`${userSchedules.userId} = ${testUserId}`)
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        uniqueTerms: uniqueTerms.map(t => t.term),
        userScheduleTerms,
        sampleUserLectures: {
          userId: testUserId,
          lectures: userLectures
        }
      }
    });
  } catch (error) {
    console.error('学期確認エラー:', error);
    return NextResponse.json({
      success: false,
      error: `エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, { status: 500 });
  }
}