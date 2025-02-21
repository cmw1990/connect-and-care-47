import React from 'react';
import { Tab } from '@headlessui/react';
import { ProductManagement } from './ProductManagement';
import { ServiceManagement } from './ServiceManagement';
import { OrderManagement } from './OrderManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export const MarketplaceAdminDashboard: React.FC = () => {
  const tabs = [
    { name: 'Products', component: ProductManagement },
    { name: 'Services', component: ServiceManagement },
    { name: 'Orders', component: OrderManagement },
    { name: 'Analytics', component: AnalyticsDashboard },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Marketplace Management
        </h1>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                ${
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-6">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className="rounded-xl bg-white p-6 shadow-lg ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            >
              <tab.component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
