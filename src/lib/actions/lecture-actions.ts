'use server';

import { searchLectures, getAllLectures, getLectureById, getLecturesByDay, getLecturesByTarget } from '@/db';

// 型定義
export interface SearchParams {
  query?: string;
  dayOfWeek?: string;
  period?: string;
  term?: string;
  target?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 授業検索アクション
export async function searchLecturesAction(params: SearchParams): Promise<ActionResult> {
  try {
    const processedParams = {
      query: params.query || '',
      dayOfWeek: params.dayOfWeek === 'all' ? '' : params.dayOfWeek || '',
      period: params.period === 'all' ? '' : params.period || '',
      term: params.term || '前学期',
      target: params.target === 'all' ? '' : params.target || ''
    };

    const lectures = await searchLectures(processedParams);

    return {
      success: true,
      data: lectures,
      message: `${lectures.length}件の授業が見つかりました`
    };
  } catch (error) {
    console.error('授業検索エラー:', error);
    return {
      success: false,
      error: '授業の検索に失敗しました。もう一度お試しください。'
    };
  }
}

// 全授業取得アクション
export async function getAllLecturesAction(): Promise<ActionResult> {
  try {
    const lectures = await getAllLectures();

    return {
      success: true,
      data: lectures,
      message: `${lectures.length}件の授業を取得しました`
    };
  } catch (error) {
    console.error('全授業取得エラー:', error);
    return {
      success: false,
      error: '授業の取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 授業詳細取得アクション
export async function getLectureByIdAction(id: number): Promise<ActionResult> {
  try {
    if (isNaN(id) || id <= 0) {
      return {
        success: false,
        error: '無効な授業IDです'
      };
    }

    const lecture = await getLectureById(id);

    if (!lecture) {
      return {
        success: false,
        error: '授業が見つかりません'
      };
    }

    return {
      success: true,
      data: lecture
    };
  } catch (error) {
    console.error('授業詳細取得エラー:', error);
    return {
      success: false,
      error: '授業の詳細取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 曜日別授業取得アクション
export async function getLecturesByDayAction(dayOfWeek: string, term: string = '前学期'): Promise<ActionResult> {
  try {
    if (!dayOfWeek) {
      return {
        success: false,
        error: '曜日を指定してください'
      };
    }

    // termの値を実際のデータに合わせて変換
    let actualTerm = term;
    if (term === '2024前期') actualTerm = '前学期';
    if (term === '2024後期') actualTerm = '後学期';
    if (term === '2023前期') actualTerm = '前学期';
    if (term === '2023後期') actualTerm = '後学期';

    const lectures = await getLecturesByDay(dayOfWeek, actualTerm);

    return {
      success: true,
      data: lectures,
      message: `${dayOfWeek}曜日の授業を${lectures.length}件取得しました`
    };
  } catch (error) {
    console.error('曜日別授業取得エラー:', error);
    return {
      success: false,
      error: '時間割の取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 対象学科別授業取得アクション
export async function getLecturesByTargetAction(target: string, term: string = '前学期'): Promise<ActionResult> {
  try {
    if (!target) {
      return {
        success: false,
        error: '対象学科を指定してください'
      };
    }

    const lectures = await getLecturesByTarget(target, term);

    return {
      success: true,
      data: lectures,
      message: `${target}対象の授業を${lectures.length}件取得しました`
    };
  } catch (error) {
    console.error('対象学科別授業取得エラー:', error);
    return {
      success: false,
      error: '授業の取得に失敗しました。もう一度お試しください。'
    };
  }
} 