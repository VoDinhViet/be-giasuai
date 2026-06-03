import { Param, ParseUUIDPipe } from '@nestjs/common';

/**
 * Custom decorator kết hợp Param và ParseUUIDPipe để validate UUID.
 *
 * @param property - Tên của tham số trong route (ví dụ: 'userId', 'roleId').
 */
export const UUIDParam = (property: string) => Param(property, ParseUUIDPipe);
