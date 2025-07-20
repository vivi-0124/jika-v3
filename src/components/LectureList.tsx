'use client';

import { Clock, MapPin, User, BookOpen, Plus, Eye, Wifi, Users, Check, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

interface LectureListProps {
  lectures: Lecture[];
  loading: boolean;
}

export default function LectureList({ lectures, loading }: LectureListProps) {
  const { userSchedule, addToSchedule, removeFromSchedule, isOperating } = useUser();
  const [processingLectures, setProcessingLectures] = useState<Set<number>>(new Set());

  const getTargetText = (lecture: Lecture) => {
    if (lecture.targetCommon) return '共通科目';
    if (lecture.targetIntlStudies) return '国際教養学科';
    if (lecture.targetIntlCulture) return '国際文化学科';
    if (lecture.targetIntlTourism) return '国際観光学科';
    if (lecture.targetSportsHealth) return 'スポーツ健康学科';
    if (lecture.targetNursing) return '看護学科';
    if (lecture.targetHealthInfo) return '健康情報学科';
    return '';
  };

  const getRemoteClassIcon = (isRemoteClass: string) => {
    if (isRemoteClass === '遠隔') return <Wifi className="h-3 w-3 text-blue-500" />;
    if (isRemoteClass === 'ハイブリッド') return <Users className="h-3 w-3 text-green-500" />;
    return null;
  };

  // 授業が既に時間割に追加されているかチェック
  const isInSchedule = (lectureId: number) => {
    return userSchedule.some(item => item.lecture.id === lectureId);
  };

  // 授業を時間割に追加/削除
  const handleScheduleToggle = async (lectureId: number) => {
    // 既に処理中、または全体的な操作中の場合は処理しない
    if (processingLectures.has(lectureId) || isOperating) return;

    setProcessingLectures(prev => new Set(prev).add(lectureId));
    
    try {
      if (isInSchedule(lectureId)) {
        await removeFromSchedule(lectureId);
      } else {
        await addToSchedule(lectureId);
      }
    } catch (error) {
      // エラーは既にUserContext内でtoastで表示されるため、ここでは何もしない
      console.error('時間割操作エラー:', error);
    } finally {
      setProcessingLectures(prev => {
        const newSet = new Set(prev);
        newSet.delete(lectureId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <span className="ml-3 text-white/80 text-sm">検索中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lectures.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-white/40" />
            <h3 className="mt-4 text-sm font-medium text-white">授業が見つかりません</h3>
            <p className="mt-2 text-xs text-white/60">検索条件を変更してお試しください。</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white px-6">
          検索結果 ({lectures.length}件)
        </h2>
      </div>
      
      <div className="space-y-4">
        {lectures.map((lecture) => {
          const inSchedule = isInSchedule(lecture.id);
          const isProcessing = processingLectures.has(lecture.id);
          const isDisabled = isProcessing || isOperating;
          
          return (
            <Card 
              key={lecture.id} 
              className={`border-0 shadow-xl bg-black/20 backdrop-blur-md hover:shadow-2xl transition-all duration-300 ${
                isProcessing ? 'opacity-75' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                          {lecture.term}
                        </Badge>
                        {lecture.credits && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                            {lecture.credits}単位
                          </Badge>
                        )}
                        {getRemoteClassIcon(lecture.isRemoteClass)}
                        {inSchedule && (
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            登録済み
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-base font-semibold text-white leading-tight">
                        {lecture.subjectName}
                      </h3>
                      {lecture.className && (
                        <p className="text-sm text-white/70 mt-1">{lecture.className}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* 詳細情報 */}
                  <div className="space-y-3">
                    {lecture.instructorName && (
                      <div className="flex items-center space-x-2 text-sm text-white/70">
                        <User className="h-4 w-4 text-white/50" />
                        <span>{lecture.instructorName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-white/70">
                      <Clock className="h-4 w-4 text-white/50" />
                      <span>{lecture.dayOfWeek}曜日 {lecture.period}限</span>
                    </div>
                    
                    {lecture.classroom && (
                      <div className="flex items-center space-x-2 text-sm text-white/70">
                        <MapPin className="h-4 w-4 text-white/50" />
                        <span>{lecture.classroom}</span>
                        {lecture.classroomCapacity && (
                          <span className="text-white/50">(定員: {lecture.classroomCapacity}名)</span>
                        )}
                      </div>
                    )}

                    {getTargetText(lecture) && (
                      <div className="flex items-center space-x-2 text-sm text-white/70">
                        <span className="text-white/50">対象:</span>
                        <span>{getTargetText(lecture)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  {/* アクションボタン */}
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                      disabled={isDisabled}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      詳細
                    </Button>
                    <Button 
                      onClick={() => handleScheduleToggle(lecture.id)}
                      disabled={isDisabled}
                      variant={inSchedule ? "destructive" : "default"}
                      size="sm"
                      className={`flex-1 shadow-lg ${
                        inSchedule 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : inSchedule ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isProcessing ? '処理中...' : inSchedule ? '削除' : '追加'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* 全体的な操作中の表示 */}
      {isOperating && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="border-0 shadow-xl bg-black/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                <span className="text-white text-sm">時間割を更新中...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
