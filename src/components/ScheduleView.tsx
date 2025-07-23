'use client';

import { useUser } from '@/contexts/UserContext';

export default function ScheduleView() {
  const { userSchedule, isAuthenticated, isLoading } = useUser();

  const days = ['月', '火', '水', '木', '金'];
  const periods = [
    { id: '１限', time: ['08:45', '10:15'] },
    { id: '２限', time: ['10:30', '12:00'] },
    { id: '３限', time: ['13:00', '14:30'] },
    { id: '４限', time: ['14:45', '16:15'] },
    { id: '５限', time: ['16:30', '18:00'] }
  ];

  // 指定された曜日・時限の授業を取得
  const getLectureAtTime = (day: string, period: string) => {
    return userSchedule.find(item => 
      item.lecture.dayOfWeek === day && 
      item.lecture.period === period
    );
  };

  // ローディング状態の表示
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">時間割を読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  // 認証されていない場合の表示
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">時間割を表示するにはログインが必要です</h3>
            <p className="text-white/60">ログインすると、あなたの時間割が表示されます。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* 時間割テーブル */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80 w-10 border-r border-white/20"></th>
                {days.map((day) => (
                  <th key={day} className="px-3 py-3 text-center text-sm font-semibold text-white/80 w-1/5 border-r border-white/20">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="border-b border-white/10">
                  <td className="text-sm font-semibold text-white bg-white/5 w-10 border-r border-white/20">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-center">{period.id.replace('限', '')}</span>
                      <div className="text-xs text-white/60 text-center">
                        <div>{period.time[0]}</div>
                        <div>{period.time[1]}</div>
                      </div>
                    </div>
                  </td>
                  {days.map((day) => {
                    const scheduleItem = getLectureAtTime(day, period.id);
                    const lecture = scheduleItem?.lecture;
                    
                    return (
                      <td key={`${day}-${period.id}`} className="text-sm border-r border-white/10">
                        {lecture ? (
                          <div className={`bg-black/90 backdrop-blur-sm p-2 h-28`}>
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
                                  <div className="text-xs text-white break-words">
                                    {lecture.classroom}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-28 bg-black/5 border border-white/10 flex items-center justify-center">
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