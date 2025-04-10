
import React from 'react';
import { OrderDetailsPage } from '@/components/marketplace/OrderDetailsPage';

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
