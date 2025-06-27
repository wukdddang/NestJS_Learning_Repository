# 🧪 Task Manager 이벤트 기반 시스템 테스트 가이드라인

## 📋 개요

이 문서는 Task Manager 프로젝트의 **이벤트 기반 아키텍처**가 올바르게 작동하는지 확인하기 위한 체계적인 테스트 가이드라인입니다. Postman Collection을 활용하여 각 기능이 연결되어 있는지 단계별로 검증합니다.

## 🎯 테스트 목표

- ✅ **이벤트 발행**: 각 액션이 올바른 이벤트를 발행하는지 확인
- ✅ **알림 생성**: 이벤트가 인앱 알림을 생성하는지 확인
- ✅ **이메일 발송**: 이메일 알림이 발송되는지 확인
- ✅ **실시간 알림**: WebSocket을 통한 실시간 알림 확인
- ✅ **데이터 무결성**: 모든 데이터가 올바르게 저장되는지 확인

---

## 🚀 사전 준비

### 1. **환경 설정**

```bash
# 1. 프로젝트 디렉토리로 이동
cd task-manager

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정 (.env 파일)
DATABASE_URL=mongodb://localhost:27017/task-manager
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_user
EMAIL_PASS=your_ethereal_pass
```

### 2. **서버 실행**

```bash
# 개발 서버 실행 (로그 모니터링 가능)
pnpm run start:dev
```

### 3. **Postman 설정**

1. **Collection Import**: `Task Manager API.postman_collection.json` 파일을 Postman에 import
2. **Environment Variables**: 다음 **고정 값들만** 설정
   ```
   baseUrl: http://localhost:3000
   accessToken: (로그인 후 자동 설정됨)
   ```

⚠️ **중요**: `userId`, `taskId`, `projectId`, `workspaceId` 등의 **동적 파라미터는 Environment Variables에 저장하지 마세요**. 이들은 API 응답에서 추출하거나 매번 수동으로 입력해야 합니다.

### 4. **WebSocket 테스트 준비**

브라우저 개발자 도구에서 다음 코드를 준비:

```javascript
// WebSocket 연결 테스트용 코드
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'YOUR_JWT_TOKEN_HERE' },
});

socket.on('connect', () => {
  console.log('✅ WebSocket 연결 성공');
});

socket.on('notification', (data) => {
  console.log('🔔 실시간 알림 수신:', data);
});

socket.on('disconnect', () => {
  console.log('❌ WebSocket 연결 해제');
});
```

---

## 📝 테스트 시나리오

### **Phase 1: 기본 설정 및 인증** 🔐

#### **1.1 회원가입 및 로그인**

```bash
# Postman Collection: 1. Authentication
1. "회원가입" 실행
2. "로그인" 실행 → accessToken 자동 저장됨

# 예상 결과:
✅ HTTP 201 Created
✅ accessToken과 refreshToken 반환
✅ Postman Environment에 토큰 자동 저장
```

#### **1.2 사용자 정보 확인**

```bash
# 로그인 응답에서 userId를 확인하고 기록해두세요 (Environment에 저장하지 말고)
# 또는 별도 API로 현재 사용자 정보 조회
GET /auth/me

# 응답 예시:
{
  "id": "64f7b8c9e12345678901234a",  // ← 이 값을 복사해서 필요할 때마다 사용
  "username": "testuser",
  "email": "test@example.com"
}
```

#### **1.3 워크스페이스 및 프로젝트 설정**

```bash
# Postman Collection: 2. Workspace Setup & 3. Project Setup
1. "워크스페이스 생성" → 응답에서 workspaceId 복사
2. "프로젝트 생성" → 응답에서 projectId 복사 (leadUserId는 위에서 얻은 userId 사용)
3. "보드 생성" → 응답에서 boardId 복사

# ⚠️ 각 API 호출 시 필요한 ID들을 응답에서 복사해서 다음 요청에 수동으로 입력하세요
```

#### **1.4 칸반 보드 구조 생성**

