export enum ErrorCode {
  // Common Validation
  V000 = 'common.validation.error',

  // Validation
  V001 = 'user.validation.is_empty',
  V002 = 'user.validation.is_invalid',

  // Error
  E001 = 'user.error.username_or_email_exists',
  E002 = 'user.error.not_found',
  E003 = 'user.error.email_exists',
  E004 = 'user.error.invalid_credentials',
  E005 = 'auth.error.account_locked',
  E006 = 'auth.error.invalid_otp',
  E007 = 'auth.error.admin_registration_not_allowed',
  E008 = 'auth.error.invalid_refresh_token',
  E009 = 'auth.error.teacher_not_found',
  E101 = 'class.error.teacher_not_found',
  E102 = 'class.error.invalid_teacher_assignment',
  E103 = 'class.error.forbidden',
  E104 = 'class.error.unique_code_generation_failed',
  E105 = 'class.error.not_found',
  V003 = 'common.error.too_many_requests',
}
