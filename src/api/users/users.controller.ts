import {
  Body,
  Controller,
  Delete,
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
  getMe(@User() payload: JwtPayloadType) {
    return this.usersService.findOne(payload.userId);
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
  /**
   * Lấy dữ liệu thống kê người dùng cho dashboard.
   * Quyền hạn: ADMIN.
   *
   * @returns Thống kê về tổng số, người dùng mới, đang hoạt động và bị khóa.
   */
  getStats() {
    console.log('getStats');
    return this.usersService.getStats();
  }

  @Patch(':userId/lock')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Khóa/Mở khóa tài khoản',
  })
  /**
   * Khóa hoặc mở khóa tài khoản người dùng.
   * Quyền hạn: ADMIN.
   *
   * @param userId - ID người dùng từ URL.
   * @param isLocked - Trạng thái khóa mới từ request body.
   */
  toggleLock(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('isLocked') isLocked: boolean,
  ) {
    return this.usersService.toggleLock(userId, isLocked);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN)
  @ApiAuth({
    summary: 'Xóa người dùng',
  })
  /**
   * Xóa tài khoản người dùng.
   * Quyền hạn: ADMIN.
   *
   * @param userId - ID người dùng từ URL.
   */
  delete(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.delete(userId);
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
