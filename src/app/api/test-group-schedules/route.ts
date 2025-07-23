import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, groupMembers, userSchedules, lectures } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    
    if (!groupId) {
      // 全グループの一覧を取得
      const allGroups = await db.select().from(groups);
      return NextResponse.json({
        success: true,
        groups: allGroups
      });
    }

    // 特定グループの詳細情報を取得
    const groupIdNum = parseInt(groupId);
    
    // グループメンバーを取得
    const members = await db
      .select({
        userId: groupMembers.userId,
        role: groupMembers.role
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupIdNum));

    // 各メンバーの時間割を取得
    const memberSchedules = [];
    for (const member of members) {
      const schedules = await db
        .select({
          userId: userSchedules.userId,
          lectureId: userSchedules.lectureId,
          term: lectures.term,
          dayOfWeek: lectures.dayOfWeek,
          period: lectures.period,
          subjectName: lectures.subjectName
        })
        .from(userSchedules)
        .innerJoin(lectures, eq(userSchedules.lectureId, lectures.id))
        .where(eq(userSchedules.userId, member.userId));
      
      memberSchedules.push({
        userId: member.userId,
        role: member.role,
        schedules: schedules
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        groupId: groupIdNum,
        members: memberSchedules,
        summary: memberSchedules.map(m => ({
          userId: m.userId,
          lectureCount: m.schedules.length,
          lectures: m.schedules.map(s => `${s.dayOfWeek}${s.period}限: ${s.subjectName}`)
        }))
      }
    });
  } catch (error) {
    console.error('テストAPI エラー:', error);
    return NextResponse.json({
      success: false,
      error: `エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, { status: 500 });
  }
}