import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { marketplaceService } from '@/services/marketplace.service';
import { paymentService } from '@/services/payment.service';

export const CartPage: React.FC = () => {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 0) {
      updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);

      // Create order
      const order = await marketplaceService.createOrder({
        userId: 'current-user', // This will be replaced with actual user ID
        type: 'product',
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        status: 'pending',
        payment: {
          method: 'card',
          status: 'pending',
        },
        total,
        currency: 'USD',
      });

      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(order);

      // Redirect to checkout page
      router.push(`/marketplace/checkout?orderId=${order.id}&paymentIntentId=${paymentIntent.id}`);
    } catch (error) {
      console.error('Error during checkout:', error);
      // Show error notification
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Browse our products and add items to your cart</p>
        <Button onClick={() => router.push('/marketplace')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-6 flex items-center">
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={item.images[0]?.url || '/images/placeholder-product.png'}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="ml-6 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency(item.price, 'USD')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-20 text-center"
                    />
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Subtotal: {formatCurrency(item.price * item.quantity, 'USD')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Total</p>
            <p>{formatCurrency(total, 'USD')}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Shipping and taxes will be calculated at checkout
          </p>

          <div className="mt-6 space-y-4">
            <Button
              onClick={handleCheckout}
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/marketplace')}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
