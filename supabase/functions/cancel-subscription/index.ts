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

serve(async (req) => {
  try {
    const { subscriptionId } = await req.json();

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Verify subscription belongs to user
    const { data: subscription, error: dbError } = await supabaseClient
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404 }
      );
    }

    // Cancel subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscription.stripe_subscription_id
    );

    // Update subscription in database
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({
        status: canceledSubscription.status,
        canceled_at: new Date(canceledSubscription.canceled_at! * 1000).toISOString(),
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
      })
      .eq('id', subscriptionId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
