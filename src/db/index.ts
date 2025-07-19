import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, like, and, or, isNotNull, ne } from 'drizzle-orm';
import * as schema from './schema';

// 環境変数からデータベースURLを取得
const connectionString = process.env.DATABASE_URL!;

// postgresクライアントを作成
const client = postgres(connectionString);

// drizzleクライアントを作成
export const db = drizzle(client, { schema });

// 型エクスポート
export * from './schema';

// 授業検索関数
export async function searchLectures(params: {
  query?: string;
  dayOfWeek?: string;
  period?: string;
  term?: string;
  target?: string;
}) {
  const { query, dayOfWeek, period, term, target } = params;
  
  const conditions = [];
  
  // 基本的な条件：subject_nameがnullでなく、空文字列でもないもののみ
  conditions.push(
    and(
      isNotNull(schema.lectures.subjectName),
      ne(schema.lectures.subjectName, '')
    )
  );
  
  if (query) {
    conditions.push(
      or(
        like(schema.lectures.subjectName, `%${query}%`),
        like(schema.lectures.instructorName, `%${query}%`),
        like(schema.lectures.className, `%${query}%`)
      )
    );
  }
  
  if (dayOfWeek) {
    conditions.push(eq(schema.lectures.dayOfWeek, dayOfWeek));
  }
  
  if (period) {
    conditions.push(eq(schema.lectures.period, period));
  }
  
  if (term) {
    // termの値を実際のデータに合わせて変換
    let actualTerm = term;
    if (term === '2024前期') actualTerm = '前学期';
    if (term === '2024後期') actualTerm = '後学期';
    if (term === '2023前期') actualTerm = '前学期';
    if (term === '2023後期') actualTerm = '後学期';
    
    conditions.push(eq(schema.lectures.term, actualTerm));
  }
  
  if (target) {
    conditions.push(
      or(
        eq(schema.lectures.targetCommon, target),
        eq(schema.lectures.targetIntlStudies, target),
        eq(schema.lectures.targetIntlCulture, target),
        eq(schema.lectures.targetIntlTourism, target),
        eq(schema.lectures.targetSportsHealth, target),
        eq(schema.lectures.targetNursing, target),
        eq(schema.lectures.targetHealthInfo, target)
      )
    );
  }
  


  return await db
    .select()
    .from(schema.lectures)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(schema.lectures.term, schema.lectures.dayOfWeek, schema.lectures.period);
}

// 全授業取得関数
export async function getAllLectures() {
  return await db
    .select()
    .from(schema.lectures)
    .where(
      and(
        isNotNull(schema.lectures.subjectName),
        ne(schema.lectures.subjectName, '')
      )
    )
    .orderBy(schema.lectures.term, schema.lectures.dayOfWeek, schema.lectures.period);
}

// 授業詳細取得関数
export async function getLectureById(id: number) {
  const result = await db
    .select()
    .from(schema.lectures)
    .where(eq(schema.lectures.id, id));
  
  return result[0];
}

// 時間割取得関数（曜日別）
export async function getLecturesByDay(dayOfWeek: string, term: string) {
  return await db
    .select()
    .from(schema.lectures)
    .where(
      and(
        eq(schema.lectures.dayOfWeek, dayOfWeek),
        eq(schema.lectures.term, term),
        and(
          isNotNull(schema.lectures.subjectName),
          ne(schema.lectures.subjectName, '')
        )
      )
    )
    .orderBy(schema.lectures.period);
}

// 対象学科別取得関数
export async function getLecturesByTarget(target: string, term: string) {
  return await db
    .select()
    .from(schema.lectures)
    .where(
      and(
        or(
          eq(schema.lectures.targetCommon, target),
          eq(schema.lectures.targetIntlStudies, target),
          eq(schema.lectures.targetIntlCulture, target),
          eq(schema.lectures.targetIntlTourism, target),
          eq(schema.lectures.targetSportsHealth, target),
          eq(schema.lectures.targetNursing, target),
          eq(schema.lectures.targetHealthInfo, target)
        ),
        eq(schema.lectures.term, term),
        and(
          isNotNull(schema.lectures.subjectName),
          ne(schema.lectures.subjectName, '')
        )
      )
    )
    .orderBy(schema.lectures.dayOfWeek, schema.lectures.period);
} 