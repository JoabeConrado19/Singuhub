// certificate.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  HttpException, 
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { IssueCertificateDto } from 'src/blockchain/blockchain.dto';
import { CertificateService } from 'src/blockchain/blockchain.service';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async issueCertificate(@Body() dto: IssueCertificateDto) {
    try {
      // Validação básica
      if (!dto.studentName || !dto.courseName || !dto.institution || !dto.uniqueId) {
        throw new HttpException(
          'All fields are required: studentName, courseName, institution, uniqueId',
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.certificateService.issueCertificate(dto);

      return {
        message: 'Certificate issued successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to issue certificate',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getAllCertificates() {
    try {
      const certificates = await this.certificateService.getAllCertificates();

      return {
        message: 'Certificates retrieved successfully',
        count: certificates.length,
        data: certificates,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve certificates',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':certId')
  async verifyCertificate(@Param('certId') certId: string) {
    try {
      if (!certId.startsWith('0x') || certId.length !== 66) {
        throw new HttpException(
          'Invalid certificate ID format',
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.certificateService.verifyCertificate(certId);

      if (!result.exists) {
        throw new HttpException(
          'Certificate not found',
          HttpStatus.NOT_FOUND
        );
      }

      return {
        message: 'Certificate verified successfully',
        data: result.certificate,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to verify certificate',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('generate-id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  generateCertId(@Body() dto: IssueCertificateDto) {
    try {
      if (!dto.studentName || !dto.courseName || !dto.institution || !dto.uniqueId) {
        throw new HttpException(
          'All fields are required: studentName, courseName, institution, uniqueId',
          HttpStatus.BAD_REQUEST
        );
      }

      const certId = this.certificateService.generateCertId(
        dto.studentName,
        dto.courseName,
        dto.institution,
        dto.uniqueId
      );

      return {
        message: 'Certificate ID generated successfully',
        certId,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate certificate ID',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}