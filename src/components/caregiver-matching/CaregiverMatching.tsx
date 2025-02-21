import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heart, Shield, Star, Clock, MapPin, Languages, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Define the caregiver profile schema
const caregiverSchema = z.object({
  careType: z.array(z.enum(['senior', 'disability', 'child', 'postpartum', 'respite'])),
  experience: z.number().min(0),
  languages: z.array(z.string()),
  availability: z.array(z.enum(['morning', 'afternoon', 'evening', 'overnight', 'weekend'])),
  transportation: z.boolean(),
  certifications: z.array(z.string()),
  hourlyRate: z.number().min(0),
  location: z.string(),
  radius: z.number().min(0).max(100),
});

interface Caregiver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviews: number;
  verified: boolean;
  profile: z.infer<typeof caregiverSchema>;
  bio: string;
}

export const CaregiverMatching = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [caregivers, setCaregivers] = React.useState<Caregiver[]>([]);
  const [filters, setFilters] = React.useState<Partial<z.infer<typeof caregiverSchema>>>({});
  const [showFilters, setShowFilters] = React.useState(false);

  const form = useForm<z.infer<typeof caregiverSchema>>({
    resolver: zodResolver(caregiverSchema),
    defaultValues: {
      careType: [],
      experience: 0,
      languages: [],
      availability: [],
      transportation: false,
      certifications: [],
      hourlyRate: 0,
      location: '',
      radius: 10,
    },
  });

  const onSubmit = (values: z.infer<typeof caregiverSchema>) => {
    setFilters(values);
    setShowFilters(false);
    // In a real app, this would trigger an API call to fetch matching caregivers
    toast({
      title: t('caregiverMatching.filtersApplied'),
      description: t('caregiverMatching.searchingCaregivers'),
    });
  };

  // Mock data for demonstration
  React.useEffect(() => {
    setCaregivers([
      {
        id: '1',
        name: 'Sarah Johnson',
        photo: '/avatars/sarah.jpg',
        rating: 4.8,
        reviews: 127,
        verified: true,
        profile: {
          careType: ['senior', 'disability'],
          experience: 5,
          languages: ['english', 'spanish'],
          availability: ['morning', 'afternoon'],
          transportation: true,
          certifications: ['CPR', 'First Aid'],
          hourlyRate: 25,
          location: 'San Francisco, CA',
          radius: 15,
        },
        bio: 'Compassionate caregiver with 5+ years of experience in senior and disability care.',
      },
      // Add more mock caregivers here
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('caregiverMatching.title')}</CardTitle>
          <CardDescription>{t('caregiverMatching.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  {t('caregiverMatching.filters')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('caregiverMatching.filterOptions')}</DialogTitle>
                  <DialogDescription>
                    {t('caregiverMatching.filterDescription')}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="careType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('caregiverMatching.careType')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value[0]}
                              onValueChange={(value) => field.onChange([value])}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="senior">{t('careType.senior')}</SelectItem>
                                <SelectItem value="disability">{t('careType.disability')}</SelectItem>
                                <SelectItem value="child">{t('careType.child')}</SelectItem>
                                <SelectItem value="postpartum">{t('careType.postpartum')}</SelectItem>
                                <SelectItem value="respite">{t('careType.respite')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            {t('caregiverMatching.careTypeDescription')}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('caregiverMatching.location')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t('caregiverMatching.locationDescription')}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="radius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('caregiverMatching.radius')}</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              max={100}
                              step={1}
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value} {t('caregiverMatching.miles')}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <Button type="submit">{t('caregiverMatching.applyFilters')}</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((caregiver) => (
              <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={caregiver.photo}
                        alt={caregiver.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      {caregiver.verified && (
                        <Shield className="absolute -bottom-1 -right-1 h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{caregiver.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{caregiver.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{caregiver.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {caregiver.profile.certifications.map((cert) => (
                          <span
                            key={cert}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-4 mt-4">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          {t('caregiverMatching.save')}
                        </Button>
                        <Button size="sm">
                          {t('caregiverMatching.contact')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
