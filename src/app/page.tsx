'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, BookOpen, Clock, MapPin, User, Home, Settings, Bell, Plus, Share, CheckSquare } from 'lucide-react';
import LectureSearch from '@/components/LectureSearch';
import ScheduleView from '@/components/ScheduleView';
import LectureList from '@/components/LectureList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Aurora from '@/components/blocks/backgrounds/Aurora/Aurora';


export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'search' | 'schedule'>('search');
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* オーロラ背景 */}
      <div className="fixed inset-0 z-0 bg-black">
        <Aurora
          colorStops={["#5227FF", "#7cff67", "#5227FF"]}
          amplitude={1.0}
          blend={0.5}
          speed={1.0}
        />
      </div>

      {/* ヘッダー */}
      <header className="bg-transparent backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/80 to-green-500/80 rounded-2xl shadow-xl backdrop-blur-sm border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-br from-white to-white/80 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  大学時間割
                </h1>
                <p className="text-xs text-white/60 font-medium">2024年度</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-black hover:bg-white/10 hidden sm:flex">
                <User className="h-4 w-4 mr-2" />
                ログイン
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <Card className="border-0 shadow-2xl bg-black/20 backdrop-blur-md">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'schedule')}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/40 backdrop-blur-sm">
                <TabsTrigger 
                  value="search" 
                  className="flex items-center space-x-2 text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <Search className="h-4 w-4" />
                  <span>授業検索</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="schedule" 
                  className="flex items-center space-x-2 text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>時間割</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-6 space-y-6">
                <LectureSearch onSearch={(results) => setLectures(results)} />
                <LectureList lectures={lectures} loading={loading} />
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <ScheduleView />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </main>

      {/* ボトムナビゲーション */}
      <footer className="bg-transparent backdrop-blur-md border-t border-white/40 fixed bottom-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <Calendar className="h-5 w-5 text-white" />
              <span className="text-xs text-white font-medium">時間割</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <Search className="h-5 w-5 text-white/60" />
              <span className="text-xs text-white/60">検索</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <Share className="h-5 w-5 text-white/60" />
              <span className="text-xs text-white/60">共有</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
              <CheckSquare className="h-5 w-5 text-white/60" />
              <span className="text-xs text-white/60">やること</span>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
