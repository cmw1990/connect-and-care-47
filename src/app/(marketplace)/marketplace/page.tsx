import React from 'react';
import { Metadata } from 'next';
import { MarketplaceDashboard } from '@/components/marketplace/MarketplaceDashboard';

export const metadata: Metadata = {
  title: 'Marketplace - Care Companion',
  description: 'Browse and purchase healthcare products and services',
};

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MarketplaceDashboard />
    </div>
  );
}
