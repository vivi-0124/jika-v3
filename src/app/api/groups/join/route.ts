import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, groupMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// グループに参加
export async function POST(request: NextRequest) {
  try {
    const { inviteCode, userId } = await request.json();

    if (!inviteCode || !userId) {
      return NextResponse.json({
        success: false,
        error: '招待コードとユーザーIDが必要です'
      }, { status: 400 });
    }

    // 招待コードでグループを検索
    const group = await db
      .select()
      .from(groups)
      .where(eq(groups.inviteCode, inviteCode.toUpperCase()))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json({
        success: false,
        error: '無効な招待コードです'
      }, { status: 404 });
    }

    // 既にグループに参加しているかチェック
    const existingMembership = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, group[0].id),
          eq(groupMembers.userId, userId)
        )
      );

    if (existingMembership.length > 0) {
      return NextResponse.json({
        success: false,
        error: '既にこのグループに参加しています'
      }, { status: 409 });
    }

    // グループに参加
    const newMembership = await db
      .insert(groupMembers)
      .values({
        groupId: group[0].id,
        userId,
        role: 'member'
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        group: group[0],
        membership: newMembership[0]
      },
      message: `グループ「${group[0].name}」に参加しました`
    });
  } catch (error) {
    console.error('グループ参加エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'グループの参加に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 