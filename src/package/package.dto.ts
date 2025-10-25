// enrollment.dto.ts
import { IsInt, IsNotEmpty, IsNumber, IsString, IsEmail, Min } from 'class-validator';

export class CreateCheckoutDto {
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsString()
  courseDescription?: string;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}