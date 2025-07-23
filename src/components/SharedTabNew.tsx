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
import GroupScheduleView from './GroupScheduleViewNew';

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

export default function SharedTabNew() {
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
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <Share2 className="h-6 w-6 sm:h-8 sm:w-8" />
              時間割共有
            </h1>
            <p className="text-white/70 mt-2 text-sm sm:text-base">
              グループメンバーと時間割を共有して、共通の空き時間を見つけよう
            </p>
          </div>
          <div className="flex gap-2 justify-center sm:justify-end">
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">参加</span>
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
                  <span className="hidden sm:inline">新規作成</span>
                  <span className="sm:hidden">作成</span>
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
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-6">
        {/* グループリスト */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              マイグループ
              <Badge variant="secondary" className="ml-2 text-xs">
                {groups.length}
              </Badge>
            </h2>
          </div>
          
          {isLoading ? (
            <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
              <CardContent className="p-4 sm:p-6 text-center">
                <p className="text-white text-sm">読み込み中...</p>
              </CardContent>
            </Card>
          ) : groups.length === 0 ? (
            <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
              <CardContent className="p-4 sm:p-6 text-center">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/70 mb-1 text-sm sm:text-base">まだグループに参加していません</p>
                <p className="text-white/50 text-xs sm:text-sm">新しいグループを作成するか、招待コードで参加してください</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* モバイル：水平スクロール可能なグループリスト */}
              <div className="sm:hidden">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {groups.map((group) => (
                    <Card 
                      key={group.id} 
                      className={`border-0 shadow-xl bg-black/20 backdrop-blur-md cursor-pointer transition-all hover:bg-black/30 flex-shrink-0 w-64 ${
                        selectedGroup?.id === group.id ? 'ring-2 ring-indigo-500 bg-black/30' : ''
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white text-sm truncate flex-1">{group.name}</h3>
                          {group.role === 'admin' && (
                            <Badge variant="destructive" className="text-xs ml-2">管理者</Badge>
                          )}
                        </div>
                        {group.description && (
                          <p className="text-white/60 text-xs mb-2 line-clamp-2">{group.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/70">
                            {group.inviteCode}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyInviteCode(group.inviteCode);
                            }}
                            className="h-6 w-6 p-0 text-white/50 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* デスクトップ：縦に並んだグループリスト */}
              <div className="hidden sm:block">
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {groups.map((group) => (
                    <Card 
                      key={group.id} 
                      className={`border-0 shadow-xl bg-black/20 backdrop-blur-md cursor-pointer transition-all hover:bg-black/30 ${
                        selectedGroup?.id === group.id ? 'ring-2 ring-indigo-500 bg-black/30' : ''
                      }`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white text-sm">{group.name}</h3>
                              {group.role === 'admin' && (
                                <Badge variant="destructive" className="text-xs">管理者</Badge>
                              )}
                            </div>
                            {group.description && (
                              <p className="text-white/60 text-xs mb-2 line-clamp-2">{group.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-white/50">
                              <span className="bg-white/10 px-2 py-1 rounded">
                                {group.inviteCode}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyInviteCode(group.inviteCode);
                                }}
                                className="h-6 w-6 p-0 text-white/50 hover:text-white"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 選択されたグループの詳細 */}
        <div>
          {selectedGroup ? (
            <div className="space-y-4 sm:space-y-6">
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
      </div>
    </div>
  );
}