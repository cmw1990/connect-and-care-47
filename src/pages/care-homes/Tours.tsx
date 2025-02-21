import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function CareHomeTours() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('careHomes.tours.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('careHomes.tours.upcomingTours')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sunrise Senior Living</h3>
                <Button variant="outline" size="sm">
                  {t('common.reschedule')}
                </Button>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span>March 15, 2025</span>
                <Clock className="w-4 h-4 mx-2" />
                <span>2:00 PM</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>123 Care Street, San Francisco, CA 94105</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('careHomes.tours.scheduleTour')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('careHomes.tours.scheduleTourDescription')}
            </p>
            <Button className="w-full">
              {t('careHomes.tours.findAndSchedule')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
