import { Module } from '@nestjs/common';
import { AcademicCatalogController } from './academic-catalog.controller';
import { AcademicCatalogService } from './academic-catalog.service';

@Module({
  controllers: [AcademicCatalogController],
  providers: [AcademicCatalogService],
})
export class AcademicCatalogModule {}
