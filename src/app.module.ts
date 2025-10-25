import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from 'prisma/prisma.service';

import { BlockchainModule } from './blockchain/blockchain.module';
import { CertificateController } from 'src/blockchain/blockchain.controller';
import { CertificateService } from 'src/blockchain/blockchain.service';
import { PackageModule } from 'src/package/package.module';
import { EnrollmentController } from 'src/package/package.controller';
import { EnrollmentService } from 'src/package/package.service';

@Module({
  imports: [
    BlockchainModule,
    PackageModule
  ],
  controllers: [AppController, CertificateController, EnrollmentController],
  providers: [AppService, CertificateService, EnrollmentService],
})
export class AppModule {}
