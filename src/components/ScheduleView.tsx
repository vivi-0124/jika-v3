'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, User, Trash2, Wifi, Users, Loader2, BookOpen } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface UserScheduleItem {
  id: number;
  userId: string;
  createdAt: string;
  lecture: Lecture;
}

export default function ScheduleView() {
  const { userSchedule, removeFromSchedule } = useUser();
  const [term, setTerm] = useState('前学期');
  const [removingLectures, setRemovingLectures] = useState<Set<number>>(new Set());

  const days = ['月', '火', '水', '木', '金', '土'];
  const periods = ['１限', '２限', '３限', '４限', '５限', '６限'];

  const getTargetText = (lecture: Lecture) => {
    if (lecture.targetCommon) return `共通科目 (${lecture.targetCommon})`;
    if (lecture.targetIntlStudies) return `国際教養学科 (${lecture.targetIntlStudies})`;
    if (lecture.targetIntlCulture) return `国際文化学科 (${lecture.targetIntlCulture})`;
    if (lecture.targetIntlTourism) return `国際観光学科 (${lecture.targetIntlTourism})`;
    if (lecture.targetSportsHealth) return `スポーツ健康学科 (${lecture.targetSportsHealth})`;
    if (lecture.targetNursing) return `看護学科 (${lecture.targetNursing})`;
    if (lecture.targetHealthInfo) return `健康情報学科 (${lecture.targetHealthInfo})`;
    return '';
  };

  const getRemoteClassIcon = (isRemoteClass: string) => {
    if (isRemoteClass === '遠隔') return <Wifi className="h-3 w-3 text-blue-500" />;
    if (isRemoteClass === 'ハイブリッド') return <Users className="h-3 w-3 text-green-500" />;
    return null;
  };

  // 指定された曜日・時限の授業を取得
  const getLectureAtTime = (day: string, period: string) => {
    return userSchedule.find(item => 
      item.lecture.dayOfWeek === day && 
      item.lecture.period === period &&
      item.lecture.term === term
    );
  };

  // 授業を削除
  const handleRemoveLecture = async (lectureId: number) => {
    if (removingLectures.has(lectureId)) return;

    setRemovingLectures(prev => new Set(prev).add(lectureId));
    
    try {
      await removeFromSchedule(lectureId);
    } catch (error) {
      console.error('授業削除エラー:', error);
    } finally {
      setRemovingLectures(prev => {
        const newSet = new Set(prev);
        newSet.delete(lectureId);
        return newSet;
      });
    }
  };

  const currentTermLectures = userSchedule.filter(item => item.lecture.term === term);
  const totalCredits = currentTermLectures.reduce((sum, item) => sum + (item.lecture.credits || 0), 0);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">時間割</h2>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-white/80">学期:</label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-32 bg-black/20 backdrop-blur-sm border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="前学期">前学期</SelectItem>
              <SelectItem value="後学期">後学期</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 時間割テーブル */}
      <Card className="border-0 shadow-2xl bg-black/20 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/40 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider w-20">
                    時限
                  </th>
                  {days.map((day) => (
                    <th key={day} className="px-3 py-4 text-center text-sm font-semibold text-white/80 uppercase tracking-wider">
                      {day}曜日
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-black/30 backdrop-blur-sm divide-y divide-white/20">
                {periods.map((period) => (
                  <tr key={period}>
                    <td className="px-6 py-4 text-sm font-semibold text-white bg-slate-800/40 backdrop-blur-sm">
                      {period}
                    </td>
                    {days.map((day) => {
                      const scheduleItem = getLectureAtTime(day, period);
                      const lecture = scheduleItem?.lecture;
                      
                      return (
                        <td key={`${day}-${period}`} className="px-3 py-4 text-sm">
                          {lecture ? (
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                        {lecture.credits}単位
                                      </Badge>
                                      {getRemoteClassIcon(lecture.isRemoteClass)}
                                    </div>
                                    <h4 className="text-sm font-semibold text-white leading-tight truncate">
                                      {lecture.subjectName}
                                    </h4>
                                    {lecture.className && (
                                      <p className="text-xs text-white/70 truncate mt-1">{lecture.className}</p>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => handleRemoveLecture(lecture.id)}
                                    disabled={removingLectures.has(lecture.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-6 w-6 p-0 text-white/50 hover:text-red-400 hover:bg-red-500/20"
                                  >
                                    {removingLectures.has(lecture.id) ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  {lecture.instructorName && (
                                    <div className="flex items-center space-x-2 text-xs text-white/70">
                                      <User className="h-3 w-3 text-white/50" />
                                      <span className="truncate">{lecture.instructorName}</span>
                                    </div>
                                  )}
                                  
                                  {lecture.classroom && (
                                    <div className="flex items-center space-x-2 text-xs text-white/70">
                                      <MapPin className="h-3 w-3 text-white/50" />
                                      <span className="truncate">{lecture.classroom}</span>
                                    </div>
                                  )}
                                  
                                  {getTargetText(lecture) && (
                                    <div className="text-xs text-white/60 truncate">
                                      {getTargetText(lecture)}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="h-24 bg-black/30 border border-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                              <span className="text-xs text-white/40">-</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <Card className="border-0 shadow-xl bg-black/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg text-white">統計情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg shadow-lg">
              <div>
                <p className="text-sm font-medium text-white/80">登録授業数</p>
                <p className="text-2xl font-bold text-indigo-300">{currentTermLectures.length}件</p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg shadow-lg">
              <div>
                <p className="text-sm font-medium text-white/80">総単位数</p>
                <p className="text-2xl font-bold text-green-300">{totalCredits}単位</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 