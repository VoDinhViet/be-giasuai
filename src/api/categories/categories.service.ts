import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, ilike, inArray, or } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { isUUID } from 'class-validator';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import { categories, CategoryType } from '../../database/schemas';
import { CategoryResDto } from './dto/category.res.dto';
import { GetCategorySubjectsReqDto } from './dto/get-category-subjects.req.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getLevels() {
    const rows = await this.db.query.categories.findMany({
      where: and(
        eq(categories.type, CategoryType.LEVEL),
        eq(categories.isActive, true),
      ),
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });
    return plainToInstance(CategoryResDto, rows);
  }

  async getGrades(levelId?: string) {
    const parentId = await this.resolveId(levelId, CategoryType.LEVEL);
    const rows = await this.db.query.categories.findMany({
      where: and(
        eq(categories.type, CategoryType.GRADE),
        eq(categories.isActive, true),
        parentId ? eq(categories.parentId, parentId) : undefined,
      ),
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });
    return plainToInstance(CategoryResDto, rows);
  }

  async getMajors(levelId?: string) {
    const parentId = await this.resolveId(levelId, CategoryType.LEVEL);
    const rows = await this.db.query.categories.findMany({
      where: and(
        eq(categories.type, CategoryType.MAJOR),
        eq(categories.isActive, true),
        parentId ? eq(categories.parentId, parentId) : undefined,
      ),
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });
    return plainToInstance(CategoryResDto, rows);
  }

  /**
   * Truy vấn môn học tối ưu bằng cách sử dụng subqueries để xử lý phân cấp
   * Giảm thiểu round-trip tới database.
   */
  async getSubjects(query: GetCategorySubjectsReqDto) {
    const where = and(
      eq(categories.type, CategoryType.SUBJECT),
      eq(categories.isActive, true),
      // Xử lý lọc theo Grade/Major/Level bằng Subquery
      this.buildParentFilter(query),
      // Tìm kiếm theo từ khóa
      query.q
        ? or(
            ilike(categories.name, `%${query.q}%`),
            ilike(categories.code, `%${query.q}%`),
          )
        : undefined,
    );

    const rows = await this.db.query.categories.findMany({
      where,
      orderBy: [asc(categories.sortOrder), asc(categories.name)],
    });

    return plainToInstance(CategoryResDto, rows);
  }

  /**
   * Xây dựng subquery để lọc parentId của môn học dựa trên Grade, Major hoặc Level
   */
  private buildParentFilter(query: GetCategorySubjectsReqDto) {
    if (query.gradeId || query.majorId) {
      const val = query.gradeId || query.majorId;
      const type = query.gradeId ? CategoryType.GRADE : CategoryType.MAJOR;

      // Tìm ID của Grade/Major trực tiếp (hỗ trợ cả ID và Code)
      return inArray(
        categories.parentId,
        this.db
          .select({ id: categories.id })
          .from(categories)
          .where(
            and(
              eq(categories.type, type),
              or(
                isUUID(val) ? eq(categories.id, val!) : undefined,
                eq(categories.code, val!),
              ),
            ),
          ),
      );
    }

    if (query.levelId) {
      // Tìm các Grade/Major thuộc về Level này
      return inArray(
        categories.parentId,
        this.db
          .select({ id: categories.id })
          .from(categories)
          .where(
            and(
              or(
                eq(categories.type, CategoryType.GRADE),
                eq(categories.type, CategoryType.MAJOR),
              ),
              inArray(
                categories.parentId,
                this.db
                  .select({ id: categories.id })
                  .from(categories)
                  .where(
                    and(
                      eq(categories.type, CategoryType.LEVEL),
                      or(
                        isUUID(query.levelId)
                          ? eq(categories.id, query.levelId)
                          : undefined,
                        eq(categories.code, query.levelId),
                      ),
                    ),
                  ),
              ),
            ),
          ),
      );
    }

    return undefined;
  }

  private async resolveId(idOrCode: string | undefined, type: CategoryType) {
    if (!idOrCode) return;
    if (isUUID(idOrCode)) return idOrCode;
    const cat = await this.db.query.categories.findFirst({
      where: and(eq(categories.type, type), eq(categories.code, idOrCode)),
      columns: { id: true },
    });
    return cat?.id;
  }
}
