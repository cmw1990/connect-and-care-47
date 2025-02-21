import React from 'react';
import { Metadata } from 'next';
import { CartPage } from '@/components/marketplace/CartPage';

export const metadata: Metadata = {
  title: 'Shopping Cart - Care Companion',
  description: 'Review and checkout your selected items',
};

export default function Cart() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CartPage />
    </div>
  );
}
