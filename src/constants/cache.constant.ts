export enum CacheKey {
  EMAIL_VERIFICATION = 'email_verification:%s',
  REGISTRATION_OTP = 'registration_otp:%s',
  REGISTRATION_OTP_COOLDOWN = 'registration_otp_cooldown:%s',
  PASSWORD_RESET_OTP = 'password_reset_otp:%s',
  PASSWORD_RESET_OTP_COOLDOWN = 'password_reset_otp_cooldown:%s',
  SESSION_BLACKLIST = 'session_blacklist:%s',
}
