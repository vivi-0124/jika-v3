import { pgTable, serial, timestamp, varchar, integer, smallint, text, uuid } from 'drizzle-orm/pg-core';

// 授業テーブル（実際のエクセルデータに合わせて）
export const lectures = pgTable('lectures', {
  id: serial('id').primaryKey(),
  term: varchar('term', { length: 16 }).notNull(), // 例: '2024前期'
  dayOfWeek: varchar('day_of_week', { length: 8 }).notNull(), // 例: '月', 'Tue'
  period: varchar('period', { length: 8 }).notNull(), // 例: '1', '2'
  classroom: varchar('classroom', { length: 32 }), // 教室
  classroomCapacity: smallint('classroom_capacity'), // 教室定員
  targetCommon: varchar('target_common', { length: 16 }), // 共通科目対象
  targetIntlStudies: varchar('target_intl_studies', { length: 16 }), // 国際教養学科対象
  targetIntlCulture: varchar('target_intl_culture', { length: 16 }), // 国際文化学科対象
  targetIntlTourism: varchar('target_intl_tourism', { length: 16 }), // 国際観光学科対象
  targetSportsHealth: varchar('target_sports_health', { length: 16 }), // スポーツ健康学科対象
  targetNursing: varchar('target_nursing', { length: 16 }), // 看護学科対象
  targetHealthInfo: varchar('target_health_info', { length: 16 }), // 健康情報学科対象
  isRemoteClass: varchar('is_remote_class', { length: 8 }), // リモート授業かどうか
  subjectName: varchar('subject_name', { length: 64 }).notNull(), // 科目名
  className: varchar('class_name', { length: 32 }), // クラス名
  credits: integer('credits'), // 単位数
  concurrentSlots: varchar('concurrent_slots', { length: 32 }), // 同時開講枠
  isPartTimeLecturer: varchar('is_part_time_lecturer', { length: 8 }), // 非常勤講師かどうか
  instructorName: varchar('instructor_name', { length: 64 }), // 教員名
});

// ユーザーの時間割テーブル（後で使用）
export const userSchedules = pgTable('user_schedules', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Supabase AuthのユーザーID
  lectureId: serial('lecture_id').references(() => lectures.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// グループテーブル
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // グループ名
  description: text('description'), // グループ説明
  createdBy: varchar('created_by', { length: 255 }).notNull(), // 作成者のユーザーID
  inviteCode: varchar('invite_code', { length: 32 }).notNull().unique(), // 招待コード
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// グループメンバーテーブル
export const groupMembers = pgTable('group_members', {
  id: serial('id').primaryKey(),
  groupId: serial('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(), // Supabase AuthのユーザーID
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'admin' または 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export type Lecture = typeof lectures.$inferSelect;
export type NewLecture = typeof lectures.$inferInsert;
export type UserSchedule = typeof userSchedules.$inferSelect;
export type NewUserSchedule = typeof userSchedules.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert; 