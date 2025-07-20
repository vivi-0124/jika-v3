'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { User } from '@supabase/supabase-js';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [userSchedule, setUserSchedule] = useState<UserScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Supabase認証ユーザーのIDを使用
  const userId = user?.id || null;
  const isAuthenticated = !!user && !authLoading;

  const refreshSchedule = useCallback(async () => {
    if (!userId) {
      setUserSchedule([]);
      return;
    }

    setScheduleLoading(true);
    try {
      const response = await fetch(`/api/schedule/user?userId=${userId}&term=前学期`);
      if (response.ok) {
        const data = await response.json();
        setUserSchedule(data);
      } else {
        console.error('時間割の取得に失敗しました:', response.status);
        setUserSchedule([]);
      }
    } catch (error) {
      console.error('時間割の取得に失敗しました:', error);
      setUserSchedule([]);
    } finally {
      setScheduleLoading(false);
    }
  }, [userId]);

  const addToSchedule = async (lectureId: number) => {
    if (!userId) {
      throw new Error('ログインが必要です。先にログインしてください。');
    }

    if (!isAuthenticated) {
      throw new Error('認証が必要です。先にログインしてください。');
    }

    try {
      const response = await fetch('/api/schedule/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, lectureId }),
      });

      if (response.ok) {
        await refreshSchedule();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '授業の追加に失敗しました');
      }
    } catch (error) {
      console.error('授業追加エラー:', error);
      throw error;
    }
  };

  const removeFromSchedule = async (lectureId: number) => {
    if (!userId) {
      throw new Error('ログインが必要です。先にログインしてください。');
    }

    if (!isAuthenticated) {
      throw new Error('認証が必要です。先にログインしてください。');
    }

    try {
      const response = await fetch(`/api/schedule/user?userId=${userId}&lectureId=${lectureId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshSchedule();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '授業の削除に失敗しました');
      }
    } catch (error) {
      console.error('授業削除エラー:', error);
      throw error;
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