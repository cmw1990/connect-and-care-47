import React from 'react';
import { Metadata } from 'next';
import { CheckoutPage } from '@/components/marketplace/CheckoutPage';

export const metadata: Metadata = {
  title: 'Checkout - Care Companion',
  description: 'Complete your purchase securely',
};

export default function Checkout() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutPage />
    </div>
  );
}
