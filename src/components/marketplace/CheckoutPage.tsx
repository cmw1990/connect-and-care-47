import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from './PaymentForm';
import { OrderSummary } from './OrderSummary';
import { marketplaceService } from '@/services/marketplace.service';
import { paymentService } from '@/services/payment.service';
import { useCart } from '@/hooks/useCart';
import { Spinner } from '@/components/ui/Spinner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const [order, setOrder] = React.useState<any>(null);
  const [clientSecret, setClientSecret] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!orderId || !paymentIntentId) {
      router.push('/marketplace/cart');
      return;
    }

    const loadCheckoutData = async () => {
      try {
        // Fetch order details
        const orderDetails = await marketplaceService.getOrder(orderId);
        setOrder(orderDetails);

        // Get payment intent client secret
        const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);
        setClientSecret(paymentIntent.clientSecret);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckoutData();
  }, [router, searchParams]);

  const handlePaymentSuccess = async () => {
    try {
      // Update order status
      await marketplaceService.updateOrderStatus(order.id, 'confirmed');
      
      // Clear cart
      clearCart();

      // Redirect to success page
      router.push(`/marketplace/orders/${order.id}?status=success`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePaymentError = (error: Error) => {
    setError(error.message);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => router.push('/marketplace/cart')}
          className="text-primary-600 hover:text-primary-700"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  if (!order || !clientSecret) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="order-2 lg:order-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Payment Information
            </h2>
            
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0F766E',
                    colorBackground: '#ffffff',
                    colorText: '#1f2937',
                  },
                },
              }}
            >
              <PaymentForm
                order={order}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow-lg sticky top-6">
            <OrderSummary
              order={order}
              showActions={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
