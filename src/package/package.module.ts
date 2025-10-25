import { Module } from '@nestjs/common';

import { EnrollmentController } from 'src/package/package.controller';
import { EnrollmentService } from 'src/package/package.service';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class PackageModule {}