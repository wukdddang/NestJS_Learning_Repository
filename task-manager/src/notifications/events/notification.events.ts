export class TaskAssignedEvent {
  constructor(
    public readonly assigneeId: string,
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly assignedBy: string,
    public readonly assignerName: string,
    public readonly assigneeEmail: string,
  ) {}
}

export class TaskDueEvent {
  constructor(
    public readonly userId: string,
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly dueDate: Date,
    public readonly userEmail: string,
  ) {}
}

export class CommentAddedEvent {
  constructor(
    public readonly taskCreatorId: string,
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly commentAuthor: string,
    public readonly commentAuthorName: string,
    public readonly taskCreatorEmail: string,
  ) {}
}

export class ProjectInviteEvent {
  constructor(
    public readonly userId: string,
    public readonly projectId: string,
    public readonly projectName: string,
    public readonly invitedBy: string,
    public readonly inviterName: string,
    public readonly userEmail: string,
  ) {}
}

export class TaskCompletedEvent {
  constructor(
    public readonly taskCreatorId: string,
    public readonly taskId: string,
    public readonly taskTitle: string,
    public readonly completedBy: string,
    public readonly completerName: string,
    public readonly taskCreatorEmail: string,
  ) {}
}
