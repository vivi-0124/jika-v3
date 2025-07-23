'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Copy, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

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

interface GroupManagerProps {
  onGroupSelect: (group: Group | null) => void;
  selectedGroup?: Group | null;
}

export default function GroupManager({ onGroupSelect, selectedGroup }: GroupManagerProps) {
  const { userId, isAuthenticated } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('GroupManager render:', { userId, isAuthenticated });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  // 作成フォーム
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });
  
  // 参加フォーム
  const [joinForm, setJoinForm] = useState({
    inviteCode: ''
  });

  // グループ一覧を取得
  const fetchGroups = async () => {
    console.log('fetchGroups called:', { userId, isAuthenticated, userIdType: typeof userId });
    
    if (!userId || !isAuthenticated) {
      console.log('fetchGroups早期リターン:', { userId, isAuthenticated });
      return;
    }

    setIsLoading(true);
    try {
      const url = `/api/groups?userId=${encodeURIComponent(userId)}`;
      console.log('API call URL:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('API response:', result);
      
      if (result.success) {
        // データの検証とクリーニング
        const rawData = result.data || [];
        console.log('Raw API data:', rawData);
        
        const cleanedData = rawData.map((group: unknown) => {
          if (!group || typeof group !== 'object') {
            console.warn('Invalid group data:', group);
            return null;
          }
          const g = group as Record<string, unknown>;
          
          return {
            id: (g.id as number) || 0,
            name: (g.name as string) || '',
            description: (g.description as string | null) || null,
            createdBy: (g.createdBy as string) || '',
            inviteCode: (g.inviteCode as string) || (g.joinCode as string) || '',
            createdAt: (g.createdAt as string) || new Date().toISOString(),
            role: (g.role as string) || 'member',
            joinedAt: (g.joinedAt as string) || new Date().toISOString()
          };
        }).filter(Boolean); // nullを除外
        
        console.log('Cleaned group data:', cleanedData);
        setGroups(cleanedData);
      } else {
        console.error('グループ取得エラー:', result.error);
        // トースト通知を削除（エラーの場合のみコンソールログ）
      }
    } catch (error) {
      console.error('グループ取得エラー:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      // トースト通知を削除（エラーの場合のみコンソールログ）
    } finally {
      setIsLoading(false);
    }
  };

  // グループを作成
  const handleCreateGroup = async () => {
    if (!userId || !createForm.name.trim()) return;

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createForm.name.trim(),
          description: createForm.description.trim() || null,
          userId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'グループを作成しました');
        setCreateForm({ name: '', description: '' });
        setShowCreateDialog(false);
        fetchGroups();
      } else {
        toast.error(result.error || 'グループの作成に失敗しました');
      }
    } catch (error) {
      console.error('グループ作成エラー:', error);
      toast.error('グループの作成中にエラーが発生しました');
    }
  };

  // グループに参加
  const handleJoinGroup = async () => {
    if (!userId || !joinForm.inviteCode.trim()) return;

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: joinForm.inviteCode.trim(),
          userId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'グループに参加しました');
        setJoinForm({ inviteCode: '' });
        setShowJoinDialog(false);
        fetchGroups();
      } else {
        toast.error(result.error || 'グループの参加に失敗しました');
      }
    } catch (error) {
      console.error('グループ参加エラー:', error);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'グループから脱退しました');
        fetchGroups();
        if (selectedGroup?.id === group.id) {
          onGroupSelect(null);
        }
      } else {
        toast.error(result.error || 'グループの脱退に失敗しました');
      }
    } catch (error) {
      console.error('グループ脱退エラー:', error);
      toast.error('グループの脱退中にエラーが発生しました');
    }
  };

  // 招待コードをコピー
  const copyInviteCode = async (inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast.success('招待コードをコピーしました');
    } catch (error) {
      console.error('コピーエラー:', error);
      toast.error('コピーに失敗しました');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [userId, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) {
    return (
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardContent className="p-6 text-center">
          <p className="text-white">ログインしてグループ機能を利用してください</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-white" />
          <h2 className="text-xl font-bold text-white">グループ管理</h2>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/10">
                参加
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-md border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">グループに参加</DialogTitle>
                <DialogDescription className="text-white/70">
                  招待コードを入力してグループに参加してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode" className="text-white">招待コード</Label>
                  <Input
                    id="inviteCode"
                    value={joinForm.inviteCode}
                    onChange={(e) => setJoinForm({ ...joinForm, inviteCode: e.target.value })}
                    placeholder="例: ABC12345"
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleJoinGroup} disabled={!joinForm.inviteCode.trim()}>
                  参加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-1" />
                作成
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-md border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">新しいグループを作成</DialogTitle>
                <DialogDescription className="text-white/70">
                  時間割を共有するグループを作成してください
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
                    placeholder="グループの説明を入力してください"
                    className="bg-black/20 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateGroup} disabled={!createForm.name.trim()}>
                  作成
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* グループ一覧 */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <p className="text-white">読み込み中...</p>
            </CardContent>
          </Card>
        ) : groups.length === 0 ? (
          <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <p className="text-white/70">まだグループに参加していません</p>
              <p className="text-white/50 text-sm mt-1">新しいグループを作成するか、招待コードで参加してください</p>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card 
              key={group.id} 
              className={`border-0 shadow-xl bg-black/20 backdrop-blur-md cursor-pointer transition-all hover:bg-black/30 ${
                selectedGroup?.id === group.id ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => onGroupSelect(group)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{group.name}</h3>
                      <Badge variant={group.role === 'admin' ? 'destructive' : 'secondary'}>
                        {group.role === 'admin' ? '管理者' : 'メンバー'}
                      </Badge>
                    </div>
                    {group.description && (
                      <p className="text-white/70 text-sm mt-1">{group.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-white/50 text-xs">
                        <span>招待コード:</span>
                        <code className="bg-white/10 px-1 rounded">{group.inviteCode}</code>
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
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveGroup(group);
                      }}
                      className="h-8 w-8 p-0 text-white/50 hover:text-red-400 hover:bg-red-500/20"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 