```bash
# Postman Collection: 4. Board Lists (Kanban Columns)
1. "할 일 리스트 생성" → 응답에서 listId 복사
2. "진행 중 리스트 생성" → 응답에서 listId 복사
3. "완료 리스트 생성" → 응답에서 listId 복사

# 각 리스트 생성 시 위에서 얻은 boardId를 요청 body에 입력하세요
```

---

### **Phase 2: 이벤트 기반 시스템 테스트** ⚡

#### **2.1 작업 생성 및 할당 테스트**

```bash
# Step 1: 작업 생성
# Postman Collection: 6. Tasks Management → "작업 생성"
# 요청 body에 위에서 얻은 listId, creatorId(userId) 등을 입력

# 서버 로그 확인:
[TASK] Task created: <taskId>
[EVENT] Task creation logged

# Step 2: 다른 사용자에게 작업 할당 (이벤트 트리거)
POST /tasks/[작업생성응답에서_얻은_taskId]/assign
Body: {
  "assigneeId": "다른_사용자_ID"  // 새로 회원가입한 사용자 ID 사용
}

# 예상 서버 로그:
[EVENT] task.assigned event emitted for task: <taskId>
[NOTIFICATION] Processing task assigned event for user: <assigneeId>
[EMAIL] Task assignment email sent to: user@example.com
[WEBSOCKET] Real-time notification sent to user: <assigneeId>
[NOTIFICATION] Task assigned notification processed successfully

# 확인 사항:
✅ HTTP 200 OK 응답
✅ 서버 로그에 이벤트 발행 및 처리 로그 출력
✅ WebSocket으로 실시간 알림 수신 (브라우저 콘솔 확인)
```

#### **2.2 댓글 추가 테스트**

```bash
# Postman Collection: 7. Comments → "댓글 추가"
POST /comments
Body: {
  "taskId": "[위에서_얻은_taskId]",
  "userId": "[현재_사용자_userId]",
  "content": "이벤트 기반 시스템 테스트 댓글입니다.",
  "projectId": "[위에서_얻은_projectId]",
  "taskTitle": "로그인 API 개발"
}

# 예상 서버 로그:
[EVENT] comment.added event emitted for task: <taskId>
[NOTIFICATION] Processing comment added event for user: <taskOwnerId>
[WEBSOCKET] Real-time notification sent to user: <taskOwnerId>
[NOTIFICATION] Comment added notification processed successfully

# 확인 사항:
✅ 댓글이 성공적으로 생성됨
✅ 작업 소유자에게 알림 발송됨
✅ 실시간 알림 수신됨
```

#### **2.3 작업 완료 테스트**

```bash
# Step 1: 작업을 진행 중으로 변경
# Postman Collection: 6. Tasks Management → "작업 상태 변경 (진행 중)"

# Step 2: 작업을 완료로 변경 (이벤트 트리거)
# Postman Collection: 6. Tasks Management → "작업 상태 변경 (완료)"
PATCH /tasks/[위에서_얻은_taskId]/status
Body: {
  "status": "done"
}

# 예상 서버 로그:
[EVENT] task.completed event emitted for task: <taskId>
[NOTIFICATION] Processing task completed event for user: <creatorId>
[WEBSOCKET] Real-time notification sent to user: <creatorId>
[NOTIFICATION] Task completed notification processed successfully

# 확인 사항:
✅ 작업 상태가 'done'으로 변경됨
✅ 작업 생성자에게 완료 알림 발송됨
✅ 실시간 알림 수신됨
```

#### **2.4 프로젝트 멤버 초대 테스트**

