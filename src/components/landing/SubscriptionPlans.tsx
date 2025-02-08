
import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  tier: 'basic' | 'pro' | 'enterprise';
  price: number;
  billing_interval: string;
  features: string[];
  created_at: string;
  updated_at: string;
};

export const SubscriptionPlans = () => {
  const navigate = useNavigate();
  
  const { data: subscriptionPlans = [] } = useQuery<SubscriptionPlan[]>({
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

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                          <Shield className="h-5 w-5 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className="w-full"
                    variant={plan.tier === 'pro' ? 'default' : 'outline'}
                    onClick={() => navigate('/subscribe')}
                  >
                    Get Started
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
