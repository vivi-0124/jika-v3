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

// 授業検索API
export async function searchLecturesAPI(params: SearchParams): Promise<ActionResult> {
  try {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.dayOfWeek) searchParams.append('dayOfWeek', params.dayOfWeek);
    if (params.period) searchParams.append('period', params.period);
    if (params.term) searchParams.append('term', params.term);
    if (params.target) searchParams.append('target', params.target);

    const response = await fetch(`/api/lectures/search?${searchParams.toString()}`);
    return await response.json();
  } catch (error) {
    console.error('授業検索APIエラー:', error);
    return {
      success: false,
      error: '授業の検索に失敗しました。もう一度お試しください。'
    };
  }
}

// 全授業取得API
export async function getAllLecturesAPI(): Promise<ActionResult> {
  try {
    const response = await fetch('/api/lectures/all');
    return await response.json();
  } catch (error) {
    console.error('全授業取得APIエラー:', error);
    return {
      success: false,
      error: '授業の取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 授業詳細取得API
export async function getLectureByIdAPI(id: number): Promise<ActionResult> {
  try {
    const response = await fetch(`/api/lectures/${id}`);
    return await response.json();
  } catch (error) {
    console.error('授業詳細取得APIエラー:', error);
    return {
      success: false,
      error: '授業の詳細取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 曜日別授業取得API
export async function getLecturesByDayAPI(dayOfWeek: string, term: string = '前学期'): Promise<ActionResult> {
  try {
    const response = await fetch(`/api/lectures/day/${dayOfWeek}?term=${term}`);
    return await response.json();
  } catch (error) {
    console.error('曜日別授業取得APIエラー:', error);
    return {
      success: false,
      error: '時間割の取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 対象学科別授業取得API
export async function getLecturesByTargetAPI(target: string, term: string = '前学期'): Promise<ActionResult> {
  try {
    const response = await fetch(`/api/lectures/target/${target}?term=${term}`);
    return await response.json();
  } catch (error) {
    console.error('対象学科別授業取得APIエラー:', error);
    return {
      success: false,
      error: '授業の取得に失敗しました。もう一度お試しください。'
    };
  }
}

// ユーザー時間割取得API
export async function getUserScheduleAPI(userId: string, term: string = '前学期'): Promise<ActionResult> {
  try {
    const response = await fetch(`/api/schedule?userId=${userId}&term=${term}`);
    return await response.json();
  } catch (error) {
    console.error('ユーザー時間割取得APIエラー:', error);
    return {
      success: false,
      error: 'ユーザー時間割の取得に失敗しました。もう一度お試しください。'
    };
  }
}

// 授業を時間割に追加API
export async function addLectureToScheduleAPI(userId: string, lectureId: number): Promise<ActionResult> {
  try {
    const response = await fetch('/api/schedule/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, lectureId }),
    });
    return await response.json();
  } catch (error) {
    console.error('授業追加APIエラー:', error);
    return {
      success: false,
      error: '授業の追加に失敗しました。もう一度お試しください。'
    };
  }
}

// 授業を時間割から削除API
export async function removeLectureFromScheduleAPI(userId: string, lectureId: number): Promise<ActionResult> {
  try {
    const response = await fetch('/api/schedule/remove', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, lectureId }),
    });
    return await response.json();
  } catch (error) {
    console.error('授業削除APIエラー:', error);
    return {
      success: false,
      error: '授業の削除に失敗しました。もう一度お試しください。'
    };
  }
}

// 時間割一括更新API
export async function updateScheduleBatchAPI(
  userId: string,
  addLectureIds: number[] = [],
  removeLectureIds: number[] = []
): Promise<ActionResult> {
  try {
    const response = await fetch('/api/schedule/batch', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, addLectureIds, removeLectureIds }),
    });
    return await response.json();
  } catch (error) {
    console.error('時間割一括更新APIエラー:', error);
    return {
      success: false,
      error: '時間割の更新に失敗しました。もう一度お試しください。'
    };
  }
} 