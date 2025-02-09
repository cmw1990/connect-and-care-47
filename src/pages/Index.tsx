import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Building2, ShoppingCart, Shield, Star, Users, Search, ArrowRight, ChartBar, Brain } from "lucide-react";
import { LocationMap } from "@/components/groups/LocationMap";
import { useToast } from "@/hooks/use-toast";
import { LocationSearch } from "@/components/landing/LocationSearch";
import { CareTypeSelector } from "@/components/landing/CareTypeSelector";
import { SubscriptionPlans } from "@/components/landing/SubscriptionPlans";
import { Region, GeoPoint } from "@/types/regions";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState({ latitude: 40, longitude: -95 });
  const [selectedCareType, setSelectedCareType] = useState<string>("");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);

  const fetchSearchResults = async (): Promise<Region[]> => {
    if (searchQuery.length < 2) return [];
    
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .in('type', [
        'country',
        'state',
        'province',
        'prefecture',
        'region',
        'department',
        'distrito',
        'city',
        'town',
        'village',
        'district',
        'municipality',
        'township',
        'ward'
      ])
      .order('name')
      .limit(10);
    
    if (error) throw new Error(error.message);
    return (data || []).map(region => ({
      ...region,
      state: region.state || null,
      coordinates: region.coordinates ? String(region.coordinates) : null
    }));
  };

  const { data: searchResults = [] } = useQuery({
    queryKey: ['regions', 'search', searchQuery],
    queryFn: fetchSearchResults,
    enabled: searchQuery.length >= 2,
    staleTime: 1 * 60 * 1000,
  });

  const handleLocationSelect = (type: string, value: string) => {
    if (type === 'country') {
      setSelectedCountry(value);
      setSelectedRegion('');
      setSelectedCity('');
      
      const country = searchResults.find(c => c.name === value);
      if (country?.coordinates) {
        try {
          const point = JSON.parse(country.coordinates) as GeoPoint;
          setMapCenter({
            latitude: point.coordinates[1],
            longitude: point.coordinates[0]
          });
        } catch (error) {
          console.error('Error parsing coordinates:', error);
        }
      }
    } else if (type === 'region') {
      setSelectedRegion(value);
      setSelectedCity('');
      
      const region = searchResults.find(r => r.name === value);
      if (region?.coordinates) {
        try {
          const point = JSON.parse(region.coordinates) as GeoPoint;
          setMapCenter({
            latitude: point.coordinates[1],
            longitude: point.coordinates[0]
          });
        } catch (error) {
          console.error('Error parsing coordinates:', error);
        }
      }
    } else if (type === 'city') {
      setSelectedCity(value);
      
      const city = searchResults.find(c => c.name === value);
      if (city?.coordinates) {
        try {
          const point = JSON.parse(city.coordinates) as GeoPoint;
          setMapCenter({
            latitude: point.coordinates[1],
            longitude: point.coordinates[0]
          });
        } catch (error) {
          console.error('Error parsing coordinates:', error);
        }
      }

      toast({
        title: "Location Selected",
        description: `Selected location: ${value}, ${selectedRegion}, ${selectedCountry}`,
      });
    }
  };

  const handleSearchSelect = (result: Region) => {
    if (result.type === 'country') {
      handleLocationSelect('country', result.name);
    } else if (['state', 'province', 'prefecture'].includes(result.type)) {
      setSelectedCountry(result.country);
      handleLocationSelect('region', result.name);
    } else if (['city', 'town', 'village', 'district', 'municipality', 'township', 'ward'].includes(result.type)) {
      setSelectedCountry(result.country);
      if (result.state) {
        setSelectedRegion(result.state);
        handleLocationSelect('city', result.name);
      }
    }
    setSearchOpen(false);
  };

  const handleCompareOptions = () => {
    if (!selectedCity || !selectedCareType) {
      toast({
        title: "Please complete your selection",
        description: "Both location and care type are required to proceed.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/compare?location=${selectedCity}&type=${selectedCareType}&analytics=${analyticsEnabled}&ai=${aiInsightsEnabled}`);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen"
      >
        <section className="relative bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
              >
                Smart Care Comparison Platform
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Compare care options with AI-powered insights and advanced analytics
              </motion.p>

              <Card className="p-6 shadow-lg mb-8 hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CareTypeSelector 
                    selectedCareType={selectedCareType}
                    onCareTypeChange={setSelectedCareType}
                  />

                  <LocationSearch 
                    searchOpen={searchOpen}
                    setSearchOpen={setSearchOpen}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchResults={searchResults}
                    handleSearchSelect={handleSearchSelect}
                    selectedCity={selectedCity}
                    selectedRegion={selectedRegion}
                    selectedCountry={selectedCountry}
                  />
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <ChartBar className="h-5 w-5 text-primary" />
                      <span className="text-sm">Advanced Analytics</span>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant={analyticsEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                        className="relative"
                      >
                        {analyticsEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span className="text-sm">AI Insights</span>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant={aiInsightsEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAiInsightsEnabled(!aiInsightsEnabled)}
                        className="relative"
                      >
                        {aiInsightsEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full group"
                    onClick={handleCompareOptions}
                    disabled={!selectedCity || !selectedCareType}
                  >
                    Compare Options
                    <Search className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>

              {selectedCountry && (
                <Card className="mb-8 overflow-hidden rounded-xl shadow-lg">
                  <LocationMap
                    latitude={mapCenter.latitude}
                    longitude={mapCenter.longitude}
                    zoom={selectedCity ? 12 : selectedRegion ? 8 : 4}
                    markers={searchResults?.filter(city => city.coordinates).map(city => {
                      try {
                        const coords = JSON.parse(city.coordinates!) as GeoPoint;
                        return {
                          lat: coords.coordinates[1],
                          lng: coords.coordinates[0],
                          title: city.name
                        };
                      } catch (error) {
                        console.error('Error parsing city coordinates:', error);
                        return null;
                      }
                    }).filter(Boolean) || []}
                  />
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-primary/5"
                    onClick={() => navigate('/caregivers')}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Heart className="h-10 w-10 text-primary" />
                      <h3 className="text-xl font-semibold">Find Caregivers</h3>
                      <p className="text-muted-foreground">Connect with qualified, background-checked caregivers</p>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-primary/5"
                    onClick={() => navigate('/facilities')}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Building2 className="h-10 w-10 text-primary" />
                      <h3 className="text-xl font-semibold">Compare Facilities</h3>
                      <p className="text-muted-foreground">Find and compare top-rated care facilities</p>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-primary/5"
                    onClick={() => navigate('/compare')}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <ShoppingCart className="h-10 w-10 text-primary" />
                      <h3 className="text-xl font-semibold">Care Products</h3>
                      <p className="text-muted-foreground">Browse and compare essential care products</p>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <ChartBar className="h-12 w-12 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Advanced Analytics & AI Insights</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Make informed decisions with our comprehensive analytics and AI-powered recommendations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                  <Brain className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered insights to help you make the best choice
                  </p>
                </Card>
                <Card className="p-6">
                  <ChartBar className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Quality Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    Compare detailed quality and performance metrics
                  </p>
                </Card>
                <Card className="p-6">
                  <Shield className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Verified Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Trust our verified and up-to-date information
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Users className="h-12 w-12 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Care Team Collaboration Platform</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Looking to coordinate care with your team? Try our Care Team Platform to streamline communication and care management.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/groups')}
                  className="gap-2 group"
                >
                  Explore Care Team Platform
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        <SubscriptionPlans />
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
