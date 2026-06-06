import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResDto } from './dto/user.res.dto';
import { UserStatsResDto } from './dto/user-stats.res.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { ApiAuth } from '../../decorators/http.decorators';
import { CurrentUser } from '../../decorators/user.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { Permission } from '../../constants/permission.constant';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';
import { OffsetPaginatedDto } from '../../common/offset-pagination/paginated.dto';
import { UUIDParam } from '../../decorators/param.decorators';
import { UpdateCurrentUserReqDto } from './dto/update-current-user.req.dto';
import { UpdateUserReqDto } from './dto/update-user.req.dto';

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
  getMe(@CurrentUser() payload: JwtPayloadType): Promise<UserResDto> {
    return this.usersService.getUserById(payload.userId);
  }

  @Patch('me')
  @ApiAuth({
    type: UserResDto,
    summary: 'Cập nhật thông tin cá nhân',
  })
  updateMe(
    @CurrentUser() payload: JwtPayloadType,
    @Body() reqDto: UpdateCurrentUserReqDto,
  ): Promise<UserResDto> {
    return this.usersService.updateCurrentUser(payload.userId, reqDto);
  }

  @Get()
  @Permissions(Permission.USERS_READ)
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
  @Permissions(Permission.USERS_READ)
  @ApiAuth({
    type: UserStatsResDto,
    summary: 'Lấy thống kê người dùng',
  })
  getStats(): Promise<UserStatsResDto> {
    return this.usersService.getStats();
  }

  @Get(':userId')
  @Permissions(Permission.USERS_READ)
  @ApiAuth({
    type: UserResDto,
    summary: 'Lấy chi tiết người dùng',
  })
  getUser(@UUIDParam('userId') userId: string): Promise<UserResDto> {
    return this.usersService.getUserById(userId);
  }

  @Patch(':userId')
  @Permissions(Permission.USERS_MANAGE)
  @ApiAuth({
    type: UserResDto,
    summary: 'Cập nhật người dùng',
  })
  updateUser(
    @UUIDParam('userId') userId: string,
    @Body() reqDto: UpdateUserReqDto,
  ): Promise<UserResDto> {
    return this.usersService.update(userId, reqDto);
  }

  @Patch(':userId/toggle-lock')
  @Permissions(Permission.USERS_MANAGE)
  @ApiAuth({
    type: UserResDto,
    summary: 'Đảo trạng thái khóa tài khoản',
  })
  toggleLock(@UUIDParam('userId') userId: string): Promise<UserResDto> {
    return this.usersService.toggleLock(userId);
  }

  @Post()
  @Permissions(Permission.USERS_MANAGE)
  @ApiAuth({
    type: UserResDto,
    summary: 'Tạo tài khoản người dùng (Admin)',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResDto> {
    return this.usersService.create(createUserDto);
  }
}
