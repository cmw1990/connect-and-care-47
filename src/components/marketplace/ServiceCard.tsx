import React from 'react';
import { Service } from '@/services/marketplace.service';
import { formatCurrency } from '@/utils/format';
import { StarIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{service.name}</h3>
          <div className="text-right">
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(service.pricing.amount, 'USD')}
            </span>
            <span className="text-sm text-gray-500 block">
              per {service.pricing.unit}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{service.description}</p>
        
        {service.availability && (
          <div className="space-y-2 mb-4">
            {service.availability.locations?.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="line-clamp-1">
                  {service.availability.locations.join(', ')}
                </span>
              </div>
            )}
            
            {service.availability.schedule?.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="line-clamp-1">
                  Available: {service.availability.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
        
        {service.features?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              {service.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-sm text-gray-600">
              {service.rating?.toFixed(1) || 'N/A'} 
              {service.reviewCount ? ` (${service.reviewCount})` : ''}
            </span>
          </div>
          
          {service.status === 'active' && onBook && (
            <button
              onClick={() => onBook(service)}
              className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
