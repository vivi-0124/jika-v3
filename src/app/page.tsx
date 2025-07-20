'use client';

import { useState } from 'react';
import { Search, Calendar, User, Share, CheckSquare, Moon, LogOut } from 'lucide-react';
import LectureSearch from '@/components/LectureSearch';
import ScheduleView from '@/components/ScheduleView';
import LectureList from '@/components/LectureList';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Aurora from '@/components/blocks/backgrounds/Aurora/Aurora';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';


interface Lecture {
  id: number;
  term: string;
  dayOfWeek: string;
  period: string;
  classroom: string;
  classroomCapacity: number;
  targetCommon: string;
  targetIntlStudies: string;
  targetIntlCulture: string;
  targetIntlTourism: string;
  targetSportsHealth: string;
  targetNursing: string;
  targetHealthInfo: string;
  isRemoteClass: string;
  subjectName: string;
  className: string;
  credits: number;
  concurrentSlots: string;
  isPartTimeLecturer: string;
  instructorName: string;
}


export default function HomePage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { signOut } = useAuth();
  const { user, isAuthenticated, isLoading: userLoading } = useUser();

  // ボトムバーのアクティブ状態を管理
  const [activeBottomTab, setActiveBottomTab] = useState<'schedule' | 'search' | 'share' | 'todo'>('schedule');

  const handleSignOut = async () => {
    try {
      await signOut();
      // ログアウト成功後は自動的にログインページにリダイレクトされる
    } catch (error) {
      console.error('ログアウトエラー:', error);
      // エラーが発生した場合でも、強制的にログインページに移動
      window.location.href = '/login';
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex flex-col min-h-screen relative overflow-hidden">
        {/* オーロラ背景 */}
        <div className="fixed inset-0 z-0 bg-black">
          <Aurora
            colorStops={["#000066", "#eb6d9a", "#000066"]}
            amplitude={1.0}
            blend={0.5}
            speed={1.0}
          />
        </div>

        {/* ヘッダー */}
        <header className="bg-transparent backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select defaultValue="3年前期">
                  <SelectTrigger className="w-32 bg-black/20 backdrop-blur-sm border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="1年前期">1年前期</SelectItem>
                    <SelectItem value="1年後期">1年後期</SelectItem>
                    <SelectItem value="2年前期">2年前期</SelectItem>
                    <SelectItem value="2年後期">2年後期</SelectItem>
                    <SelectItem value="3年前期">3年前期</SelectItem>
                    <SelectItem value="3年後期">3年後期</SelectItem>
                    <SelectItem value="4年前期">4年前期</SelectItem>
                    <SelectItem value="4年後期">4年後期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    2024年度 3年前期
                  </h1>
                  <div className="mt-1 px-3 py-1 bg-gray-800/50 rounded-full">
                    <span className="text-xs text-white/80">合計 18単位</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Moon className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-white/20">
                    <div className="px-3 py-2">
                      <p className="text-sm text-white">
                        {isAuthenticated ? 'ログイン中' : '認証中...'}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {user?.email || '読み込み中...'}
                      </p>
                      {userLoading && (
                        <p className="text-xs text-white/40 mt-1">データ読み込み中...</p>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                      disabled={!isAuthenticated}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 container mx-auto relative z-10">
          <Card className="border-0 shadow-2xl bg-black/20 backdrop-blur-md">
            <CardContent className="p-0">
              {/* 時間割機能 */}
              {activeBottomTab === 'schedule' && (
                <ScheduleView />
              )}

              {/* 検索機能 */}
              {activeBottomTab === 'search' && (
                <div className="space-y-6">
                  <LectureSearch 
                    onSearch={(results) => setLectures(results)} 
                    onSearchStateChange={setIsSearching}
                  />
                  <LectureList 
                    lectures={lectures} 
                    loading={isSearching} 
                  />
                </div>
              )}

              {/* 共有機能 */}
              {activeBottomTab === 'share' && (
                <div className="space-y-6 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Share className="h-5 w-5 text-white" />
                    <h2 className="text-xl font-bold text-white">共有</h2>
                  </div>
                  <div className="text-center py-12">
                    <Share className="mx-auto h-12 w-12 text-white/40" />
                    <h3 className="mt-4 text-sm font-medium text-white">共有機能</h3>
                    <p className="mt-2 text-xs text-white/60">時間割の共有機能は準備中です。</p>
                  </div>
                </div>
              )}

              {/* やること機能 */}
              {activeBottomTab === 'todo' && (
                <div className="space-y-6 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckSquare className="h-5 w-5 text-white" />
                    <h2 className="text-xl font-bold text-white">やること</h2>
                  </div>
                  <div className="text-center py-12">
                    <CheckSquare className="mx-auto h-12 w-12 text-white/40" />
                    <h3 className="mt-4 text-sm font-medium text-white">やることリスト</h3>
                    <p className="mt-2 text-xs text-white/60">やることリスト機能は準備中です。</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* ボトムナビゲーション */}
        <footer className="bg-transparent backdrop-blur-md border-t border-white/40 fixed bottom-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-around">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-white/10"
                onClick={() => setActiveBottomTab('schedule')}
                data-testid="schedule-view-tab"
              >
                <Calendar className={`h-5 w-5 ${activeBottomTab === 'schedule' ? 'text-white' : 'text-white/60'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-white/10"
                onClick={() => setActiveBottomTab('search')}
                data-testid="search-tab"
              >
                <Search className={`h-5 w-5 ${activeBottomTab === 'search' ? 'text-white' : 'text-white/60'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-white/10"
                onClick={() => setActiveBottomTab('share')}
                data-testid="share-tab"
              >
                <Share className={`h-5 w-5 ${activeBottomTab === 'share' ? 'text-white' : 'text-white/60'}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-white/10"
                onClick={() => setActiveBottomTab('todo')}
                data-testid="todo-tab"
              >
                <CheckSquare className={`h-5 w-5 ${activeBottomTab === 'todo' ? 'text-white' : 'text-white/60'}`} />
              </Button>
            </div>
          </div>
        </footer>


      </div>
    </AuthGuard>
  );
}
