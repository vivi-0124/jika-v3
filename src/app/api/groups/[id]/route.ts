import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, groupMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// グループ詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (isNaN(groupId) || groupId <= 0) {
      return NextResponse.json({
        success: false,
        error: '無効なグループIDです'
      }, { status: 400 });
    }

    // グループ情報を取得
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
        userId: groupMembers.userId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt
      })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(groupMembers.joinedAt);

    // リクエストユーザーがメンバーかチェック（オプション）
    let userRole = null;
    if (userId) {
      const userMembership = members.find(member => member.userId === userId);
      userRole = userMembership?.role || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        group: group[0],
        members,
        userRole,
        memberCount: members.length
      }
    });
  } catch (error) {
    console.error('グループ詳細取得エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'グループの詳細取得に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
}

// グループから脱退
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);
    const { userId } = await request.json();

    if (isNaN(groupId) || groupId <= 0) {
      return NextResponse.json({
        success: false,
        error: '無効なグループIDです'
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ユーザーIDが必要です'
      }, { status: 400 });
    }

    // メンバーシップを確認
    const membership = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      );

    if (membership.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'このグループのメンバーではありません'
      }, { status: 404 });
    }

    // 管理者が脱退する場合の確認
    if (membership[0].role === 'admin') {
      // 他に管理者がいるかチェック
      const otherAdmins = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.role, 'admin'),
            eq(groupMembers.userId, userId) // 除外
          )
        );

      if (otherAdmins.length === 0) {
        return NextResponse.json({
          success: false,
          error: '他に管理者がいないため、脱退できません。先に別のメンバーを管理者に設定するか、グループを削除してください。'
        }, { status: 400 });
      }
    }

    // グループから脱退
    await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'グループから脱退しました'
    });
  } catch (error) {
    console.error('グループ脱退エラー:', error);
    return NextResponse.json({
      success: false,
      error: 'グループの脱退に失敗しました。もう一度お試しください。'
    }, { status: 500 });
  }
} 