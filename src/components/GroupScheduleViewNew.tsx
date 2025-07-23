'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Calendar, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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

interface TimeSlot {
  dayOfWeek: string;
  period: string;
  isFree: boolean;
  occupiedBy?: string[];
}

interface FreeSlotAnalysis {
  term: string;
  totalMembers: number;
  timeSlots: TimeSlot[];
  freeSlots: TimeSlot[];
}

interface GroupScheduleViewProps {
  group: Group;
}

export default function GroupScheduleViewNew({ group }: GroupScheduleViewProps) {
  const [analysis, setAnalysis] = useState<FreeSlotAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('前学期');

  const days = ['月', '火', '水', '木', '金'];
  const periods = ['1', '2', '3', '4', '5'];
  const periodTimes = {
    '1': '9:00-10:30',
    '2': '10:45-12:15',
    '3': '13:15-14:45',
    '4': '15:00-16:30',
    '5': '16:45-18:15'
  };

  // 共通空きコマを取得
  const fetchFreeSlots = async (showToast = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/free-slots?term=${encodeURIComponent(selectedTerm)}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.data);
        if (showToast) {
          toast.success('空きコマ情報を更新しました');
        }
      } else {
        console.error('空きコマ取得エラー:', result.error);
        toast.error(result.error || '空きコマの取得に失敗しました');
        setAnalysis(null);
      }
    } catch (error) {
      console.error('空きコマ取得エラー:', error);
      toast.error('空きコマの取得中にエラーが発生しました');
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 指定された曜日・時限のスロット情報を取得
  const getSlotInfo = (day: string, period: string): TimeSlot | undefined => {
    if (!analysis) return undefined;
    return analysis.timeSlots.find(slot => slot.dayOfWeek === day && slot.period === period);
  };

  // スロットのスタイルを取得
  const getSlotStyle = (day: string, period: string): string => {
    const slot = getSlotInfo(day, period);
    if (!slot) return 'bg-white/5 border-white/10';
    
    if (slot.isFree) {
      return 'bg-green-500/20 border-green-400/30 shadow-green-500/10';
    } else {
      const occupiedRatio = (slot.occupiedBy?.length || 0) / (analysis?.totalMembers || 1);
      if (occupiedRatio >= 0.8) {
        return 'bg-red-500/20 border-red-400/30';
      } else if (occupiedRatio >= 0.5) {
        return 'bg-yellow-500/20 border-yellow-400/30';
      } else {
        return 'bg-orange-500/20 border-orange-400/30';
      }
    }
  };


  useEffect(() => {
    fetchFreeSlots();
  }, [group.id, selectedTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ヘッダー */}
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                共通空きコマ
              </CardTitle>
              {analysis && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-white/10 text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {analysis.totalMembers}人のグループ
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {analysis.freeSlots.length}コマ空き
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-24 sm:w-32 bg-black/20 border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="前学期" className="text-white hover:bg-white/10">前学期</SelectItem>
                  <SelectItem value="後学期" className="text-white hover:bg-white/10">後学期</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFreeSlots(true)}
                disabled={isLoading}
                className="bg-black/20 border-white/20 text-white hover:bg-white/10 h-8 w-8 p-0 sm:h-10 sm:w-10"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 時間割表示 */}
      {isLoading ? (
        <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-white/50 mx-auto mb-4" />
            <p className="text-white/70">共通空きコマを検索中...</p>
          </CardContent>
        </Card>
      ) : analysis ? (
        <>
          {/* 時間割グリッド */}
          <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="p-2 sm:p-3 text-center text-white/80 font-medium border-b border-white/10 text-xs sm:text-sm">
                        時限
                      </th>
                      {days.map((day) => (
                        <th key={day} className="p-2 sm:p-3 text-center text-white/80 font-medium border-b border-white/10 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
                          <span className="hidden sm:inline">{day}曜日</span>
                          <span className="sm:hidden">{day}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period} className="border-b border-white/5">
                        <td className="p-2 sm:p-3 text-center bg-white/5">
                          <div className="text-white font-medium text-xs sm:text-sm">{period}限</div>
                          <div className="text-xs text-white/50 hidden sm:block">{periodTimes[period as keyof typeof periodTimes]}</div>
                        </td>
                        {days.map((day) => (
                          <td key={`${day}-${period}`} className="p-1 sm:p-2">
                            <div
                              className={`
                                h-12 sm:h-16 lg:h-20 rounded-md sm:rounded-lg border-2 flex items-center justify-center
                                transition-all hover:scale-105 cursor-pointer text-xs sm:text-sm
                                ${getSlotStyle(day, period)}
                              `}
                            >
                              <div className="text-center">
                                {(() => {
                                  const slot = getSlotInfo(day, period);
                                  if (!slot) return null;
                                  
                                  const occupied = slot.occupiedBy?.length || 0;
                                  const total = analysis?.totalMembers || 1;
                                  const free = total - occupied;

                                  if (slot.isFree) {
                                    return (
                                      <>
                                        <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-400 mx-auto mb-1" />
                                        <p className="text-xs text-green-400 font-medium hidden sm:block">全員OK</p>
                                        <p className="text-xs text-green-400 font-medium sm:hidden">OK</p>
                                      </>
                                    );
                                  } else {
                                    return (
                                      <>
                                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-white">{free}/{total}</p>
                                        <p className="text-xs text-white/60 hidden sm:block">空き</p>
                                      </>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* モバイル用：時間帯の説明 */}
              <div className="sm:hidden p-3 bg-white/5 border-t border-white/10">
                <div className="grid grid-cols-5 gap-2 text-xs text-white/60">
                  {periods.map((period) => (
                    <div key={period} className="text-center">
                      <div className="font-medium text-white/80">{period}限</div>
                      <div>{periodTimes[period as keyof typeof periodTimes]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 凡例と統計情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* 凡例 */}
            <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm text-white/80">色の意味</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500/20 border-2 border-green-400/30 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-white/70">全員が空いている</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500/20 border-2 border-orange-400/30 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-white/70">一部のメンバーが空いている</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500/20 border-2 border-yellow-400/30 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-white/70">半数以上が空いている</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500/20 border-2 border-red-400/30 rounded flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm text-white/70">ほとんど空いていない</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* おすすめの時間帯 */}
            <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  おすすめの集まり時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.freeSlots.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.freeSlots.slice(0, 3).map((slot, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs w-fit">
                          {slot.dayOfWeek}曜 {slot.period}限
                        </Badge>
                        <span className="text-white/60 text-xs sm:text-sm">
                          {periodTimes[slot.period as keyof typeof periodTimes]}
                        </span>
                      </div>
                    ))}
                    {analysis.freeSlots.length > 3 && (
                      <p className="text-xs text-white/50">
                        他{analysis.freeSlots.length - 3}件の空き時間があります
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-white/60">
                    全員が空いている時間帯はありません
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/70">共通空きコマの情報を取得できませんでした</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFreeSlots(true)}
              className="mt-4 bg-black/20 border-white/20 text-white hover:bg-white/10"
            >
              再試行
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}