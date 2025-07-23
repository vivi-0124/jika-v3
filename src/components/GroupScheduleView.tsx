'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, Calendar, RefreshCw } from 'lucide-react';
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

export default function GroupScheduleView({ group }: GroupScheduleViewProps) {
  const [analysis, setAnalysis] = useState<FreeSlotAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('前学期');

  const days = ['月', '火', '水', '木', '金'];
  const periods = ['1', '2', '3', '4', '5'];

  // 共通空きコマを取得
  const fetchFreeSlots = async (showToast = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/free-slots?term=${encodeURIComponent(selectedTerm)}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.data);
        // 手動更新時のみトースト表示
        if (showToast) {
          toast.success('空きコマ情報を更新しました');
        }
      } else {
        console.error('空きコマ取得エラー:', result.error);
        // エラーの場合のみトースト表示
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
      return 'bg-green-500/30 border-green-400/50 shadow-green-500/20';
    } else {
      const occupiedRatio = (slot.occupiedBy?.length || 0) / (analysis?.totalMembers || 1);
      if (occupiedRatio >= 0.8) {
        return 'bg-red-500/30 border-red-400/50';
      } else if (occupiedRatio >= 0.5) {
        return 'bg-yellow-500/30 border-yellow-400/50';
      } else {
        return 'bg-orange-500/30 border-orange-400/50';
      }
    }
  };

  // スロットのテキストを取得
  const getSlotText = (day: string, period: string): string => {
    const slot = getSlotInfo(day, period);
    if (!slot) return '';
    
    if (slot.isFree) {
      return '空き';
    } else {
      const occupied = slot.occupiedBy?.length || 0;
      const total = analysis?.totalMembers || 1;
      return `${total - occupied}/${total}人空き`;
    }
  };

  useEffect(() => {
    fetchFreeSlots();
  }, [group.id, selectedTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-white" />
              <CardTitle className="text-white">
                {group.name} の共通空きコマ
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-32 bg-black/20 border-white/20 text-white">
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
                className="bg-black/20 border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {analysis && (
            <div className="flex items-center space-x-4 text-sm text-white/70">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{analysis.totalMembers}人のグループ</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{analysis.freeSlots.length}コマの共通空き時間</span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* 時間割表示 */}
      {isLoading ? (
        <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-white">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>共通空きコマを検索中...</span>
            </div>
          </CardContent>
        </Card>
      ) : analysis ? (
        <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-6 gap-2">
              {/* ヘッダー行 */}
              <div className="text-center font-semibold text-white/80 p-2">時限</div>
              {days.map((day) => (
                <div key={day} className="text-center font-semibold text-white/80 p-2">
                  {day}曜日
                </div>
              ))}
              
              {/* 時間割の内容 */}
              {periods.map((period) => (
                <React.Fragment key={period}>
                  <div className="text-center font-semibold text-white/80 p-2 flex items-center justify-center">
                    {period}限
                  </div>
                  {days.map((day) => (
                    <div
                      key={`${day}-${period}`}
                      className={`
                        p-3 rounded-lg border text-center text-sm font-medium transition-all
                        ${getSlotStyle(day, period)}
                      `}
                    >
                      <div className="text-white">
                        {getSlotText(day, period)}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            
            {/* 凡例 */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500/30 border border-green-400/50 rounded"></div>
                <span className="text-white/70">全員空き</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500/30 border border-orange-400/50 rounded"></div>
                <span className="text-white/70">一部空き</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500/30 border border-yellow-400/50 rounded"></div>
                <span className="text-white/70">半数空き</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500/30 border border-red-400/50 rounded"></div>
                <span className="text-white/70">ほぼ埋まり</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <p className="text-white/70">共通空きコマの情報を取得できませんでした</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFreeSlots(true)}
              className="mt-2 bg-black/20 border-white/20 text-white hover:bg-white/10"
            >
              再試行
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 