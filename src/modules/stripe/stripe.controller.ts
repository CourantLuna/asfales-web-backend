import { Body, Controller, Post, Get, Query, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { UserService } from '../user/user.service'; // Importar UserService

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService // Inyectar UserService
  ) {}

@Post('create-setup-intent')
  async createSetupIntent(@Body() body: { email: string; name: string; uid: string }) {
    if (!body.uid) {
      throw new BadRequestException("El UID es requerido para vincular los pagos.");
    }

    let customerId = "";

    // 1. INTENTO LEER DE LA HOJA DE CÁLCULO PRIMERO (Optimización) ⚡
    try {
      const profile = await this.userService.getUserProfile(body.uid);
      if (profile && profile['stripeCustomerId']) {
        customerId = profile['stripeCustomerId'];
        console.log(`✅ Usando cliente existente de DB: ${customerId}`);
      }
    } catch (e) {
      // Si falla leer el perfil, no bloqueamos, seguimos al plan B (buscar en Stripe)
      console.warn("No se pudo verificar perfil local, buscando en Stripe...");
    }

    // 2. SI NO TENÍAMOS EL ID, LO BUSCAMOS/CREAMOS EN STRIPE
    if (!customerId) {
      const customer = await this.stripeService.createOrGetCustomer(body.email, body.name);
      customerId = customer.id;

      // Y lo guardamos para la próxima
      try {
        await this.userService.updateUserProfile(body.uid, { 
            stripeCustomerId: customerId 
        });
        console.log(`💾 Nuevo Stripe ID ${customerId} guardado en perfil.`);
      } catch (error) {
        console.error("⚠️ Error guardando en Excel:", error.message);
      }
    }

    // 3. Crear el SetupIntent con el ID (sea recuperado o nuevo)
    const setupIntent = await this.stripeService.createSetupIntent(customerId);

    return { 
      clientSecret: setupIntent.client_secret, 
      customerId: customerId 
    };
  }

  @Get('payment-methods')
  async getPaymentMethods(@Query('customerId') customerId: string, @Query('uid') uid: string) {
    let finalCustomerId = customerId;

    // Si el frontend no manda el customerId (primera vez), intentamos buscarlo en la hoja
    if (!finalCustomerId && uid) {
        try {
            const profile = await this.userService.getUserProfile(uid);
            if (profile && profile['stripeCustomerId']) {
                finalCustomerId = profile['stripeCustomerId'];
            }
        } catch (e) {
            console.log("Usuario sin Stripe ID en DB");
        }
    }

    if (!finalCustomerId) {
        return []; // Si no hay ID por ningún lado, retorna lista vacía
    }

    const methods = await this.stripeService.listPaymentMethods(finalCustomerId);
    return methods;
  }
}