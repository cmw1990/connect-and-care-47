
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users, Building, ShoppingCart, Heart, Search, MapPin, Shield, Clock, Star, CheckCircle } from "lucide-react";
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
        className="min-h-screen"
      >
        {/* Enhanced Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 via-background to-background py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                Your Complete Care Solution
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Find caregivers, compare care facilities, or collaborate with your care team - all in one platform.
              </motion.p>
              
              {/* Search Section */}
              <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Enter your location" 
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="What type of care?" 
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => navigate('/caregivers')}
                  >
                    Find Care <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/compare')}
                  className="bg-white hover:bg-gray-50"
                >
                  <Building className="mr-2 h-5 w-5" />
                  Compare Care Facilities
                </Button>
                <Button 
                  variant="outline"
                  size="lg" 
                  onClick={() => navigate('/products')}
                  className="bg-white hover:bg-gray-50"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Care Products
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/groups')}
                  className="bg-white hover:bg-gray-50"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Care Team Collaboration
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-lg text-muted-foreground">Join thousands of families who trust us with their care needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Verified Caregivers", description: "Background checked & certified" },
                { icon: Clock, title: "24/7 Support", description: "Always here when you need us" },
                { icon: Star, title: "Quality Care", description: "Highest rated care platform" },
                { icon: Heart, title: "Personalized Matching", description: "Find your perfect care match" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Care Solutions</h2>
              <p className="text-lg text-muted-foreground">Everything you need in one place</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {landingSections?.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {section.content.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-6"
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of families who trust us with their care needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
                  Sign Up Now
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/compare')} className="text-lg px-8">
                  Compare Care Options
                </Button>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
