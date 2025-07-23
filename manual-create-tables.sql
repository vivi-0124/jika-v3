-- Supabase SQL Editorで実行するSQL

-- groupsテーブルを作成
CREATE TABLE IF NOT EXISTS public.groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    invite_code VARCHAR(32) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- group_membersテーブルを作成
CREATE TABLE IF NOT EXISTS public.group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE
);

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON public.groups(invite_code);

-- Row Level Security (RLS) を有効化
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLSポリシーを作成（認証されたユーザーのみアクセス可能）
CREATE POLICY "Users can view groups they are members of" ON public.groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Group admins can update groups" ON public.groups
    FOR UPDATE USING (
        id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid()::text AND role = 'admin'
        )
    );

CREATE POLICY "Users can view group members of their groups" ON public.group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can leave groups" ON public.group_members
    FOR DELETE USING (user_id = auth.uid()::text);