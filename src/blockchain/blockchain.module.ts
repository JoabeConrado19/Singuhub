import { Module } from '@nestjs/common';
import { CertificateController } from 'src/blockchain/blockchain.controller';
import { CertificateService } from 'src/blockchain/blockchain.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class BlockchainModule {}