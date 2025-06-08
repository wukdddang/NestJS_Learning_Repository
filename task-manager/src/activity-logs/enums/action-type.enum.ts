export enum ActivityActionType {
  TASK_CREATED = '작업_생성',
  TASK_UPDATED = '작업_수정',
  TASK_COMPLETED = '작업_완료',
  TASK_ASSIGNED = '작업_할당',
  TASK_MOVED = '작업_이동',
  COMMENT_ADDED = '댓글_추가',
  ATTACHMENT_ADDED = '첨부파일_추가',
  PROJECT_UPDATED = '프로젝트_수정',
}

// enum 값들을 배열로 export (validation 등에 사용)
export const ACTIVITY_ACTION_TYPES = Object.values(ActivityActionType);
