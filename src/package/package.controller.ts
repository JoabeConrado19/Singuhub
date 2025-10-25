import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CreateCheckoutDto } from 'src/package/package.dto';
import { EnrollmentService } from 'src/package/package.service';
import Stripe from 'stripe';

@Controller('enrollment')
export class EnrollmentController {
  private stripe: Stripe;

  constructor(private readonly enrollmentService: EnrollmentService) {
    this.stripe = new Stripe("sk_test_51SLrhzPwvA7hd9qxCDw8KdQ2CzEIn0QwQwg7jYrw5RF6byqFUWtEgGhat6zsc989zaFHAzJfLeiBWv1j6Iw8E67h006fxGuy8j");
  }

  @Post('checkout')
  async createCheckoutSession(@Body() createCheckoutDto: CreateCheckoutDto) {
    const {
      courseId,
      userId,
      price,
      courseName,
      courseDescription,
      userEmail,
      successUrl,
      cancelUrl,
    } = createCheckoutDto;

    return this.enrollmentService.createCheckoutSession(
      courseId,
      userId,
      price,
      courseName,
      courseDescription || '',
      userEmail,
      successUrl,
      cancelUrl,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: any,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.log(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    const result = await this.enrollmentService.handleStripeWebhook(event);

    return result;
  }

  @Get('session/:sessionId')
  async getSessionDetails(@Param('sessionId') sessionId: string) {
    return this.enrollmentService.getSessionDetails(sessionId);
  }
}