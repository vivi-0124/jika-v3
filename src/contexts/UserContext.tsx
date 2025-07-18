'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  userSchedule: any[];
  addToSchedule: (lectureId: number) => Promise<void>;
  removeFromSchedule: (lectureId: number) => Promise<void>;
  refreshSchedule: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [userSchedule, setUserSchedule] = useState<any[]>([]);

  // ローカルストレージからユーザーIDを復元
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserIdState(savedUserId);
    } else {
      // 新しいユーザーIDを生成
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUserIdState(newUserId);
      localStorage.setItem('userId', newUserId);
    }
  }, []);

  const setUserId = (id: string) => {
    setUserIdState(id);
    localStorage.setItem('userId', id);
  };

  const refreshSchedule = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/schedule/user?userId=${userId}&term=前学期`);
      if (response.ok) {
        const data = await response.json();
        setUserSchedule(data);
      }
    } catch (error) {
      console.error('時間割の取得に失敗しました:', error);
    }
  };

  const addToSchedule = async (lectureId: number) => {
    if (!userId) return;

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
        const error = await response.json();
        throw new Error(error.error || '授業の追加に失敗しました');
      }
    } catch (error) {
      console.error('授業追加エラー:', error);
      throw error;
    }
  };

  const removeFromSchedule = async (lectureId: number) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/schedule/user?userId=${userId}&lectureId=${lectureId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshSchedule();
      } else {
        const error = await response.json();
        throw new Error(error.error || '授業の削除に失敗しました');
      }
    } catch (error) {
      console.error('授業削除エラー:', error);
      throw error;
    }
  };

  // ユーザーIDが設定されたら時間割を取得
  useEffect(() => {
    if (userId) {
      refreshSchedule();
    }
  }, [userId]);

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        userSchedule,
        addToSchedule,
        removeFromSchedule,
        refreshSchedule,
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