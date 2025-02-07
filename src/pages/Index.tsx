
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Building, ShoppingCart, Heart } from "lucide-react";
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
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-b from-primary/10 to-background rounded-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Your Complete Care Solution
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Whether you need to coordinate care, find caregivers, or discover care products - 
            we've got you covered.
          </motion.p>
        </section>

        {/* Main Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {landingSections?.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {section.section_type === 'webapp_promo' && <Users className="h-5 w-5 text-primary" />}
                    {section.section_type === 'caregiver_search' && <Heart className="h-5 w-5 text-primary" />}
                    {section.section_type === 'facility_search' && <Building className="h-5 w-5 text-primary" />}
                    {section.section_type === 'product_guide' && <ShoppingCart className="h-5 w-5 text-primary" />}
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.section_type === 'webapp_promo' && (
                      <ul className="space-y-2">
                        {section.content.features?.map((feature: string) => (
                          <li key={feature} className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.section_type === 'caregiver_search' && (
                      <ul className="space-y-2">
                        {section.content.benefits?.map((benefit: string) => (
                          <li key={benefit} className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-primary" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* Add more section type specific content */}
                    <Button 
                      className="w-full mt-4"
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
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Getting Started CTA */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/care-guides')}>
              Browse Care Guides
            </Button>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
