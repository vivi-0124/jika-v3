import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabaseの環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('テストユーザーを作成中...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
    });

    if (error) {
      console.error('ユーザー作成エラー:', error);
      return;
    }

    console.log('テストユーザーが正常に作成されました:', data.user?.email);
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

createTestUser(); 