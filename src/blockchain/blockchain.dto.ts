import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class IssueCertificateDto {
  @IsString()
  @IsNotEmpty({ message: 'Student name is required' })
  @MinLength(2, { message: 'Student name must be at least 2 characters' })
  @MaxLength(100, { message: 'Student name must not exceed 100 characters' })
  studentName: string;

  @IsString()
  @IsNotEmpty({ message: 'Course name is required' })
  @MinLength(2, { message: 'Course name must be at least 2 characters' })
  @MaxLength(100, { message: 'Course name must not exceed 100 characters' })
  courseName: string;

  @IsString()
  @IsNotEmpty({ message: 'Institution is required' })
  @MinLength(2, { message: 'Institution must be at least 2 characters' })
  @MaxLength(100, { message: 'Institution must not exceed 100 characters' })
  institution: string;

  @IsString()
  @IsNotEmpty({ message: 'Unique ID is required' })
  @MinLength(1, { message: 'Unique ID must be at least 1 character' })
  @MaxLength(50, { message: 'Unique ID must not exceed 50 characters' })
  uniqueId: string;
}