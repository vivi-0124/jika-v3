import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, groupMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ランダムな招待コードを生成
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ユーザーのグループ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('グループ取得リクエスト:', { userId, userIdType: typeof userId });

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ユーザーIDが必要です'
      }, { status: 400 });
    }

    // ユーザーが参加しているグループを取得
    console.log('クエリ実行前:', { userId });
    
    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdBy: groups.createdBy,
        inviteCode: groups.joinCode, // joinCodeを使用
        createdAt: groups.createdAt,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, userId))
      .orderBy(groups.createdAt);

    console.log('クエリ結果:', { userGroups, count: userGroups.length });

    return NextResponse.json({
      success: true,
      data: userGroups,
      message: `${userGroups.length}件のグループを取得しました`
    });
  } catch (error) {
    console.error('グループ一覧取得エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json({
      success: false,
      error: `グループの取得に失敗しました: ${errorMessage}`
    }, { status: 500 });
  }
}

// グループを作成
export async function POST(request: NextRequest) {
  try {
    const { name, description, userId } = await request.json();

    if (!name || !userId) {
      return NextResponse.json({
        success: false,
        error: 'グループ名とユーザーIDが必要です'
      }, { status: 400 });
    }

    // 招待コードを生成（重複しないまで試行）
    let inviteCode = generateInviteCode();
    let codeExists = true;
    let attempts = 0;
    
    while (codeExists && attempts < 10) {
      const existing = await db
        .select()
        .from(groups)
        .where(eq(groups.joinCode, inviteCode));
      
      if (existing.length === 0) {
        codeExists = false;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    if (codeExists) {
      return NextResponse.json({
        success: false,
        error: '招待コードの生成に失敗しました。もう一度お試しください。'
      }, { status: 500 });
    }

    // グループを作成
    const newGroup = await db
      .insert(groups)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: userId,
        joinCode: inviteCode
      })
      .returning();

    // 作成者をadminとしてグループに追加
    await db
      .insert(groupMembers)
      .values({
        groupId: newGroup[0].id,
        userId,
        role: 'admin'
      });

    return NextResponse.json({
      success: true,
      data: {
        group: newGroup[0],
        role: 'admin'
      },
      message: 'グループを作成しました'
    });
  } catch (error) {
    console.error('グループ作成エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json({
      success: false,
      error: `グループの作成に失敗しました: ${errorMessage}`
    }, { status: 500 });
  }
} 