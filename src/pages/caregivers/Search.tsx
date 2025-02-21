import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { caregiverService } from '@/services/caregiver.service';
import { CaregiverProfile } from '@/types/caregiver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search as SearchIcon, MapPin, Filter, Star, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CaregiverSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSpecialties();
    searchCaregivers();
  }, []);

  const loadSpecialties = async () => {
    try {
      const specialties = await caregiverService.getSpecialties();
      setAvailableSpecialties(specialties);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('caregivers.search.errorLoadingSpecialties'),
        variant: 'destructive',
      });
    }
  };

  const searchCaregivers = async () => {
    try {
      setIsLoading(true);
      const { data, count } = await caregiverService.searchCaregivers({
        query: searchQuery,
        location,
        specialties,
        page,
        limit: 10,
      });
      setCaregivers(data);
      setTotalCount(count);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('caregivers.search.errorSearching'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCaregivers();
  };

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('caregivers.search.title')}</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('common.filter')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('caregivers.search.findCaregiver')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('caregivers.search.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  icon={<SearchIcon className="w-4 h-4" />}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder={t('caregivers.search.locationPlaceholder')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('common.searching') : t('common.search')}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">{t('caregivers.search.specialties')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableSpecialties.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={specialties.includes(specialty)}
                        onCheckedChange={() => toggleSpecialty(specialty)}
                      />
                      <label htmlFor={specialty} className="text-sm">
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caregivers.map((caregiver) => (
          <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <img
                  src={caregiver.imageUrl}
                  alt={caregiver.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{caregiver.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{caregiver.location}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{caregiver.rating}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({caregiver.reviewCount} {t('common.reviews')})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {caregiver.bio}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {caregiver.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
                {caregiver.specialties.length > 3 && (
                  <Badge variant="secondary">
                    +{caregiver.specialties.length - 3}
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{t('caregivers.search.lastActive', { time: caregiver.lastActive })}</span>
                </div>
                <Button
                  onClick={() => navigate(`/caregivers/${caregiver.id}`)}
                  variant="secondary"
                >
                  {t('common.viewProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {caregivers.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 0 || isLoading}
            onClick={() => {
              setPage(p => p - 1);
              searchCaregivers();
            }}
          >
            {t('common.previous')}
          </Button>
          <Button
            variant="outline"
            disabled={(page + 1) * 10 >= totalCount || isLoading}
            onClick={() => {
              setPage(p => p + 1);
              searchCaregivers();
            }}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {caregivers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {t('caregivers.search.noResults')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
