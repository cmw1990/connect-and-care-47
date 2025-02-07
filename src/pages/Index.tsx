
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Building, ShoppingCart, Heart, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LandingSection } from "@/types/landing";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: primaryGroup, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['primaryCareGroup'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: group, error } = await supabase
        .from('care_group_members')
        .select('group_id, care_groups(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error fetching care group:', error);
        toast({
          title: "Error",
          description: "Failed to load care group information",
          variant: "destructive",
        });
      }

      return group?.care_groups;
    }
  });

  const { data: landingSections } = useQuery({
    queryKey: ['landingSections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_sections')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as LandingSection[];
    }
  });

  if (isLoadingGroup) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-8 w-8 border-b-2 border-primary"
        />
      </div>
    );
  }

  if (primaryGroup) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="container mx-auto px-4 py-8 space-y-6"
        >
          <DashboardHeader 
            notifications={[]} 
            groupId={primaryGroup?.id} 
          />
          <DashboardContent 
            primaryGroup={primaryGroup} 
            upcomingAppointments={[]}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="container mx-auto px-4 py-8 space-y-12"
      >
        {/* Hero Section with enhanced visual appeal */}
        <section className="text-center py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background rounded-3xl border border-primary/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            >
              Your Complete Care Solution
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Whether you need to coordinate care, find caregivers, or discover care products - 
              we've got you covered with our all-in-one platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/care-guides')} className="text-lg px-8">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          {[
            { icon: Users, text: "Team Collaboration" },
            { icon: Heart, text: "Caregiver Matching" },
            { icon: Building, text: "Facility Search" },
            { icon: ShoppingCart, text: "Product Guide" }
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium">{item.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Main Services Grid with enhanced cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {landingSections?.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full border-primary/10 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    {section.section_type === 'webapp_promo' && <Users className="h-6 w-6 text-primary" />}
                    {section.section_type === 'caregiver_search' && <Heart className="h-6 w-6 text-primary" />}
                    {section.section_type === 'facility_search' && <Building className="h-6 w-6 text-primary" />}
                    {section.section_type === 'product_guide' && <ShoppingCart className="h-6 w-6 text-primary" />}
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-base">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {section.section_type === 'webapp_promo' && (
                      <ul className="space-y-3">
                        {section.content.features?.map((feature: string) => (
                          <li key={feature} className="flex items-center gap-3 text-base">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.section_type === 'caregiver_search' && (
                      <ul className="space-y-3">
                        {section.content.benefits?.map((benefit: string) => (
                          <li key={benefit} className="flex items-center gap-3 text-base">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button 
                      className="w-full mt-6 group-hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        switch (section.section_type) {
                          case 'webapp_promo':
                            navigate('/groups');
                            break;
                          case 'caregiver_search':
                            navigate('/caregivers');
                            break;
                          case 'facility_search':
                            navigate('/facilities');
                            break;
                          case 'product_guide':
                            navigate('/compare');
                            break;
                        }
                      }}
                    >
                      Explore Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators Section */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Thousands of Families</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "10k+", label: "Active Users" },
              { number: "98%", label: "Satisfaction Rate" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-primary/5 border border-primary/10"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="text-center py-16 bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl border border-primary/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-4"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of families who trust us with their care needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
                Sign Up Now
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/care-guides')} className="text-lg px-8">
                Browse Care Guides
              </Button>
            </div>
          </motion.div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
