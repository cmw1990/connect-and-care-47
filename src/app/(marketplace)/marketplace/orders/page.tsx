import React from 'react';
import { Metadata } from 'next';
import { OrdersPage } from '@/components/marketplace/OrdersPage';

export const metadata: Metadata = {
  title: 'My Orders - Care Companion',
  description: 'View and manage your orders',
};

export default function Orders() {
  return (
    <div className="container mx-auto px-4 py-8">
      <OrdersPage />
    </div>
  );
}
