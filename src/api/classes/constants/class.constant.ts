export enum ClassStatus {
  ACTIVE = 'ACTIVE',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

export enum ClassEnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  REJECTED = 'REJECTED',
}

export enum ClassEnrollmentSource {
  CODE = 'CODE',
  INVITE = 'INVITE',
}

export enum ClassFormat {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
}

export enum ClassJoinPolicy {
  INVITE_ONLY = 'INVITE_ONLY',
  REQUEST_APPROVAL = 'REQUEST_APPROVAL',
  OPEN = 'OPEN',
}

export enum ClassWeekday {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum ClassSessionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
