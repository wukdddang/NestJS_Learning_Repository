# Task Manager - 개인/팀 작업 관리 시스템

## 개요

개인 또는 소규모 팀의 프로젝트, 작업, 마감일, 협업을 관리하는 도구입니다. MongoDB와 Mongoose를 사용하여 구현된 NestJS 기반의 백엔드 시스템입니다.

## 핵심 기능

### ✅ 구현 완료된 기능

#### 1. 사용자 인증 및 관리

- 사용자 회원가입, 로그인
- JWT 기반 인증
- 사용자 프로필 관리

#### 2. 워크스페이스 및 프로젝트 관리

- 워크스페이스 생성/관리
- 프로젝트 생성/관리
- 사용자 역할 및 권한 관리

#### 3. 칸반 보드 시스템

- 보드(Board) 생성/관리
- 리스트(List/컬럼) 생성/관리
- 드래그 앤 드롭을 위한 순서 관리

#### 4. 작업(Task) 관리 ⭐ **확장됨**

- 작업 생성, 수정, 삭제
- 작업 할당 및 담당자 관리
- 마감일, 우선순위, 상태 관리
- **하위 작업(Subtasks) 지원** 🆕
- **작업 진행률 계산** 🆕
- **작업 검색 기능** 🆕

#### 5. 레이블 시스템

- 작업 분류를 위한 레이블
- 색상 지원

#### 6. 댓글 시스템 ⭐ **확장됨**

- 작업별 댓글 추가/수정/삭제
- **댓글 답글 기능** 🆕
- **댓글 통계** 🆕

#### 7. 첨부파일 관리

- 파일 업로드/다운로드
- 파일 메타데이터 관리

#### 8. 알림 시스템 🆕

- 작업 할당 알림
- 마감일 알림
- 댓글 추가 알림
- 프로젝트 초대 알림
- 작업 완료 알림
- 읽음/안읽음 상태 관리

#### 9. 활동 로그 시스템 🆕

- 모든 사용자 활동 추적
- 프로젝트별/작업별/사용자별 활동 로그
- 변경 이력 관리

#### 10. 캘린더 뷰 🆕

- 마감일 기준 작업 조회
- 월별/주별/일별 뷰
- 오늘 마감 작업
- 다가오는 작업 (7일 이내)

#### 11. 대시보드 🆕

- 사용자 개인 대시보드
- 프로젝트 대시보드
- 작업 통계 및 생산성 지표
- 주간 활동 통계
- 생산성 점수 계산

#### 12. 검색 기능 🆕

- 작업 제목/설명 기반 검색
- 사용자별 필터링

## API 엔드포인트

### 작업 관리

```
GET    /tasks                    # 모든 작업 조회
GET    /tasks/search            # 작업 검색
GET    /tasks/due-today         # 오늘 마감 작업
GET    /tasks/upcoming          # 다가오는 작업
GET    /tasks/by-date-range     # 날짜 범위별 작업
GET    /tasks/:id/subtasks      # 하위 작업 조회
POST   /tasks/:id/subtasks      # 하위 작업 생성
GET    /tasks/:id/progress      # 작업 진행률
GET    /tasks/:id/with-subtasks # 작업과 하위 작업
```

### 알림 관리

```
GET    /notifications/user/:userId              # 사용자 알림
GET    /notifications/user/:userId/unread       # 읽지 않은 알림
GET    /notifications/user/:userId/unread-count # 읽지 않은 알림 수
PATCH  /notifications/:id/read                  # 알림 읽음 처리
PATCH  /notifications/user/:userId/read-all     # 모든 알림 읽음 처리
```

### 활동 로그

```
GET    /activity-logs/project/:projectId        # 프로젝트 활동
GET    /activity-logs/task/:taskId              # 작업 활동
GET    /activity-logs/user/:userId              # 사용자 활동
GET    /activity-logs/user/:userId/recent       # 최근 활동
```

### 캘린더

```
GET    /calendar/tasks                # 날짜 범위별 작업
GET    /calendar/tasks/today          # 오늘 마감 작업
GET    /calendar/tasks/upcoming       # 다가오는 작업
GET    /calendar/tasks/month          # 월별 작업
GET    /calendar/tasks/week           # 주별 작업
```

### 대시보드

```
GET    /dashboard/user/:userId              # 사용자 대시보드
GET    /dashboard/project/:projectId        # 프로젝트 대시보드
GET    /dashboard/user/:userId/stats        # 사용자 통계
GET    /dashboard/user/:userId/weekly-stats # 주간 통계
GET    /dashboard/user/:userId/productivity # 생산성 지표
```

### 댓글

```
GET    /comments/task/:taskId                # 작업별 댓글
GET    /comments/task/:taskId/stats          # 댓글 통계
GET    /comments/:id/with-replies            # 댓글과 답글
GET    /comments/:id/replies                 # 답글 조회
```

## 데이터 모델

### 주요 엔티티

- **User**: 사용자 정보
- **Workspace**: 워크스페이스
- **Project**: 프로젝트
- **Board**: 칸반 보드
- **List**: 보드 내 컬럼
- **Task**: 작업 (하위 작업 지원)
- **Label**: 레이블
- **Comment**: 댓글 (답글 지원)
- **Attachment**: 첨부파일
- **Notification**: 알림
- **ActivityLog**: 활동 로그
- **UserProjectRole**: 사용자-프로젝트 역할

## 기술 스택

- **Backend**: NestJS, TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT, Passport
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm start:dev

# 프로덕션 빌드
pnpm build

# 프로덕션 실행
pnpm start:prod
```

## 환경 변수 설정

```env
# MongoDB 연결 정보
MONGODB_URI=mongodb://localhost:27017/task-manager

# JWT 설정
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 파일 업로드 설정
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## 주요 특징

### 🔄 통합된 로깅 시스템

모든 중요한 작업(생성, 수정, 삭제, 할당 등)이 자동으로 활동 로그에 기록됩니다.

### 🔔 실시간 알림

작업 할당, 마감일, 댓글 등의 이벤트에 대한 알림을 제공합니다.

### 📊 상세한 통계

사용자별, 프로젝트별 상세한 통계와 생산성 지표를 제공합니다.

### 🗓️ 캘린더 통합

마감일 기반의 캘린더 뷰로 작업 스케줄을 한눈에 파악할 수 있습니다.

### 🔍 강력한 검색

작업 제목, 설명, 담당자 기반의 통합 검색 기능을 제공합니다.

### 📝 하위 작업 지원

복잡한 작업을 여러 하위 작업으로 나누어 관리할 수 있습니다.

## 향후 확장 계획

- 실시간 WebSocket 통신
- 이메일 알림
- 파일 미리보기
- 고급 보고서 및 차트
- 프로젝트 템플릿
- 시간 추적 기능
