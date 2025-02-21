import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.18.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  const { orderId, userId } = paymentIntent.metadata;

  // Update order status
  await supabaseClient
    .from('orders')
    .update({
      status: 'confirmed',
      payment: {
        status: 'paid',
        transactionId: paymentIntent.id,
      },
    })
    .eq('id', orderId);

  // Update payment transaction
  await supabaseClient
    .from('payment_transactions')
    .update({
      status: paymentIntent.status,
      completed_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Create notification
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment for order #${orderId} has been processed successfully`,
      data: { orderId },
    });
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  await supabaseClient
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id);
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  await supabaseClient
    .from('subscriptions')
    .update({
      status: subscription.status,
      canceled_at: new Date(subscription.canceled_at! * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
};

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature found');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
