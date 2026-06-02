import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResDto } from './dto/user.res.dto';
import { UserStatsResDto } from './dto/user-stats.res.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { ApiAuth } from '../../decorators/http.decorators';
import { User } from '../../decorators/user.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../constants/role.constant';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { UUIDParam } from '../../decorators/param.decorators';
import { ToggleUserLockReqDto } from './dto/toggle-user-lock.req.dto';

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
  getMe(@User() payload: JwtPayloadType): Promise<UserResDto> {
    return this.usersService.findOne(payload.userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: UserResDto,
    summary: 'Lấy danh sách người dùng',
    isPaginated: true,
    paginationType: 'offset',
  })
  getUsers(
    @Query() pageOptions: GetUsersDto,
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    return this.usersService.getUsers(pageOptions);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: UserStatsResDto,
    summary: 'Lấy thống kê người dùng',
  })
  getStats(): Promise<UserStatsResDto> {
    return this.usersService.getStats();
  }

  @Patch(':userId/lock')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Khóa/Mở khóa tài khoản',
  })
  toggleLock(
    @UUIDParam('userId') userId: string,
    @Body() reqDto: ToggleUserLockReqDto,
  ): Promise<void> {
    return this.usersService.toggleLock(userId, reqDto);
  }

  @Patch(':userId/verify-teacher')
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: UserResDto,
    summary: 'Xác thực tài khoản giáo viên',
  })
  verifyTeacher(@UUIDParam('userId') userId: string): Promise<UserResDto> {
    return this.usersService.verifyTeacher(userId);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Xóa người dùng',
  })
  delete(@UUIDParam('userId') userId: string): Promise<void> {
    return this.usersService.delete(userId);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiAuth({
    type: UserResDto,
    summary: 'Tạo tài khoản người dùng (Admin)',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResDto> {
    return this.usersService.create(createUserDto);
  }
}
