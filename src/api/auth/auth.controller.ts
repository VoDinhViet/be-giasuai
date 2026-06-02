import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { OtpChallengeResDto } from './dto/otp-challenge.res.dto';
import { RefreshTokenReqDto } from './dto/refresh-token.req.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { RegisterResDto } from './dto/register.res.dto';
import { RequestPasswordResetOtpReqDto } from './dto/request-password-reset-otp.req.dto';
import { RequestRegistrationOtpReqDto } from './dto/request-registration-otp.req.dto';
import { ResetPasswordReqDto } from './dto/reset-password.req.dto';
import { VerifyRegistrationOtpReqDto } from './dto/verify-registration-otp.req.dto';
import { VerifyRegistrationOtpResDto } from './dto/verify-registration-otp.res.dto';
import { ApiAuth, ApiPublic } from '../../decorators/http.decorators';
import { User } from '../../decorators/user.decorator';
import { JwtPayloadType } from './types/jwt-payload.type';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiPublic({
    type: LoginResDto,
    summary: 'Đăng nhập',
    description: 'Đăng nhập thành công',
    errorResponses: [HttpStatus.UNAUTHORIZED],
  })
  login(@Body() loginDto: LoginReqDto): Promise<LoginResDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiPublic({
    type: RegisterResDto,
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản và gửi OTP xác thực',
    statusCode: HttpStatus.CREATED,
    errorResponses: [
      HttpStatus.CONFLICT,
      HttpStatus.BAD_REQUEST,
      HttpStatus.FORBIDDEN,
    ],
  })
  register(@Body() registerDto: RegisterReqDto): Promise<RegisterResDto> {
    return this.authService.register(registerDto);
  }

  @Post('register/otp')
  @ApiPublic({
    type: OtpChallengeResDto,
    summary: 'Gửi lại OTP đăng ký',
    errorResponses: [
      HttpStatus.BAD_REQUEST,
      HttpStatus.NOT_FOUND,
      HttpStatus.TOO_MANY_REQUESTS,
    ],
  })
  requestRegistrationOtp(
    @Body() reqDto: RequestRegistrationOtpReqDto,
  ): Promise<OtpChallengeResDto> {
    return this.authService.requestRegistrationOtp(reqDto);
  }

  @Post('register/verify-otp')
  @ApiPublic({
    type: VerifyRegistrationOtpResDto,
    summary: 'Xác thực OTP đăng ký',
    errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
  })
  verifyRegistrationOtp(
    @Body() reqDto: VerifyRegistrationOtpReqDto,
  ): Promise<VerifyRegistrationOtpResDto> {
    return this.authService.verifyRegistrationOtp(reqDto);
  }

  @Post('password-reset/otp')
  @ApiPublic({
    type: OtpChallengeResDto,
    summary: 'Yêu cầu OTP reset mật khẩu',
    errorResponses: [HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS],
  })
  requestPasswordResetOtp(
    @Body() reqDto: RequestPasswordResetOtpReqDto,
  ): Promise<OtpChallengeResDto> {
    return this.authService.requestPasswordResetOtp(reqDto);
  }

  @Post('password-reset')
  @ApiPublic({
    summary: 'Reset mật khẩu bằng OTP',
    statusCode: HttpStatus.NO_CONTENT,
    errorResponses: [HttpStatus.BAD_REQUEST],
  })
  resetPassword(@Body() reqDto: ResetPasswordReqDto): Promise<void> {
    return this.authService.resetPassword(reqDto);
  }

  @Post('refresh-token')
  @ApiPublic({
    type: LoginResDto,
    summary: 'Cấp lại access token bằng refresh token',
    errorResponses: [HttpStatus.UNAUTHORIZED],
  })
  refreshToken(@Body() reqDto: RefreshTokenReqDto): Promise<LoginResDto> {
    return this.authService.refreshToken(reqDto);
  }

  @Post('logout')
  @ApiAuth({
    summary: 'Đăng xuất',
    description: 'Xóa session hiện tại',
    statusCode: HttpStatus.NO_CONTENT,
  })
  logout(@User() payload: JwtPayloadType): Promise<void> {
    return this.authService.logout(payload);
  }
}
