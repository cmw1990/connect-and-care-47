
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Star, Shield, Heart, Building2, ShoppingCart, Users, ArrowRight, Loader2 } from "lucide-react";
import { LocationMap } from "@/components/groups/LocationMap";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface Coordinates {
  type: string;
  coordinates: [number, number];
}

interface Region {
  id: number;
  name: string;
  type: string;
  country: string;
  state?: string | null;
  continent: string | null;
  coordinates: string | null;
  created_at: string;
  parent_id: number | null;
  population: number | null;
}

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

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery<Region[], Error>({
    queryKey: ['regions', 'countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('type', 'country')
        .or('continent.eq.Asia,continent.eq.South America,continent.eq.North America,continent.eq.Central America')
        .order('name');
      if (error) throw error;
      return data as Region[];
    }
  });

  const { data: regions = [], isLoading: isLoadingRegions } = useQuery<Region[], Error>({
    queryKey: ['regions', selectedCountry],
    queryFn: async () => {
      if (!selectedCountry) return [];
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('country', selectedCountry)
        .in('type', ['state', 'province', 'prefecture', 'region', 'department', 'distrito'])
        .order('name');
      if (error) throw error;
      return data as Region[];
    },
    enabled: !!selectedCountry
  });

  const { data: cities = [], isLoading: isLoadingCities } = useQuery<Region[], Error>({
    queryKey: ['regions', selectedCountry, selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return [];
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('type', 'city')
        .eq('country', selectedCountry)
        .eq('state', selectedRegion)
        .order('name');
      if (error) throw error;
      return data as Region[];
    },
    enabled: !!selectedRegion
  });

  const { data: searchResults = [] } = useQuery<Region[], Error>({
    queryKey: ['regions', 'search', searchQuery],
    queryFn: async () => {
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
      if (error) throw error;
      return data as Region[];
    },
    enabled: searchQuery.length >= 2
  });

  const careTypes = [
    { value: "senior", label: "Senior Care", icon: Heart },
    { value: "child", label: "Child Care", icon: Baby },
    { value: "special", label: "Special Needs Care", icon: Brain },
    { value: "respite", label: "Respite Care", icon: Users },
  ];

  const handleLocationSelect = (type: string, value: string) => {
    if (type === 'country') {
      setSelectedCountry(value);
      setSelectedRegion('');
      setSelectedCity('');
      
      const country = countries.find(c => c.name === value);
      if (country?.coordinates) {
        try {
          const point = JSON.parse(country.coordinates) as Coordinates;
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
      
      const region = regions.find(r => r.name === value);
      if (region?.coordinates) {
        try {
          const point = JSON.parse(region.coordinates) as Coordinates;
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
      
      const city = cities.find(c => c.name === value);
      if (city?.coordinates) {
        try {
          const point = JSON.parse(city.coordinates) as Coordinates;
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

  const handleFindCare = () => {
    if (!selectedCity || !selectedCareType) {
      toast({
        title: "Please complete your selection",
        description: "Both location and care type are required to proceed.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/caregivers?location=${selectedCity}&type=${selectedCareType}`);
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

              <Card className="p-6 shadow-lg mb-8 hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={selectedCareType} onValueChange={setSelectedCareType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type of Care" />
                    </SelectTrigger>
                    <SelectContent>
                      {careTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal hover:bg-primary/5"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {selectedCity || selectedRegion || selectedCountry || "Search location..."}
                    </Button>

                    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
                      <CommandInput 
                        placeholder="Search locations..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {searchResults.length > 0 && (
                          <CommandGroup heading="Locations">
                            {searchResults.map((result) => (
                              <CommandItem
                                key={result.id}
                                value={result.name}
                                onSelect={() => handleSearchSelect(result)}
                                className="flex items-center gap-2 cursor-pointer hover:bg-primary/5"
                              >
                                <MapPin className="h-4 w-4 text-primary" />
                                <div>
                                  <div>{result.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {result.type}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </CommandDialog>
                  </div>
                </div>

                <div className="mt-4">
                  <Button 
                    size="lg" 
                    className="w-full group"
                    onClick={handleFindCare}
                    disabled={!selectedCity || !selectedCareType}
                  >
                    Find Care
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
                    markers={cities?.filter(city => city.coordinates).map(city => {
                      try {
                        const coords = JSON.parse(city.coordinates!) as Coordinates;
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

        <section className="py-16 bg-gradient-to-b from-gray-50 to-background dark:from-gray-900/50 dark:to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-center">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Verified Caregivers</h3>
                    <p className="text-muted-foreground">Background-checked and certified professionals</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-center">
                    <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Top-Rated Care</h3>
                    <p className="text-muted-foreground">Read reviews from verified clients</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-center">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Perfect Matches</h3>
                    <p className="text-muted-foreground">Find care that fits your needs</p>
                  </div>
                </motion.div>
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
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
