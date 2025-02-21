import React from 'react';
import { Metadata } from 'next';
import { MarketplaceAdminDashboard } from '@/components/marketplace/admin/MarketplaceAdminDashboard';

export const metadata: Metadata = {
  title: 'Marketplace Admin - Care Companion',
  description: 'Manage marketplace products and services',
};

export default function MarketplaceAdmin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MarketplaceAdminDashboard />
    </div>
  );
}
