import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { OrderSummary } from './OrderSummary';
import { marketplaceService } from '@/services/marketplace.service';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

interface OrderDetailsPageProps {
  orderId: string;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderDetails = await marketplaceService.getOrder(orderId);
        setOrder(orderDetails);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      await marketplaceService.updateOrderStatus(orderId, 'cancelled');
      // Refresh order details
      const updatedOrder = await marketplaceService.getOrder(orderId);
      setOrder(updatedOrder);
    } catch (err: any) {
      setError(err.message);
    }
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
        <Button onClick={() => router.push('/marketplace')}>
          Return to Marketplace
        </Button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {searchParams.get('status') === 'success' && (
        <div className="mb-8 p-4 bg-green-50 rounded-lg flex items-center">
          <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
          <div>
            <h2 className="text-lg font-medium text-green-800">
              Payment Successful
            </h2>
            <p className="text-sm text-green-600">
              Thank you for your order! We'll send you a confirmation email shortly.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Order Details
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push('/marketplace/orders')}
        >
          Back to Orders
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <OrderSummary
          order={order}
          showActions={true}
          onCancelOrder={handleCancelOrder}
        />
      </div>

      {order.type === 'product' && order.status === 'confirmed' && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Need Help?
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/support/new?orderId=' + orderId)}
              >
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/returns/new?orderId=' + orderId)}
              >
                Start a Return
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
