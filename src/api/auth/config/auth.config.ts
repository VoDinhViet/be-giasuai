import { registerAs } from '@nestjs/config';
import { AuthConfig } from './auth-config.type';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../../utils/validate-config';
import { StringValue } from 'ms';

class ReflectionVariablesValidator {
  @IsString()
  @IsOptional()
  AUTH_CONFIRM_EMAIL_EXPIRES: string;

  @IsString()
  @IsOptional()
  AUTH_PASSWORD_RESET_EXPIRES: string;

  @IsString()
  @IsOptional()
  AUTH_OTP_RESEND_COOLDOWN: string;

  @IsString()
  AUTH_JWT_SECRET: string;

  @IsString()
  AUTH_JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  AUTH_REFRESH_SECRET: string;

  @IsString()
  AUTH_REFRESH_TOKEN_EXPIRES_IN: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, ReflectionVariablesValidator);

  return {
    confirmEmailExpires:
      (process.env.AUTH_CONFIRM_EMAIL_EXPIRES as StringValue) || '24h',
    passwordResetExpires:
      (process.env.AUTH_PASSWORD_RESET_EXPIRES as StringValue) || '10m',
    otpResendCooldown:
      (process.env.AUTH_OTP_RESEND_COOLDOWN as StringValue) || '1m',
    secret: process.env.AUTH_JWT_SECRET || 'secret',
    expires: (process.env.AUTH_JWT_TOKEN_EXPIRES_IN as StringValue) || '15m',
    refreshSecret: process.env.AUTH_REFRESH_SECRET || 'refresh_secret',
    refreshExpires:
      (process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN as StringValue) || '7d',
  };
});
