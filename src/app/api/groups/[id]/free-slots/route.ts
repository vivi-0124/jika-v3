import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, groupMembers, userSchedules, lectures } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

interface TimeSlot {
  dayOfWeek: string;
  period: string;
  isFree: boolean;
  occupiedBy?: string[]; // この時間に授業がある人のユーザーID
}

interface FreeSlotAnalysis {
  term: string;
  totalMembers: number;
  timeSlots: TimeSlot[];
  freeSlots: TimeSlot[];
}

// 時間割のタイムスロットを生成
function generateTimeSlots(): TimeSlot[] {
  const days = ['月', '火', '水', '木', '金'];
  const periods = ['1', '2', '3', '4', '5'];
  const slots: TimeSlot[] = [];

  for (const day of days) {
    for (const period of periods) {
      slots.push({
        dayOfWeek: day,
        period,
        isFree: true,
        occupiedBy: []
      });
    }
  }

  return slots;
}

// グループメンバーの共通空きコマを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || '前学期';

    if (isNaN(groupId) || groupId <= 0) {
      return NextResponse.json({
        success: false,
        error: '無効なグループIDです'
      }, { status: 400 });
    }

    // グループの存在確認
    const group = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'グループが見つかりません'
      }, { status: 404 });
    }

    // グループメンバーを取得
    const members = await db
      .select({
        userId: groupMembers.userId
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    if (members.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          term,
          totalMembers: 0,
          timeSlots: generateTimeSlots(),
          freeSlots: generateTimeSlots()
        },
        message: 'グループにメンバーがいません'
      });
    }

    const memberUserIds = members.map(m => m.userId);

    // 全メンバーの時間割を取得
    const allSchedules = await db
      .select({
        userId: userSchedules.userId,
        dayOfWeek: lectures.dayOfWeek,
        period: lectures.period,
        subjectName: lectures.subjectName,
        className: lectures.className
      })
      .from(userSchedules)
      .innerJoin(lectures, eq(userSchedules.lectureId, lectures.id))
      .where(
        and(
          inArray(userSchedules.userId, memberUserIds),
          eq(lectures.term, term)
        )
      );

    // タイムスロットを初期化
    const timeSlots = generateTimeSlots();

    // 各メンバーの授業を確認してタイムスロットを更新
    for (const schedule of allSchedules) {
      const slotIndex = timeSlots.findIndex(
        slot => slot.dayOfWeek === schedule.dayOfWeek && slot.period === schedule.period
      );

      if (slotIndex !== -1) {
        if (!timeSlots[slotIndex].occupiedBy) {
          timeSlots[slotIndex].occupiedBy = [];
        }
        timeSlots[slotIndex].occupiedBy!.push(schedule.userId);
      }
    }

    // 全員が空いている時間を特定
    const freeSlots = timeSlots.filter(slot => {
      const occupied = slot.occupiedBy?.length || 0;
      slot.isFree = occupied === 0;
      return slot.isFree;
    });

    const analysis: FreeSlotAnalysis = {
      term,
      totalMembers: members.length,
      timeSlots,
      freeSlots
    };

    return NextResponse.json({
      success: true,
      data: analysis,
      message: `${freeSlots.length}個の共通空きコマが見つかりました`
    });
  } catch (error) {
    console.error('空きコマ検索エラー:', error);
    return NextResponse.json({
      success: false,
      error: '空きコマの検索に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 