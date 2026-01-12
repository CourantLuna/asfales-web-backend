import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-12-15.clover', // Usa la versión estable más reciente
    });
  }

  async createOrGetCustomer(email: string, name: string) {
    const existing = await this.stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      return existing.data[0];
    }
    return this.stripe.customers.create({ email, name });
  }

  // --- CORRECCIÓN 1: Setup Intent ---
  async createSetupIntent(customerId: string) {
    return this.stripe.setupIntents.create({
      customer: customerId,
      // 1. Usamos MANUALMENTE los tipos permitidos
      // 'card' -> Incluye Visa, MC, Amex, Apple Pay y Google Pay
      // 'paypal' -> Incluye PayPal
      payment_method_types: ['apple_pay', 'google_pay', 'card'], 
      
      // 2. Eliminamos 'automatic_payment_methods' para evitar conflictos
      // 3. Opciones extra para optimizar seguridad en tarjetas
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      usage: 'off_session', 
    });
  }

  // --- CORRECCIÓN 2: Listar Múltiples Tipos ---
  async listPaymentMethods(customerId: string) {
    // Stripe no permite pedir ['card', 'paypal'] en una sola llamada.
    // Debemos pedir las listas por separado y unirlas.
    
    const [cards, ] = await Promise.all([
      this.stripe.paymentMethods.list({ customer: customerId, type: 'card' }),
    //   this.stripe.paymentMethods.list({ customer: customerId, type: 'paypal' }),
    ]);

    // Unimos los resultados en un solo array para el Frontend
        // return [...cards.data, ...paypals.data].sort((a, b) => b.created - a.created);
    return [...cards.data].sort((a, b) => b.created - a.created);
  }

  async createPaymentIntent(amount: number, currency: string, customerId?: string, paymentMethodId?: string) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      // Si usas tipos específicos arriba, es bueno mantener coherencia, 
      // pero para cobrar una tarjeta YA guardada, esto suele bastar.
      return_url: 'http://localhost:3000/payment-success', 
    });
  }
}