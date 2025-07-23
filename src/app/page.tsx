'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, User, Share, CheckSquare, LogOut } from 'lucide-react';
import LectureSearch from '@/components/LectureSearch';
import ScheduleView from '@/components/ScheduleView';
import LectureList from '@/components/LectureList';
import SharedTab from '@/components/SharedTab';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Aurora from '@/components/blocks/backgrounds/Aurora/Aurora';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';

// 型定義
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

type BottomTab = 'schedule' | 'search' | 'share' | 'todo';

// 定数
const GRADE_OPTIONS = [
  '1年前期', '1年後期',
  '2年前期', '2年後期', 
  '3年前期', '3年後期',
  '4年前期', '4年後期'
] as const;

const BOTTOM_TABS = [
  { id: 'schedule' as const, icon: Calendar },
  { id: 'search' as const, icon: Search },
  { id: 'share' as const, icon: Share },
  { id: 'todo' as const, icon: CheckSquare }
] as const;

// コンポーネント
const Header = ({ 
  selectedGrade, 
  onGradeChange, 
  totalCredits, 
  currentYear, 
  user, 
  isAuthenticated, 
  userLoading, 
  onProfileClick, 
  onSignOut 
}: {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  totalCredits: number;
  currentYear: number;
  user: { email?: string } | null;
  isAuthenticated: boolean;
  userLoading: boolean;
  onProfileClick: () => void;
  onSignOut: () => void;
}) => (
  <header className="bg-transparent backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between h-16">
        {/* 学年・学期選択 */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 h-10 w-10 p-0"
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-black border-white/20">
              <div className="px-3 py-2">
                <p className="text-sm text-white font-medium">学年・学期を選択</p>
              </div>
              <DropdownMenuSeparator className="bg-white/20" />
              {GRADE_OPTIONS.map((grade) => (
                <DropdownMenuItem 
                  key={grade}
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => onGradeChange(grade)}
                >
                  {grade}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* タイトル */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {currentYear}年度 {selectedGrade}
            </h1>
            <span className="text-xs text-white/80">合計 {totalCredits}単位</span>
          </div>
        </div>
        
        {/* ユーザーメニュー */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 h-10 w-10 p-0"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-black border-white/20 text-white">
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
                onClick={onProfileClick}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <User className="mr-2 h-4 w-4" />
                プロフィール
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem 
                onClick={onSignOut}
                className="text-white hover:bg-white/10 hover:text-white"
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
);

const BottomNavigation = ({ 
  activeTab, 
  onTabChange 
}: {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}) => (
  <footer className="bg-transparent backdrop-blur-md border-t border-white/40 fixed bottom-0 left-0 right-0 z-50">
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center justify-around">
        {BOTTOM_TABS.map(({ id, icon: Icon }) => (
          <Button 
            key={id}
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center space-y-1 h-auto py-2 hover:bg-white/10"
            onClick={() => onTabChange(id)}
            data-testid={`${id}-tab`}
          >
            <Icon className={`h-5 w-5 ${activeTab === id ? 'text-white' : 'text-white/60'}`} />
          </Button>
        ))}
      </div>
    </div>
  </footer>
);

const MainContent = ({ 
  activeTab, 
  lectures, 
  isSearching, 
  onSearch, 
  onSearchStateChange 
}: {
  activeTab: BottomTab;
  lectures: Lecture[];
  isSearching: boolean;
  onSearch: (results: Lecture[]) => void;
  onSearchStateChange: (searching: boolean) => void;
}) => {
  console.log('MainContent active tab:', activeTab);
  
  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleView />;
      
      case 'search':
        return (
          <div className="space-y-6">
            <LectureSearch 
              onSearch={onSearch} 
              onSearchStateChange={onSearchStateChange}
            />
            <LectureList 
              lectures={lectures} 
              loading={isSearching} 
            />
          </div>
        );
      
      case 'share':
        return (
          <div className="p-6">
            <SharedTab />
          </div>
        );
      
      case 'todo':
        return (
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
        );
      
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 container mx-auto relative z-10">
      <Card className="border-0 shadow-2xl bg-transparent backdrop-blur-md">
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
    </main>
  );
};

// メインコンポーネント
export default function HomePage() {
  const router = useRouter();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('schedule');
  const [selectedGrade, setSelectedGrade] = useState('3年前期');
  
  const { signOut } = useAuth();
  const { user, isAuthenticated, isLoading: userLoading, userSchedule } = useUser();

  // 現在の年度を取得
  const currentYear = new Date().getFullYear();
  
  // 単位数を計算
  const totalCredits = userSchedule.reduce((total, item) => total + (item.lecture.credits || 0), 0);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
      window.location.href = '/login';
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
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
        <Header
          selectedGrade={selectedGrade}
          onGradeChange={setSelectedGrade}
          totalCredits={totalCredits}
          currentYear={currentYear}
          user={user}
          isAuthenticated={isAuthenticated}
          userLoading={userLoading}
          onProfileClick={handleProfileClick}
          onSignOut={handleSignOut}
        />

        {/* メインコンテンツ */}
        <MainContent
          activeTab={activeBottomTab}
          lectures={lectures}
          isSearching={isSearching}
          onSearch={setLectures}
          onSearchStateChange={setIsSearching}
        />

        {/* ボトムナビゲーション */}
        <BottomNavigation
          activeTab={activeBottomTab}
          onTabChange={setActiveBottomTab}
        />
      </div>
    </AuthGuard>
  );
}
