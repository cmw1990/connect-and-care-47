import React from 'react';
import { Service } from '@/services/marketplace.service';
import { ServiceCard } from './ServiceCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface ServiceListProps {
  services: Service[];
  isLoading: boolean;
  onServiceClick: (id: string) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  isLoading,
  onServiceClick,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="space-y-2">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-6 w-20 rounded-full" />
                ))}
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No services found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <div
          key={service.id}
          className="group cursor-pointer"
          onClick={() => onServiceClick(service.id)}
        >
          <ServiceCard
            service={service}
            onBook={(e) => {
              e.stopPropagation();
              onServiceClick(service.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};
