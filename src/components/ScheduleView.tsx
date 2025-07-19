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
  const [removingLectures, setRemovingLectures] = useState<Set<number>>(new Set());

  const days = ['月', '火', '水', '木', '金'];
  const periods = [
    { id: '１限', time: '08:45-10:15' },
    { id: '２限', time: '10:30-12:00' },
    { id: '３限', time: '13:00-14:30' },
    { id: '４限', time: '14:45-16:15' },
    { id: '５限', time: '16:30-18:00' }
  ];

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
      item.lecture.period === period
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

  return (
    <div className="space-y-6">
      {/* 時間割テーブル */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80 w-20">
                  時限
                </th>
                {days.map((day) => (
                  <th key={day} className="px-3 py-3 text-center text-sm font-semibold text-white/80 w-1/5">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="border-b border-white/10">
                  <td className="px-4 py-4 text-sm font-semibold text-white bg-white/5 w-20">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{period.id.replace('限', '')}</span>
                      <span className="text-xs text-white/60">{period.time}</span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const scheduleItem = getLectureAtTime(day, period.id);
                    const lecture = scheduleItem?.lecture;
                    
                    // 授業の色を決定（科目名に基づいて色分け）
                    const getLectureColor = (subjectName: string) => {
                      if (subjectName.includes('情報科学')) return 'border-l-4 border-l-gray-600';
                      if (subjectName.includes('国際社会')) return 'border-l-4 border-l-pink-400';
                      if (subjectName.includes('コンリテ')) return 'border-l-4 border-l-red-400';
                      if (subjectName.includes('ゼミ')) return 'border-l-4 border-l-cyan-400';
                      if (subjectName.includes('情報システム')) return 'border-l-4 border-l-purple-400';
                      return 'border-l-4 border-l-indigo-400';
                    };
                    
                    return (
                      <td key={`${day}-${period.id}`} className="px-2 py-2 text-sm">
                        {lecture ? (
                          <div className={`bg-black/90 backdrop-blur-sm rounded-lg p-2 h-32 ${getLectureColor(lecture.subjectName)}`}>
                            <div className="h-full flex flex-col justify-between">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2">
                                    {lecture.subjectName}
                                  </h4>
                                </div>
                              </div>
                              
                              <div className="space-y-0.5">
                                {lecture.instructorName && (
                                  <div className="text-xs text-white line-clamp-1">
                                    {lecture.instructorName}
                                  </div>
                                )}
                                
                                {lecture.classroom && (
                                  <div className="text-xs text-white line-clamp-1">
                                    {lecture.classroom}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 bg-black/5 border border-white/10 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-white/30">-</span>
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
      </div>

    </div>
  );
} 