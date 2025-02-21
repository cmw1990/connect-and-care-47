import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search as SearchIcon, MapPin, Filter } from 'lucide-react';

export default function CareHomeSearch() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('careHomes.search.title')}</h1>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          {t('common.filter')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('careHomes.search.findPerfectHome')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('careHomes.search.searchPlaceholder')}
                className="w-full"
                icon={<SearchIcon className="w-4 h-4" />}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder={t('careHomes.search.locationPlaceholder')}
                className="w-full"
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" className="px-8">
              {t('common.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Care Home Cards will be populated here */}
      </div>
    </div>
  );
}