```bash
# 새로운 사용자 생성 (필요시)
POST /auth/signup
Body: {
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
# 응답에서 새 사용자의 userId를 복사

# 프로젝트에 멤버 초대 (이벤트 트리거)
POST /projects/[위에서_얻은_projectId]/members
Body: {
  "userId": "[새로운_사용자_userId]",
  "role": "member"
}

# 예상 서버 로그:
[EVENT] project.invite event emitted for project: <projectId>
[NOTIFICATION] Processing project invite event for user: <inviteeId>
[EMAIL] Project invite email sent to: newuser@example.com
[WEBSOCKET] Real-time notification sent to user: <inviteeId>
[NOTIFICATION] Project invite notification processed successfully

# 확인 사항:
✅ 멤버가 프로젝트에 추가됨
✅ 초대받은 사용자에게 알림 발송됨
✅ 이메일 알림 발송됨 (Ethereal Email 확인)
```

---

### **Phase 3: 알림 시스템 검증** 🔔

#### **3.1 인앱 알림 확인**

```bash
# Postman Collection: 10. Notifications
1. "읽지 않은 알림" → 생성된 알림들 확인
2. "읽지 않은 알림 수" → 알림 카운트 확인

# 예상 결과:
✅ 이전 테스트에서 발생한 모든 알림이 조회됨
✅ 알림 타입별로 올바른 메시지 표시됨
✅ 관련 작업/프로젝트 ID가 올바르게 연결됨
```

#### **3.2 이메일 알림 확인**

```bash
# 서버 로그에서 이메일 미리보기 URL 확인
[EMAIL] Preview URL: https://ethereal.email/message/...

# 확인 사항:
✅ 작업 할당 이메일 발송됨
✅ 프로젝트 초대 이메일 발송됨
✅ 이메일 내용이 올바르게 구성됨
```

#### **3.3 WebSocket 실시간 알림 확인**

```bash
# 브라우저 개발자 도구 콘솔에서 확인
# 이전 테스트들 실행 시 다음과 같은 로그가 출력되어야 함:

✅ WebSocket 연결 성공
🔔 실시간 알림 수신: {
  type: 'task_assigned',
  message: '새로운 작업 "로그인 API 개발"이 할당되었습니다.',
  data: { taskId: '...', taskTitle: '...' }
}
🔔 실시간 알림 수신: {
  type: 'comment_added',
  message: '작업 "로그인 API 개발"에 새 댓글이 추가되었습니다.',
  data: { taskId: '...', commentText: '...' }
}
```

---

### **Phase 4: 데이터 무결성 검증** 💾

#### **4.1 데이터베이스 확인**

```bash
# MongoDB에서 직접 확인
mongo task-manager

# 알림 데이터 확인
db.notifications.find().sort({createdAt: -1}).limit(10)

# 활동 로그 확인
db.activitylogs.find().sort({createdAt: -1}).limit(10)

# 예상 결과:
✅ 모든 이벤트에 대한 알림이 생성됨
✅ 활동 로그가 올바르게 기록됨
✅ 관련 ID들이 정확히 연결됨
```

#### **4.2 활동 로그 확인**

```bash
# Postman Collection: 11. Activity Logs
1. "프로젝트 활동 로그" → 프로젝트 전체 활동 확인 (URL에 projectId 입력)
2. "사용자 최근 활동" → 사용자별 활동 확인 (URL에 userId 입력)
3. "작업별 활동 로그" → 특정 작업의 모든 활동 확인 (URL에 taskId 입력)

# 예상 결과:
✅ 모든 액션이 활동 로그에 기록됨
✅ 시간순으로 정렬되어 표시됨
✅ 액션 타입과 상세 내용이 올바름
```

---

## 🔍 성능 및 안정성 테스트

### **5.1 동시성 테스트**

```bash
# 여러 작업을 동시에 할당하여 이벤트 처리 확인
# Postman Runner 사용하여 동일 API를 여러 번 실행

# 확인 사항:
✅ 모든 이벤트가 누락 없이 처리됨
✅ 알림이 중복 생성되지 않음
✅ 서버가 안정적으로 동작함
```

### **5.2 에러 처리 테스트**

```bash
# 잘못된 데이터로 API 호출
POST /tasks/invalid_id/assign
Body: { "assigneeId": "invalid_user_id" }

# 예상 결과:
✅ 적절한 에러 응답 (400/404)
✅ 이벤트가 발행되지 않음
✅ 서버가 크래시되지 않음
```

