import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PageOptionsDto } from '../../common/offset-pagination/page-options.dto';
import { UserResDto } from './dto/user.res.dto';
import { UserStatsResDto } from './dto/user-stats.res.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { ApiAuth } from '../../decorators/http.decorators';
import { User } from '../../decorators/user.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../constants/role.constant';
import { LockUserDto } from './dto/lock-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiAuth({
    type: UserResDto,
    summary: 'Lấy thông tin cá nhân',
  })
  getMe(@User() user: JwtPayloadType) {
    return this.usersService.findOne(user.userId);
  }

  @Get()
  @ApiAuth({
    type: UserResDto,
    summary: 'Lấy danh sách người dùng',
    isPaginated: true,
    paginationType: 'offset',
  })
  getUsers(@Query() pageOptions: GetUsersDto) {
    return this.usersService.getUsers(pageOptions);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: UserStatsResDto,
    summary: 'Lấy thống kê người dùng',
  })
  getStats() {
    console.log('getStats');
    return this.usersService.getStats();
  }

  @Patch(':userId/lock')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Khóa/Mở khóa tài khoản',
  })
  toggleLock(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() lockUserDto: LockUserDto,
  ) {
    console.log('🚀 ~ UsersController ~ toggleLock ~ userId:', userId);
    return this.usersService.toggleLock(userId, lockUserDto);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: UserResDto,
    summary: 'Tạo tài khoản người dùng (Admin)',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
