import React from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/services/marketplace.service';
import { OrderSummary } from './OrderSummary';
import { marketplaceService } from '@/services/marketplace.service';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

export const OrdersPage: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        const result = await marketplaceService.getUserOrders();
        setOrders(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = React.useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  }, [orders, filter]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await marketplaceService.updateOrderStatus(orderId, 'cancelled');
      // Refresh orders
      const updatedOrders = await marketplaceService.getUserOrders();
      setOrders(updatedOrders);
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No Orders Yet
        </h2>
        <p className="text-gray-500 mb-8">
          Start shopping to create your first order
        </p>
        <Button onClick={() => router.push('/marketplace')}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="flex items-center space-x-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Button
            variant="outline"
            onClick={() => router.push('/marketplace')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => router.push(`/marketplace/orders/${order.id}`)}
          >
            <OrderSummary
              order={order}
              showActions={true}
              onCancelOrder={(e) => {
                e.stopPropagation();
                handleCancelOrder(order.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
