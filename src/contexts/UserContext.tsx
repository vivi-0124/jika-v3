'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

interface UserContextType {
  userId: string | null;
  user: User | null; // AuthContextから取得したユーザー情報
  userSchedule: UserScheduleItem[];
  addToSchedule: (lectureId: number) => Promise<void>;
  removeFromSchedule: (lectureId: number) => Promise<void>;
  refreshSchedule: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOperating: boolean; // API実行中のフラグ
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// APIヘルパー関数
async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [userSchedule, setUserSchedule] = useState<UserScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [isOperating, setIsOperating] = useState(false);

  // Supabase認証ユーザーのIDを使用
  const userId = user?.id || null;
  const isAuthenticated = !!user && !authLoading;
  
  // デバッグ情報
  console.log('UserContext state:', { 
    user: user ? { id: user.id, email: user.email } : null, 
    userId, 
    userIdType: typeof userId,
    isAuthenticated, 
    authLoading 
  });

  // APIが呼ばれている原因を調査
  useEffect(() => {
    console.log('UserContext useEffect triggered:', { userId, isAuthenticated });
  }, [userId, isAuthenticated]);

  const refreshSchedule = useCallback(async () => {
    if (!userId) {
      setUserSchedule([]);
      return;
    }

    setScheduleLoading(true);
    try {
      const result = await apiRequest(`/api/schedule?userId=${encodeURIComponent(userId)}&term=前学期`);
      
      if (result.success) {
        setUserSchedule((result.data as UserScheduleItem[]) || []);
      } else {
        console.error('時間割の取得に失敗しました:', result.error);
        setUserSchedule([]);
        toast.error(result.error || '時間割の取得に失敗しました');
      }
    } catch (error) {
      console.error('時間割の取得に失敗しました:', error);
      setUserSchedule([]);
      toast.error('時間割の取得中にエラーが発生しました');
    } finally {
      setScheduleLoading(false);
    }
  }, [userId]);

  const addToSchedule = async (lectureId: number) => {
    if (!userId) {
      toast.error('ログインが必要です。先にログインしてください。');
      throw new Error('ログインが必要です。先にログインしてください。');
    }

    if (!isAuthenticated) {
      toast.error('認証が必要です。先にログインしてください。');
      throw new Error('認証が必要です。先にログインしてください。');
    }

    setIsOperating(true);
    try {
      const result = await apiRequest('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, lectureId }),
      });
      
      if (result.success) {
        // 楽観的更新の代わりに時間割を再取得
        await refreshSchedule();
        toast.success(result.message || '授業を時間割に追加しました');
      } else {
        console.error('授業追加エラー:', result.error);
        toast.error(result.error || '授業の追加に失敗しました');
        throw new Error(result.error || '授業の追加に失敗しました');
      }
    } catch (error) {
      console.error('授業追加エラー:', error);
      const errorMessage = error instanceof Error ? error.message : '授業の追加に失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  const removeFromSchedule = async (lectureId: number) => {
    if (!userId) {
      toast.error('ログインが必要です。先にログインしてください。');
      throw new Error('ログインが必要です。先にログインしてください。');
    }

    if (!isAuthenticated) {
      toast.error('認証が必要です。先にログインしてください。');
      throw new Error('認証が必要です。先にログインしてください。');
    }

    setIsOperating(true);
    try {
      const result = await apiRequest('/api/schedule', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, lectureId }),
      });
      
      if (result.success) {
        // 楽観的更新の代わりに時間割を再取得
        await refreshSchedule();
        toast.success(result.message || '授業を時間割から削除しました');
      } else {
        console.error('授業削除エラー:', result.error);
        toast.error(result.error || '授業の削除に失敗しました');
        throw new Error(result.error || '授業の削除に失敗しました');
      }
    } catch (error) {
      console.error('授業削除エラー:', error);
      const errorMessage = error instanceof Error ? error.message : '授業の削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  // 認証状態が変更されたら時間割を取得
  useEffect(() => {
    if (!authLoading) {
      if (userId && isAuthenticated) {
        refreshSchedule();
      } else {
        // ユーザーがログアウトした場合、時間割をクリア
        setUserSchedule([]);
      }
    }
  }, [userId, authLoading, isAuthenticated, refreshSchedule]);

  // デバッグ用：認証状態の変更をログ出力
  useEffect(() => {
    console.log('Auth state changed:', {
      userId,
      isAuthenticated,
      authLoading,
      userEmail: user?.email
    });
  }, [userId, isAuthenticated, authLoading, user]);

  return (
    <UserContext.Provider
      value={{
        userId,
        user, // AuthContextから取得したユーザー情報を提供
        userSchedule,
        addToSchedule,
        removeFromSchedule,
        refreshSchedule,
        isAuthenticated,
        isLoading: authLoading || scheduleLoading,
        isOperating, // API実行中のフラグを追加
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 