import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.type';
import {
  gradeSubjects,
  grades,
  majorSubjects,
  majors,
  schoolLevels,
  subjects,
} from '../../database/schemas';
import { AcademicCatalogItemResDto } from './dto/academic-catalog-item.res.dto';
import { AcademicNodeType } from './dto/academic-node-type.enum';
import { AcademicSubjectResDto } from './dto/academic-subject.res.dto';
import { GetAcademicSubjectsReqDto } from './dto/get-academic-subjects.req.dto';

type AcademicCatalogTreeNode = AcademicCatalogItemResDto;

@Injectable()
export class AcademicCatalogService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) {}

  async getSchoolLevels() {
    return this.db
      .select()
      .from(schoolLevels)
      .where(eq(schoolLevels.isActive, true))
      .orderBy(asc(schoolLevels.sortOrder), asc(schoolLevels.name));
  }

  async getGrades(schoolLevelCode?: string) {
    const where = and(
      eq(grades.isActive, true),
      schoolLevelCode ? eq(schoolLevels.code, schoolLevelCode) : undefined,
    );

    return this.db
      .select({
        id: grades.id,
        code: grades.code,
        name: grades.name,
        schoolLevelCode: schoolLevels.code,
      })
      .from(grades)
      .innerJoin(schoolLevels, eq(grades.schoolLevelId, schoolLevels.id))
      .where(where)
      .orderBy(asc(grades.sortOrder), asc(grades.name));
  }

  async getMajors(schoolLevelCode?: string) {
    const where = and(
      eq(majors.isActive, true),
      schoolLevelCode ? eq(schoolLevels.code, schoolLevelCode) : undefined,
    );

    return this.db
      .select({
        id: majors.id,
        code: majors.code,
        name: majors.name,
        schoolLevelCode: schoolLevels.code,
      })
      .from(majors)
      .innerJoin(schoolLevels, eq(majors.schoolLevelId, schoolLevels.id))
      .where(where)
      .orderBy(asc(majors.sortOrder), asc(majors.name));
  }

  async getTree(): Promise<AcademicCatalogItemResDto[]> {
    const [schoolLevelRows, gradeRows, majorRows, gradeSubjectRows, majorSubjectRows] =
      await Promise.all([
        this.db
          .select()
          .from(schoolLevels)
          .where(eq(schoolLevels.isActive, true))
          .orderBy(
            asc(schoolLevels.sortOrder),
            asc(schoolLevels.name),
            asc(schoolLevels.createdAt),
          ),
        this.db
          .select()
          .from(grades)
          .where(eq(grades.isActive, true))
          .orderBy(asc(grades.sortOrder), asc(grades.name), asc(grades.createdAt)),
        this.db
          .select()
          .from(majors)
          .where(eq(majors.isActive, true))
          .orderBy(asc(majors.sortOrder), asc(majors.name), asc(majors.createdAt)),
        this.db
          .select({
            ownerId: gradeSubjects.gradeId,
            id: subjects.id,
            code: subjects.code,
            name: subjects.name,
            description: subjects.description,
            sortOrder: gradeSubjects.sortOrder,
          })
          .from(gradeSubjects)
          .innerJoin(subjects, eq(gradeSubjects.subjectId, subjects.id))
          .where(eq(subjects.isActive, true))
          .orderBy(asc(gradeSubjects.sortOrder), asc(subjects.name)),
        this.db
          .select({
            ownerId: majorSubjects.majorId,
            id: subjects.id,
            code: subjects.code,
            name: subjects.name,
            description: subjects.description,
            sortOrder: majorSubjects.sortOrder,
          })
          .from(majorSubjects)
          .innerJoin(subjects, eq(majorSubjects.subjectId, subjects.id))
          .where(eq(subjects.isActive, true))
          .orderBy(asc(majorSubjects.sortOrder), asc(subjects.name)),
      ]);

    const schoolLevelNodes = new Map<string, AcademicCatalogTreeNode>();
    const gradeNodes = new Map<string, AcademicCatalogTreeNode>();
    const majorNodes = new Map<string, AcademicCatalogTreeNode>();

    schoolLevelRows.forEach((row) => {
      schoolLevelNodes.set(
        row.id,
        this.toNode(
          row.id,
          null,
          AcademicNodeType.SCHOOL_LEVEL,
          row.code,
          row.name,
          row.description,
          row.sortOrder,
        ),
      );
    });

    gradeRows.forEach((row) => {
      gradeNodes.set(
        row.id,
        this.toNode(
          row.id,
          row.schoolLevelId,
          AcademicNodeType.GRADE,
          row.code,
          row.name,
          row.description,
          row.sortOrder,
        ),
      );
    });

    majorRows.forEach((row) => {
      majorNodes.set(
        row.id,
        this.toNode(
          row.id,
          row.schoolLevelId,
          AcademicNodeType.MAJOR,
          row.code,
          row.name,
          row.description,
          row.sortOrder,
        ),
      );
    });

    gradeSubjectRows.forEach((row) => {
      gradeNodes.get(row.ownerId)?.children.push(
        this.toNode(
          row.id,
          row.ownerId,
          AcademicNodeType.SUBJECT,
          row.code,
          row.name,
          row.description,
          row.sortOrder,
        ),
      );
    });

    majorSubjectRows.forEach((row) => {
      majorNodes.get(row.ownerId)?.children.push(
        this.toNode(
          row.id,
          row.ownerId,
          AcademicNodeType.SUBJECT,
          row.code,
          row.name,
          row.description,
          row.sortOrder,
        ),
      );
    });

    gradeNodes.forEach((node) => {
      schoolLevelNodes.get(node.parentId!)?.children.push(node);
    });

    majorNodes.forEach((node) => {
      schoolLevelNodes.get(node.parentId!)?.children.push(node);
    });

    return [...schoolLevelNodes.values()];
  }

  async getSubjects(
    query: GetAcademicSubjectsReqDto,
  ): Promise<AcademicSubjectResDto[]> {
    if (query.gradeCode) {
      return this.getSubjectsByGradeCode(query.gradeCode, query.q);
    }

    if (query.majorCode) {
      return this.getSubjectsByMajorCode(query.majorCode, query.q);
    }

    if (query.schoolLevelCode) {
      const [gradeItems, majorItems] = await Promise.all([
        this.db
          .select({ code: grades.code })
          .from(grades)
          .innerJoin(
            schoolLevels,
            eq(grades.schoolLevelId, schoolLevels.id),
          )
          .where(eq(schoolLevels.code, query.schoolLevelCode)),
        this.db
          .select({ code: majors.code })
          .from(majors)
          .innerJoin(
            schoolLevels,
            eq(majors.schoolLevelId, schoolLevels.id),
          )
          .where(eq(schoolLevels.code, query.schoolLevelCode)),
      ]);

      const results = await Promise.all([
        ...gradeItems.map((item) => this.getSubjectsByGradeCode(item.code, query.q)),
        ...majorItems.map((item) => this.getSubjectsByMajorCode(item.code, query.q)),
      ]);

      return this.deduplicateSubjects(results.flat());
    }

    const rows = await this.db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.isActive, true),
          query.q
            ? or(
                ilike(subjects.name, `%${query.q}%`),
                ilike(subjects.code, `%${query.q}%`),
              )
            : undefined,
        ),
      );
    return plainToInstance(AcademicSubjectResDto, rows);
  }

  private async getSubjectsByGradeCode(gradeCode: string, q?: string) {
    const grade = await this.db.query.grades.findFirst({
      where: eq(grades.code, gradeCode),
      columns: { id: true },
    });

    if (!grade) {
      return [];
    }

    const rows = await this.db
      .select({
        id: subjects.id,
        code: subjects.code,
        name: subjects.name,
        description: subjects.description,
        sortOrder: gradeSubjects.sortOrder,
      })
      .from(gradeSubjects)
      .innerJoin(subjects, eq(gradeSubjects.subjectId, subjects.id))
      .where(
        and(
          eq(gradeSubjects.gradeId, grade.id),
          eq(subjects.isActive, true),
          q
            ? or(ilike(subjects.name, `%${q}%`), ilike(subjects.code, `%${q}%`))
            : undefined,
        ),
      )
      .orderBy(asc(gradeSubjects.sortOrder), asc(subjects.name));

    return plainToInstance(AcademicSubjectResDto, rows);
  }

  private async getSubjectsByMajorCode(majorCode: string, q?: string) {
    const major = await this.db.query.majors.findFirst({
      where: eq(majors.code, majorCode),
      columns: { id: true },
    });

    if (!major) {
      return [];
    }

    const rows = await this.db
      .select({
        id: subjects.id,
        code: subjects.code,
        name: subjects.name,
        description: subjects.description,
        sortOrder: majorSubjects.sortOrder,
      })
      .from(majorSubjects)
      .innerJoin(subjects, eq(majorSubjects.subjectId, subjects.id))
      .where(
        and(
          eq(majorSubjects.majorId, major.id),
          eq(subjects.isActive, true),
          q
            ? or(ilike(subjects.name, `%${q}%`), ilike(subjects.code, `%${q}%`))
            : undefined,
        ),
      )
      .orderBy(asc(majorSubjects.sortOrder), asc(subjects.name));

    return plainToInstance(AcademicSubjectResDto, rows);
  }

  private deduplicateSubjects(items: AcademicSubjectResDto[]) {
    return Array.from(
      new Map(items.map((item) => [item.id, item])).values(),
    ).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  private toNode(
    id: string,
    parentId: string | null,
    type: AcademicCatalogTreeNode['type'],
    code: string,
    name: string,
    description: string | null,
    sortOrder: number,
  ) {
    return plainToInstance(AcademicCatalogItemResDto, {
      id,
      parentId,
      type,
      code,
      name,
      description,
      sortOrder,
      children: [],
    });
  }
}
