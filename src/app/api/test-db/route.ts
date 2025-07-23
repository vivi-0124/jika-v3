import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // データベース接続をテスト
    const result = await db.execute(sql`SELECT current_database(), current_user, version()`);
    
    // テーブル一覧を取得
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    // groupsテーブルが存在するかチェック
    const groupsTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'groups'
      )
    `);

    // group_membersテーブルが存在するかチェック
    const groupMembersTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'group_members'
      )
    `);

    // groupsテーブルの構造を確認
    const groupsColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'groups'
      ORDER BY ordinal_position
    `);

    // group_membersテーブルの構造を確認
    const groupMembersColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'group_members'
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      success: true,
      data: {
        connection: result[0],
        tables: tables.map(t => t.table_name),
        groupsTableExists: groupsTableExists[0].exists,
        groupMembersTableExists: groupMembersTableExists[0].exists,
        groupsColumns: groupsColumns,
        groupMembersColumns: groupMembersColumns
      }
    });
  } catch (error) {
    console.error('データベーステストエラー:', error);
    return NextResponse.json({
      success: false,
      error: `データベース接続エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    }, { status: 500 });
  }
}