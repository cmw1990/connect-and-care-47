
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  tier: 'basic' | 'pro' | 'enterprise';
  price: number;
  billing_interval: string;
  features: string[];
}

const Subscribe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedTier = searchParams.get('tier');

  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');
      
      if (error) throw error;
      return data.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string)
      }));
    },
  });

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe to a plan",
          variant: "destructive"
        });
        navigate('/auth?redirect=/subscribe');
        return;
      }

      // Here we'll add Stripe integration in the next step
      toast({
        title: "Coming Soon",
        description: "Payment processing will be available shortly",
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={selectedTier === plan.tier ? "ring-2 ring-primary rounded-lg" : ""}
              >
                <Card className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    <div className="text-3xl font-bold mb-6">
                      ${plan.price}
                      <span className="text-base font-normal text-muted-foreground">/{plan.billing_interval}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className="w-full"
                    variant={plan.tier === 'pro' ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan)}
                  >
                    Subscribe Now
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <Shield className="h-5 w-5" />
              <span>Secure payment processing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Cancel anytime. No long-term commitments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
