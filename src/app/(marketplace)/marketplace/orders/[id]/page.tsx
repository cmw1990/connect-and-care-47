import React from 'react';
import { Metadata } from 'next';
import { OrderDetailsPage } from '@/components/marketplace/OrderDetailsPage';

export const metadata: Metadata = {
  title: 'Order Details - Care Companion',
  description: 'View your order details and status',
};

interface OrderDetailsProps {
  params: {
    id: string;
  };
}

export default function OrderDetails({ params }: OrderDetailsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetailsPage orderId={params.id} />
    </div>
  );
}
