import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { ApiAuth, ApiPublic } from '..\../decorators/http.decorators';
import { User } from '..\../decorators/user.decorator';
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
  login(@Body() loginDto: LoginReqDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiPublic({
    summary: 'Đăng ký tài khoản mới',
    description: 'Tạo tài khoản thành công',
    statusCode: HttpStatus.CREATED,
    errorResponses: [HttpStatus.CONFLICT, HttpStatus.BAD_REQUEST],
  })
  register(@Body() registerDto: RegisterReqDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @ApiAuth({
    summary: 'Đăng xuất',
    description: 'Xóa session hiện tại',
    statusCode: HttpStatus.NO_CONTENT,
  })
  logout(@User() payload: JwtPayloadType) {
    return this.authService.logout(payload);
  }
}
