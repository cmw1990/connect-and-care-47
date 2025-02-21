import { supabase } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';
import { analyticsService } from './analytics.service';
import { notificationService } from './notification.service';
import { fileService } from './file.service';

export interface InsuranceClaim {
  id: string;
  userId: string;
  providerId: string;
  serviceDate: string;
  serviceType: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'paid';
  documents: {
    id: string;
    type: string;
    url: string;
  }[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BillingRecord {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paymentMethod?: string;
  paymentDate?: string;
  metadata?: Record<string, any>;
}

export interface ServiceRate {
  id: string;
  serviceType: string;
  baseRate: number;
  currency: string;
  unit: 'hour' | 'day' | 'week' | 'month' | 'session';
  modifiers?: {
    type: string;
    factor: number;
    condition?: string;
  }[];
  effectiveDate: string;
  expiryDate?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'suspended' | 'trial';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
  price: number;
  billingCycle: 'monthly' | 'yearly';
  metadata?: Record<string, any>;
}

class AdminService {
  async createInsuranceClaim(claim: Omit<InsuranceClaim, 'id'>): Promise<InsuranceClaim> {
    // Upload documents if any
    const documents = await Promise.all(
      (claim.documents || []).map(async (doc) => {
        const response = await fetch(doc.url);
        const blob = await response.blob();
        const file = new File([blob], `claim_doc_${Date.now()}`, { type: doc.type });
        
        const fileMetadata = await fileService.uploadFile(file, 'document', {
          purpose: 'insurance_claim',
          userId: claim.userId,
          providerId: claim.providerId,
        });

        return {
          id: fileMetadata.id,
          type: doc.type,
          url: fileMetadata.url!,
        };
      })
    );

    const { data, error } = await supabase
      .from('insurance_claims')
      .insert({
        user_id: claim.userId,
        provider_id: claim.providerId,
        service_date: claim.serviceDate,
        service_type: claim.serviceType,
        amount: claim.amount,
        status: claim.status,
        documents,
        notes: claim.notes,
        metadata: claim.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify relevant parties
    await Promise.all([
      notificationService.create({
        userId: claim.userId,
        type: 'insurance',
        title: 'Insurance Claim Created',
        message: `Your insurance claim for ${claim.serviceType} has been submitted`,
        data: { claimId: data.id },
      }),
      notificationService.create({
        userId: claim.providerId,
        type: 'insurance',
        title: 'New Insurance Claim',
        message: `A new insurance claim has been submitted for your service`,
        data: { claimId: data.id },
      }),
    ]);

    analyticsService.trackEvent({
      category: 'insurance',
      action: 'create_claim',
      label: claim.serviceType,
      metadata: { userId: claim.userId, amount: claim.amount },
    });

    return data;
  }

  async updateClaimStatus(claimId: string, status: InsuranceClaim['status'], notes?: string): Promise<void> {
    const { data: claim, error: updateError } = await supabase
      .from('insurance_claims')
      .update({
        status,
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Notify the user
    await notificationService.create({
      userId: claim.user_id,
      type: 'insurance',
      title: 'Claim Status Updated',
      message: `Your insurance claim status has been updated to ${status}`,
      priority: status === 'denied' ? 'high' : 'medium',
      data: { claimId },
    });

    analyticsService.trackEvent({
      category: 'insurance',
      action: 'update_claim_status',
      label: status,
      metadata: { claimId },
    });
  }

  async createBillingRecord(record: Omit<BillingRecord, 'id'>): Promise<BillingRecord> {
    const { data, error } = await supabase
      .from('billing_records')
      .insert({
        user_id: record.userId,
        provider_id: record.providerId,
        service_id: record.serviceId,
        amount: record.amount,
        status: record.status,
        due_date: record.dueDate,
        payment_method: record.paymentMethod,
        payment_date: record.paymentDate,
        metadata: record.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify the user
    await notificationService.create({
      userId: record.userId,
      type: 'billing',
      title: 'New Billing Record',
      message: `A new billing record has been created for your service`,
      data: { recordId: data.id },
    });

    analyticsService.trackEvent({
      category: 'billing',
      action: 'create_record',
      metadata: { userId: record.userId, amount: record.amount },
    });

    return data;
  }

  async processPayment(recordId: string, paymentMethod: string): Promise<void> {
    const { data: record, error: recordError } = await supabase
      .from('billing_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (recordError) throw recordError;

    // Process payment through payment gateway
    // This is a placeholder - implement actual payment processing
    const paymentResult = {
      success: true,
      transactionId: `tx_${Date.now()}`,
    };

    if (paymentResult.success) {
      const { error: updateError } = await supabase
        .from('billing_records')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
          metadata: {
            ...record.metadata,
            transaction_id: paymentResult.transactionId,
          },
        })
        .eq('id', recordId);

      if (updateError) throw updateError;

      // Notify relevant parties
      await Promise.all([
        notificationService.create({
          userId: record.user_id,
          type: 'billing',
          title: 'Payment Processed',
          message: `Your payment has been processed successfully`,
          data: { recordId },
        }),
        notificationService.create({
          userId: record.provider_id,
          type: 'billing',
          title: 'Payment Received',
          message: `Payment has been received for your service`,
          data: { recordId },
        }),
      ]);

      analyticsService.trackEvent({
        category: 'billing',
        action: 'process_payment',
        metadata: { recordId, amount: record.amount },
      });
    }
  }

  async setServiceRate(rate: Omit<ServiceRate, 'id'>): Promise<ServiceRate> {
    const { data, error } = await supabase
      .from('service_rates')
      .insert({
        service_type: rate.serviceType,
        base_rate: rate.baseRate,
        currency: rate.currency,
        unit: rate.unit,
        modifiers: rate.modifiers,
        effective_date: rate.effectiveDate,
        expiry_date: rate.expiryDate,
      })
      .select()
      .single();

    if (error) throw error;

    analyticsService.trackEvent({
      category: 'admin',
      action: 'set_service_rate',
      label: rate.serviceType,
      metadata: { baseRate: rate.baseRate },
    });

    return data;
  }

  async calculateServiceCost(params: {
    serviceType: string;
    quantity: number;
    modifiers?: Record<string, any>;
  }): Promise<{
    baseAmount: number;
    modifiedAmount: number;
    currency: string;
    breakdown: Record<string, number>;
  }> {
    const { data: rate } = await supabase
      .from('service_rates')
      .select('*')
      .eq('service_type', params.serviceType)
      .lte('effective_date', new Date().toISOString())
      .gt('expiry_date', new Date().toISOString())
      .single();

    if (!rate) throw new Error('No valid rate found for service');

    let baseAmount = rate.base_rate * params.quantity;
    let modifiedAmount = baseAmount;
    const breakdown: Record<string, number> = {
      base: baseAmount,
    };

    // Apply modifiers
    if (rate.modifiers && params.modifiers) {
      for (const modifier of rate.modifiers) {
        if (modifier.condition) {
          // Evaluate condition based on provided modifiers
          const conditionMet = eval(
            modifier.condition.replace(
              /\$\{(\w+)\}/g,
              (_, key) => params.modifiers![key]
            )
          );

          if (conditionMet) {
            const modifierAmount = baseAmount * (modifier.factor - 1);
            modifiedAmount += modifierAmount;
            breakdown[modifier.type] = modifierAmount;
          }
        }
      }
    }

    return {
      baseAmount,
      modifiedAmount,
      currency: rate.currency,
      breakdown,
    };
  }

  async manageSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: subscription.userId,
        plan: subscription.plan,
        status: subscription.status,
        start_date: subscription.startDate,
        end_date: subscription.endDate,
        auto_renew: subscription.autoRenew,
        features: subscription.features,
        price: subscription.price,
        billing_cycle: subscription.billingCycle,
        metadata: subscription.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify the user
    await notificationService.create({
      userId: subscription.userId,
      type: 'subscription',
      title: 'Subscription Updated',
      message: `Your subscription has been updated to ${subscription.plan}`,
      data: { subscriptionId: data.id },
    });

    analyticsService.trackEvent({
      category: 'subscription',
      action: 'manage_subscription',
      label: subscription.plan,
      metadata: { userId: subscription.userId },
    });

    return data;
  }

  async getSubscriptionFeatures(plan: Subscription['plan']): Promise<string[]> {
    const features: Record<Subscription['plan'], string[]> = {
      free: [
        'Basic care coordination',
        'Limited health tracking',
        'Community support access',
      ],
      basic: [
        'Full care coordination',
        'Advanced health tracking',
        'Basic analytics',
        'Email support',
        'Mobile app access',
      ],
      premium: [
        'All Basic features',
        'Premium analytics',
        'Priority support',
        'Custom care plans',
        'Advanced integrations',
        'Team collaboration',
      ],
      enterprise: [
        'All Premium features',
        'Custom features',
        'Dedicated support',
        'API access',
        'Custom reporting',
        'Training & onboarding',
      ],
    };

    return features[plan] || [];
  }
}

export const adminService = new AdminService();
