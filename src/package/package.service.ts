import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EnrollmentService {
  private readonly stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  private readonly stripeApiUrl = "https://api.stripe.com/v1";

  async createCheckoutSession(
    courseId: number,
    userId: number,
    price: number,
    courseName: string,
    courseDescription: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
  ) {
    if (!courseId || !userId || !price) {
      throw new BadRequestException('CourseId, userId and price are required');
    }

    if (price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Valida e corrige as URLs
    const validSuccessUrl = this.validateUrl(successUrl);
    const validCancelUrl = this.validateUrl(cancelUrl);

    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'brl',
      'line_items[0][price_data][product_data][name]': courseName || `Course #${courseId}`,
      'line_items[0][price_data][product_data][description]': courseDescription || `Enrollment in course ${courseId}`,
      'line_items[0][price_data][unit_amount]': Math.round(price * 100).toString(),
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': validSuccessUrl,
      'cancel_url': validCancelUrl,
      'customer_email': userEmail || "teste@gmail.com",
      'metadata[courseId]': courseId.toString(),
      'metadata[userId]': userId.toString(),
    });

    const response = await fetch(`${this.stripeApiUrl}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Stripe API Error:', error);
      throw new BadRequestException(`Stripe error: ${error.error?.message || 'Unknown error'}`);
    }

    const session = await response.json();

    return {
      sessionId: session.id,
      url: session.url,
      courseId,
      userId,
      price,
    };
  }

  private validateUrl(url: string): string {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    // Se a URL já tem http:// ou https://, retorna como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Se não tem, adiciona http://
    return `http://${url}`;
  }

  async handleStripeWebhook(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleSuccessfulPayment(event.data.object);

      case 'checkout.session.expired':
        return this.handleFailedPayment(event.data.object);

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { received: true, type: event.type };
    }
  }

  private handleSuccessfulPayment(session: any) {
    const courseId = session.metadata.courseId;
    const userId = session.metadata.userId;

    console.log(`Payment successful - CourseId: ${courseId}, UserId: ${userId}`);

    return {
      success: true,
      courseId: parseInt(courseId),
      userId: parseInt(userId),
      sessionId: session.id,
      paymentStatus: 'paid',
      amount: session.amount_total,
      customerEmail: session.customer_email,
    };
  }

  private handleFailedPayment(session: any) {
    const courseId = session.metadata.courseId;
    const userId = session.metadata.userId;

    console.log(`Payment failed - CourseId: ${courseId}, UserId: ${userId}`);

    return {
      success: false,
      courseId: parseInt(courseId),
      userId: parseInt(userId),
      sessionId: session.id,
      paymentStatus: 'failed',
    };
  }

  async getSessionDetails(sessionId: string) {
    const response = await fetch(`${this.stripeApiUrl}/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.stripeSecretKey}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Session not found');
    }

    const session = await response.json();

    return {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      status: session.status,
      courseId: session.metadata?.courseId,
      userId: session.metadata?.userId,
      amount: session.amount_total,
      customerEmail: session.customer_email,
    };
  }
}