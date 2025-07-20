-- RLSを有効にする
ALTER TABLE "user_schedules" ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の時間割のみアクセス可能
CREATE POLICY "Users can view own schedules" ON "user_schedules"
  FOR SELECT USING (auth.uid()::text = user_id);

-- ユーザーは自分の時間割のみ追加可能
CREATE POLICY "Users can insert own schedules" ON "user_schedules"
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- ユーザーは自分の時間割のみ削除可能
CREATE POLICY "Users can delete own schedules" ON "user_schedules"
  FOR DELETE USING (auth.uid()::text = user_id);

-- 授業テーブルは読み取り専用（全ユーザーが閲覧可能）
ALTER TABLE "lectures" ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが授業データを閲覧可能
CREATE POLICY "Anyone can view lectures" ON "lectures"
  FOR SELECT USING (true); 