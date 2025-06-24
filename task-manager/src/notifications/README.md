# 이벤트 기반 알림 시스템

이 프로젝트는 **이벤트 기반 아키텍처**를 사용하여 알림 시스템을 구현했습니다. 이를 통해 순환 의존성 문제를 해결하고 더 깔끔한 코드 구조를 만들었습니다.

## 🔄 기존 방식 vs 이벤트 기반 방식

### ❌ 기존 방식 (forwardRef 사용)

```typescript
// TasksService에서
async assignTask(taskId: string, assigneeId: string, assignedBy: string) {
  // ... 작업 할당 로직

  // 직접 NotificationsService 호출 (순환 의존성 발생)
  await this.notificationsService.createTaskAssignedNotification(
    assigneeId,
    taskId,
    assignedBy
  );
}
```

### ✅ 새로운 방식 (이벤트 기반)

```typescript
// TasksService에서
async assignTask(taskId: string, assigneeId: string, assignedBy: string) {
  // ... 작업 할당 로직

  // 이벤트 발행 (의존성 없음)
  this.notificationEventHelper.emitTaskAssigned(
    assigneeId,
    taskId,
    task.title,
    assignedBy,
    assigner.username,
    assignee.email
  );
}
```

## 📝 사용법

### 1. NotificationEventHelper 주입

```typescript
import { NotificationEventHelper } from '../notifications/utils/notification-event.helper';

@Injectable()
export class TasksService {
  constructor(
    private notificationEventHelper: NotificationEventHelper,
    // ... 다른 의존성들
  ) {}
}
```

### 2. 이벤트 발행

#### 작업 할당 알림

```typescript
this.notificationEventHelper.emitTaskAssigned(
  assigneeId, // 담당자 ID
  taskId, // 작업 ID
  taskTitle, // 작업 제목
  assignedBy, // 할당자 ID
  assignerName, // 할당자 이름
  assigneeEmail, // 담당자 이메일
);
```

#### 작업 마감일 알림

```typescript
this.notificationEventHelper.emitTaskDue(
  userId, // 사용자 ID
  taskId, // 작업 ID
  taskTitle, // 작업 제목
  dueDate, // 마감일
  userEmail, // 사용자 이메일
);
```

#### 댓글 추가 알림

```typescript
this.notificationEventHelper.emitCommentAdded(
  taskCreatorId, // 작업 생성자 ID
  taskId, // 작업 ID
  taskTitle, // 작업 제목
  commentAuthorId, // 댓글 작성자 ID
  commentAuthorName, // 댓글 작성자 이름
  taskCreatorEmail, // 작업 생성자 이메일
);
```

#### 프로젝트 초대 알림

```typescript
this.notificationEventHelper.emitProjectInvite(
  userId, // 초대받는 사용자 ID
  projectId, // 프로젝트 ID
  projectName, // 프로젝트 이름
  invitedBy, // 초대자 ID
  inviterName, // 초대자 이름
  userEmail, // 초대받는 사용자 이메일
);
```

#### 작업 완료 알림

```typescript
this.notificationEventHelper.emitTaskCompleted(
  taskCreatorId, // 작업 생성자 ID
  taskId, // 작업 ID
  taskTitle, // 작업 제목
  completedBy, // 완료자 ID
  completerName, // 완료자 이름
  taskCreatorEmail, // 작업 생성자 이메일
);
```

## 🔧 모듈 임포트 설정

각 서비스에서 이벤트를 발행하려면 해당 모듈에서 `NotificationsModule`을 임포트해야 합니다:

```typescript
// tasks.module.ts
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule, // 추가
    // ... 다른 모듈들
  ],
  // ...
})
export class TasksModule {}
```

## 🎯 장점

1. **순환 의존성 해결**: `forwardRef` 없이도 서비스 간 통신 가능
2. **느슨한 결합**: 서비스들이 직접 의존하지 않음
3. **확장성**: 새로운 이벤트 리스너를 쉽게 추가 가능
4. **테스트 용이성**: 각 서비스를 독립적으로 테스트 가능
5. **유지보수성**: 알림 로직이 한 곳에 집중되어 관리 용이

## 📚 이벤트 타입

모든 이벤트 클래스는 `src/notifications/events/notification.events.ts`에 정의되어 있습니다:

- `TaskAssignedEvent`
- `TaskDueEvent`
- `CommentAddedEvent`
- `ProjectInviteEvent`
- `TaskCompletedEvent`

## 🔄 마이그레이션 가이드

기존 코드를 이벤트 기반 방식으로 변경하려면:

1. 기존 `notificationsService.createXXXNotification()` 호출을 찾기
2. 해당 호출을 `notificationEventHelper.emitXXX()` 로 변경
3. 필요한 데이터 (이름, 이메일 등)를 미리 조회하여 전달
4. `NotificationsModule` 임포트 추가

예시:

```typescript
// Before
await this.notificationsService.createTaskAssignedNotification(assigneeId, taskId, assignedBy);

// After
const assignee = await this.usersService.findOne(assigneeId);
const assigner = await this.usersService.findOne(assignedBy);

this.notificationEventHelper.emitTaskAssigned(
  assigneeId,
  taskId,
  task.title,
  assignedBy,
  assigner.username,
  assignee.email,
);
```