---

## 📊 테스트 체크리스트

### **✅ 기본 기능 테스트**

- [ ] 회원가입/로그인 성공
- [ ] 워크스페이스/프로젝트 생성 성공
- [ ] 칸반 보드 구조 생성 성공
- [ ] 작업 생성 및 관리 성공

### **✅ 이벤트 기반 시스템 테스트**

- [ ] 작업 할당 이벤트 발행 및 처리
- [ ] 댓글 추가 이벤트 발행 및 처리
- [ ] 작업 완료 이벤트 발행 및 처리
- [ ] 프로젝트 초대 이벤트 발행 및 처리

### **✅ 알림 시스템 테스트**

- [ ] 인앱 알림 생성 및 조회
- [ ] 이메일 알림 발송 확인
- [ ] WebSocket 실시간 알림 수신
- [ ] 알림 읽음 처리 기능

### **✅ 데이터 무결성 테스트**

- [ ] 데이터베이스에 올바른 데이터 저장
- [ ] 활동 로그 정확한 기록
- [ ] 관련 ID들의 올바른 연결

### **✅ 성능 및 안정성 테스트**

- [ ] 동시 요청 처리 안정성
- [ ] 에러 상황 적절한 처리
- [ ] 메모리 누수 없음

---

## 🐛 문제 해결 가이드

### **일반적인 문제들**

#### **1. 이벤트가 발행되지 않는 경우**

```bash
# 확인 사항:
- NotificationEventHelper가 올바르게 주입되었는지 확인
- EventEmitterModule이 app.module.ts에 등록되었는지 확인
- 서비스에서 이벤트 발행 코드가 실행되는지 로그 확인
```

#### **2. 알림이 생성되지 않는 경우**

```bash
# 확인 사항:
- NotificationsService의 @OnEvent 리스너가 등록되었는지 확인
- 이벤트 이름이 발행자와 리스너에서 일치하는지 확인
- MongoDB 연결 상태 확인
```

#### **3. WebSocket 연결 실패**

```bash
# 확인 사항:
- JWT 토큰이 올바른지 확인
- CORS 설정 확인
- 포트 번호 확인 (3000번 포트)
```

#### **4. 이메일이 발송되지 않는 경우**

```bash
# 확인 사항:
- .env 파일의 이메일 설정 확인
- Ethereal Email 계정 정보 확인
- EmailService가 올바르게 주입되었는지 확인
```

### **로그 분석**

```bash
# 정상적인 이벤트 처리 로그 패턴:
[EVENT] task.assigned event emitted for task: <taskId>
[NOTIFICATION] Processing task assigned event for user: <userId>
[EMAIL] Task assignment email sent to: <email>
[WEBSOCKET] Real-time notification sent to user: <userId>
[NOTIFICATION] Task assigned notification processed successfully

# 에러 발생 시 로그 패턴:
[ERROR] Failed to process event: <eventName>
[ERROR] Database connection failed
[ERROR] Email sending failed: <reason>
```

---

## 🎉 테스트 완료 확인

모든 테스트가 성공적으로 완료되면:

1. **✅ 이벤트 기반 아키텍처 정상 작동**
2. **✅ 순환 의존성 문제 완전 해결**
3. **✅ 통합 알림 시스템 완벽 구현**
4. **✅ 실시간 기능 정상 동작**
5. **✅ 데이터 무결성 보장**

시스템이 프로덕션 환경에 배포할 준비가 완료되었습니다! 🚀

---

## 📚 추가 참고 자료

- [EVENT_DRIVEN_ARCHITECTURE.md](./EVENT_DRIVEN_ARCHITECTURE.md) - 이벤트 기반 아키텍처 상세 설명
- [ERD.md](./ERD.md) - 데이터베이스 설계 및 관계도
- [Postman Collection](../Task%20Manager%20API.postman_collection.json) - API 테스트 컬렉션
