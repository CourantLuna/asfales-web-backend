import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetadataParam } from '@stripe/stripe-js';
import { metadata } from 'reflect-metadata/no-conflict';
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
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'always' 
      },
      // 👇 AQUÍ VINCULAMOS TU CONFIGURACIÓN DEL DASHBOARD
      payment_method_configuration: 'pmc_1Sos9Q1QR5f5UW0YgmqkPp6S', 
      
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

  async createPaymentIntent(amount: number, currency: string, customerId?: string, paymentMethodId?: string, description?: string, metadata?: MetadataParam) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      description: description,
      metadata: metadata || undefined,
      off_session: true,
      confirm: true, // Intenta cobrar inmediatamente
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'never' 
      },
      // 👇 TAMBIÉN AQUÍ (Opcional, si quieres que apliquen las mismas reglas al cobrar)
      payment_method_configuration: 'pmc_1Sos9Q1QR5f5UW0YgmqkPp6S', 
      
      return_url: 'http://localhost:3000/payment-success', 
    });
  }
}