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

// periodの形式を正規化（'１限' -> '1', '1限' -> '1'）
function normalizePeriod(period: string): string {
  // 数字部分を抽出
  const match = period.match(/[0-9１-９]/);
  if (!match) return period;
  
  // 全角数字を半角に変換
  const num = match[0].replace(/[１-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });
  
  return num;
}

// グループメンバーの共通空きコマを取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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
    
    console.log('グループメンバー:', {
      groupId,
      members: members.map(m => m.userId)
    });

    // データベースの形式に合わせる（年度なしの '前学期' または '後学期'）
    const dbTerm = term;

    if (members.length === 0) {
      const emptySlots = generateTimeSlots();
      return NextResponse.json({
        success: true,
        data: {
          term: dbTerm,
          totalMembers: 0,
          timeSlots: emptySlots,
          freeSlots: emptySlots
        },
        message: 'グループにメンバーがいません'
      });
    }

    const memberUserIds = members.map(m => m.userId);
    
    console.log('共通空きコマ検索条件:', {
      groupId,
      term,
      dbTerm,
      memberUserIds,
      memberCount: memberUserIds.length
    });

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
          eq(lectures.term, dbTerm)
        )
      );
    
    console.log('取得した授業データ:', {
      count: allSchedules.length,
      samples: allSchedules.slice(0, 5)
    });

    // タイムスロットを初期化
    const timeSlots = generateTimeSlots();

    // 各メンバーの授業を確認してタイムスロットを更新
    for (const schedule of allSchedules) {
      // periodを正規化
      const normalizedPeriod = normalizePeriod(schedule.period);
      
      const slotIndex = timeSlots.findIndex(
        slot => slot.dayOfWeek === schedule.dayOfWeek && slot.period === normalizedPeriod
      );

      if (slotIndex !== -1) {
        if (!timeSlots[slotIndex].occupiedBy) {
          timeSlots[slotIndex].occupiedBy = [];
        }
        timeSlots[slotIndex].occupiedBy!.push(schedule.userId);
      }
    }

    // 各スロットについて、全員が空いているかどうかを判定
    for (const slot of timeSlots) {
      const occupied = slot.occupiedBy?.length || 0;
      // 全員が空いている = 誰も授業がない
      slot.isFree = occupied === 0;
    }
    
    // 全員が空いている時間を抽出
    const freeSlots = timeSlots.filter(slot => slot.isFree);
    
    // デバッグ: 授業がある時間帯を確認
    const occupiedSlots = timeSlots.filter(slot => (slot.occupiedBy?.length || 0) > 0);
    console.log('授業がある時間帯:', occupiedSlots.map(slot => ({
      day: slot.dayOfWeek,
      period: slot.period,
      occupiedCount: slot.occupiedBy?.length,
      users: slot.occupiedBy
    })));

    const analysis: FreeSlotAnalysis = {
      term: dbTerm,
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