
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Star, Shield, Heart, Building2, ShoppingCart, Users, ArrowRight } from "lucide-react";
import { LocationMap } from "@/components/groups/LocationMap";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [mapCenter, setMapCenter] = useState({ latitude: 40, longitude: -95 });

  const { data: countries } = useQuery({
    queryKey: ['regions', 'countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('type', 'country');
      if (error) throw error;
      return data;
    }
  });

  const { data: regions } = useQuery({
    queryKey: ['regions', selectedCountry],
    queryFn: async () => {
      if (!selectedCountry) return [];
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('country', selectedCountry)
        .in('type', ['state', 'province']);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCountry
  });

  const { data: cities } = useQuery({
    queryKey: ['regions', selectedCountry, selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return [];
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('type', 'city')
        .eq('country', selectedCountry);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRegion
  });

  const careTypes = [
    { value: "senior", label: "Senior Care" },
    { value: "child", label: "Child Care" },
    { value: "special", label: "Special Needs Care" },
    { value: "respite", label: "Respite Care" },
  ];

  const handleLocationSelect = (type: string, value: string) => {
    if (type === 'country') {
      setSelectedCountry(value);
      setSelectedRegion('');
      setSelectedCity('');
    } else if (type === 'region') {
      setSelectedRegion(value);
      setSelectedCity('');
    } else if (type === 'city') {
      setSelectedCity(value);
      toast({
        title: "Location Selected",
        description: `Selected location: ${value}, ${selectedRegion}, ${selectedCountry}`,
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen"
      >
        {/* Hero Section with Search */}
        <section className="relative bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                Find Your Perfect Care Match
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Compare caregivers, facilities, and care products all in one place
              </motion.p>

              {/* Main Search Bar */}
              <Card className="p-6 shadow-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type of Care" />
                    </SelectTrigger>
                    <SelectContent>
                      {careTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => handleLocationSelect('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country.id} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedRegion}
                    onValueChange={(value) => handleLocationSelect('region', value)}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions?.map((region) => (
                        <SelectItem key={region.id} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedCity}
                    onValueChange={(value) => handleLocationSelect('city', value)}
                    disabled={!selectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => navigate('/caregivers')}
                  >
                    Find Care <Search className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Map Display */}
              {selectedCountry && (
                <Card className="mb-8">
                  <LocationMap
                    latitude={mapCenter.latitude}
                    longitude={mapCenter.longitude}
                    zoom={4}
                    markers={[]}
                  />
                </Card>
              )}

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate('/caregivers')}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Heart className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-semibold">Find Caregivers</h3>
                    <p className="text-muted-foreground">Connect with qualified, background-checked caregivers</p>
                  </div>
                </Card>

                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate('/facilities')}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Building2 className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-semibold">Compare Facilities</h3>
                    <p className="text-muted-foreground">Find and compare top-rated care facilities</p>
                  </div>
                </Card>

                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate('/compare')}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <ShoppingCart className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-semibold">Care Products</h3>
                    <p className="text-muted-foreground">Browse and compare essential care products</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Verified Caregivers</h3>
                  <p className="text-muted-foreground">Background-checked and certified professionals</p>
                </div>
                <div className="text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Top-Rated Care</h3>
                  <p className="text-muted-foreground">Read reviews from verified clients</p>
                </div>
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Perfect Matches</h3>
                  <p className="text-muted-foreground">Find care that fits your needs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Care Team Platform CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Users className="h-12 w-12 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Care Team Collaboration Platform</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Looking to coordinate care with your team? Try our Care Team Platform to streamline communication and care management.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/groups')}
                className="gap-2"
              >
                Explore Care Team Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
