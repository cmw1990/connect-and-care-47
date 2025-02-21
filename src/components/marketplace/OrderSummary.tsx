import React from 'react';
import { Order } from '@/services/marketplace.service';
import { formatCurrency, formatDate } from '@/utils/format';
import { TruckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface OrderSummaryProps {
  order: Order;
  showActions?: boolean;
  onCancelOrder?: (orderId: string) => void;
}

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  showActions = true,
  onCancelOrder,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <span className="font-medium text-gray-900">
                {formatCurrency(item.price * item.quantity, order.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>

          {order.shipping && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(order.shipping.cost || 0, order.currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary-600">
              {formatCurrency(
                order.total + (order.shipping?.cost || 0),
                order.currency
              )}
            </span>
          </div>
        </div>

        {order.shipping && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Shipping Details</h4>
            <p className="text-gray-600">{order.shipping.address}</p>
            {order.shipping.tracking && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <TruckIcon className="h-5 w-5 mr-2 text-gray-400" />
                Tracking: {order.shipping.tracking}
              </div>
            )}
            {order.shipping.estimatedDelivery && (
              <p className="mt-1 text-sm text-gray-600">
                Estimated delivery: {formatDate(order.shipping.estimatedDelivery)}
              </p>
            )}
          </div>
        )}

        {showActions && order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Print Receipt
            </button>
            {order.status === 'pending' && onCancelOrder && (
              <button
                onClick={() => onCancelOrder(order.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
