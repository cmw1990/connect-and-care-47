import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase/client';
import { Order } from './marketplace.service';
import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

class PaymentService {
  async createPaymentMethod(paymentMethodData: {
    type: 'card';
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
    billing_details?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  }): Promise<PaymentMethod> {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe not initialized');

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: paymentMethodData.card,
      billing_details: paymentMethodData.billing_details,
    });

    if (error) throw error;

    const { data: savedMethod, error: dbError } = await supabase
      .from('payment_methods')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        stripe_payment_method_id: paymentMethod.id,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year,
        is_default: false,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    analyticsService.trackEvent({
      category: 'payment',
      action: 'create_payment_method',
      label: paymentMethod.type,
    });

    return {
      id: savedMethod.id,
      type: savedMethod.type,
      last4: savedMethod.last4,
      brand: savedMethod.brand,
      expMonth: savedMethod.exp_month,
      expYear: savedMethod.exp_year,
      isDefault: savedMethod.is_default,
    };
  }

  async listPaymentMethods(): Promise<PaymentMethod[]> {
    const { data: methods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('is_default', { ascending: false });

    if (error) throw error;

    return methods.map(method => ({
      id: method.id,
      type: method.type,
      last4: method.last4,
      brand: method.brand,
      expMonth: method.exp_month,
      expYear: method.exp_year,
      isDefault: method.is_default,
    }));
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    // Start a transaction to update payment methods
    const { error } = await supabase.rpc('set_default_payment_method', {
      p_user_id: userId,
      p_payment_method_id: paymentMethodId,
    });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'payment',
      action: 'set_default_payment_method',
      metadata: { paymentMethodId },
    });
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'payment',
      action: 'delete_payment_method',
      metadata: { paymentMethodId },
    });
  }

  async createPaymentIntent(order: Order): Promise<PaymentIntent> {
    // Create a payment intent on the server
    const { data: intent, error } = await supabase
      .functions.invoke('create-payment-intent', {
        body: {
          amount: order.total,
          currency: order.currency,
          orderId: order.id,
        },
      });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'payment',
      action: 'create_payment_intent',
      metadata: { orderId: order.id, amount: order.total },
    });

    return {
      id: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      clientSecret: intent.client_secret,
    };
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<void> {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe not initialized');

    const { error } = await stripe.confirmCardPayment(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    if (error) throw error;

    // Update order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment: {
          status: 'paid',
          transactionId: paymentIntentId,
        },
      })
      .eq('id', paymentIntentId)
      .select()
      .single();

    if (orderError) throw orderError;

    // Notify user
    await notificationService.create({
      userId: order.user_id,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment for order #${order.id} has been processed successfully`,
      data: { orderId: order.id },
    });

    analyticsService.trackEvent({
      category: 'payment',
      action: 'confirm_payment',
      metadata: { paymentIntentId },
    });
  }

  async createSubscription(priceId: string, paymentMethodId: string): Promise<string> {
    const { data: subscription, error } = await supabase
      .functions.invoke('create-subscription', {
        body: {
          priceId,
          paymentMethodId,
        },
      });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'payment',
      action: 'create_subscription',
      metadata: { priceId },
    });

    return subscription.id;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .functions.invoke('cancel-subscription', {
        body: { subscriptionId },
      });

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'payment',
      action: 'cancel_subscription',
      metadata: { subscriptionId },
    });
  }

  async getPaymentHistory(options: {
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
      metadata: Record<string, any>;
    }>;
    total: number;
  }> {
    const { data, error, count } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .gte('created_at', options.startDate)
      .lte('created_at', options.endDate)
      .eq('status', options.status)
      .range(
        options.offset || 0,
        (options.offset || 0) + (options.limit || 10) - 1
      );

    if (error) throw error;

    return {
      transactions: data.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.created_at,
        metadata: tx.metadata,
      })),
      total: count || 0,
    };
  }
}

export const paymentService = new PaymentService();
