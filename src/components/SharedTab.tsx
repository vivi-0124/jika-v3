'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Calendar, Copy, UserPlus, LogOut, ChevronRight, Clock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import GroupScheduleView from '@/components/GroupScheduleViewNew';

interface Group {
  id: number;
  name: string;
  description: string | null;
  createdBy: string;
  inviteCode: string;
  createdAt: string;
  role: string;
  joinedAt: string;
}

export default function SharedTab() {
  const { userId, isAuthenticated } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  // フォームの状態
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');

  // グループ一覧を取得
  const fetchGroups = async () => {
    if (!userId || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups?userId=${encodeURIComponent(userId)}`);
      const result = await response.json();
      
      if (result.success) {
        setGroups(result.data || []);
        // 最初のグループを自動選択
        if (result.data && result.data.length > 0 && !selectedGroup) {
          setSelectedGroup(result.data[0]);
        }
      }
    } catch (err) {
      console.error('グループ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // グループ作成
  const handleCreateGroup = async () => {
    if (!userId || !createForm.name.trim()) return;

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          description: createForm.description.trim() || null,
          userId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('グループを作成しました');
        setCreateForm({ name: '', description: '' });
        setShowCreateDialog(false);
        fetchGroups();
      } else {
        toast.error(result.error || 'グループの作成に失敗しました');
      }
    } catch (err) {
      console.error('グループ作成エラー:', err);
      toast.error('グループの作成中にエラーが発生しました');
    }
  };

  // グループに参加
  const handleJoinGroup = async () => {
    if (!userId || !joinCode.trim()) return;

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: joinCode.trim(),
          userId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('グループに参加しました');
        setJoinCode('');
        setShowJoinDialog(false);
        fetchGroups();
      } else {
        toast.error(result.error || 'グループの参加に失敗しました');
      }
    } catch (err) {
      console.error('グループ参加エラー:', err);
      toast.error('グループの参加中にエラーが発生しました');
    }
  };

  // グループから脱退
  const handleLeaveGroup = async (group: Group) => {
    if (!userId) return;

    if (!confirm(`「${group.name}」から脱退しますか？`)) return;

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('グループから脱退しました');
        if (selectedGroup?.id === group.id) {
          setSelectedGroup(null);
        }
        fetchGroups();
      } else {
        toast.error(result.error || 'グループの脱退に失敗しました');
      }
    } catch (err) {
      console.error('グループ脱退エラー:', err);
      toast.error('グループの脱退中にエラーが発生しました');
    }
  };

  // 招待コードをコピー
  const copyInviteCode = async (inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success('招待コードをコピーしました');
    } catch (err) {
      console.error('コピーエラー:', err);
      toast.error('コピーに失敗しました');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [userId, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) {
    return (
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardContent className="p-8 text-center">
          <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">ログインが必要です</h2>
          <p className="text-white/70">グループ機能を利用するにはログインしてください</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                時間割共有
              </CardTitle>
              <p className="text-white/70 mt-2 text-sm">
                グループメンバーと時間割を共有して、共通の空き時間を見つけよう
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <UserPlus className="h-4 w-4 mr-2" />
                    参加
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur-md border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">グループに参加</DialogTitle>
                  <DialogDescription className="text-white/70">
                    友達から共有された招待コードを入力してグループに参加しよう
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteCode" className="text-white">招待コード</Label>
                    <Input
                      id="inviteCode"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="例: ABC12345"
                      className="bg-black/20 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleJoinGroup} disabled={!joinCode.trim()}>
                    参加する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    新規作成
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur-md border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">新しいグループを作成</DialogTitle>
                  <DialogDescription className="text-white/70">
                    友達と時間割を共有するグループを作成しよう
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">グループ名</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="例: 国際教養学科 2年生"
                      className="bg-black/20 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">説明（任意）</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="グループの説明を入力"
                      className="bg-black/20 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateGroup} disabled={!createForm.name.trim()}>
                    作成する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* グループリスト */}
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              マイグループ
              <Badge variant="secondary" className="text-xs">
                {groups.length}
              </Badge>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-white/70">読み込み中...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-12 w-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/70 mb-1">まだグループに参加していません</p>
              <p className="text-white/50 text-sm">新しいグループを作成するか、招待コードで参加してください</p>
            </div>
          ) : (
            <>
              {/* モバイル：グループリスト */}
              <div className="sm:hidden space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id} 
                    className={`p-4 rounded-lg bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:bg-black/50 ${
                      selectedGroup?.id === group.id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{group.name}</h3>
                        {group.description && (
                          <p className="text-white/60 text-sm mt-1 line-clamp-1">{group.description}</p>
                        )}
                      </div>
                      {group.role === 'admin' && (
                        <Badge variant="destructive" className="text-xs ml-2">管理者</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="bg-white/10 px-2 py-1 rounded text-sm text-white/70">
                        {group.inviteCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyInviteCode(group.inviteCode);
                        }}
                        className="h-8 w-8 p-0 text-white/50 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* デスクトップ：グループリスト */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div
                      key={group.id} 
                      className={`p-4 rounded-lg bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:bg-black/50 ${
                        selectedGroup?.id === group.id ? 'ring-2 ring-indigo-500' : ''
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{group.name}</h3>
                          {group.description && (
                            <p className="text-white/60 text-sm mt-1 line-clamp-1">{group.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {group.role === 'admin' && (
                            <Badge variant="destructive" className="text-xs">管理者</Badge>
                          )}
                          <ChevronRight className="h-5 w-5 text-white/40" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="bg-white/10 px-2 py-1 rounded text-sm text-white/70">
                          {group.inviteCode}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyInviteCode(group.inviteCode);
                          }}
                          className="h-8 w-8 p-0 text-white/50 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 選択されたグループの詳細 */}
      {selectedGroup ? (
        <div className="space-y-4">
              {/* グループ情報ヘッダー */}
              <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl text-white">{selectedGroup.name}</CardTitle>
                      {selectedGroup.description && (
                        <p className="text-white/70 mt-1 text-sm sm:text-base">{selectedGroup.description}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveGroup(selectedGroup)}
                      className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 self-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">脱退</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>招待コード: {selectedGroup.inviteCode}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInviteCode(selectedGroup.inviteCode)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 共通空きコマ表示 */}
              <GroupScheduleView group={selectedGroup} />
            </div>
          ) : (
            <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
              <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2">グループを選択してください</h3>
                <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto">
                  上のリストからグループを選択すると、メンバー全員の共通空きコマが表示されます
                </p>
              </CardContent>
            </Card>
          )}
    </div>
  );
}