import { StringValue } from 'ms';

export type AuthConfig = {
  confirmEmailExpires: StringValue;
  passwordResetExpires: StringValue;
  otpResendCooldown: StringValue;
  secret: string;
  expires: StringValue;
  refreshSecret: string;
  refreshExpires: StringValue;
};
