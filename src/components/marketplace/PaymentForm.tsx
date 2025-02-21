import React from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Order } from '@/services/marketplace.service';

interface PaymentFormProps {
  order: Order;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  order,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/marketplace/orders/${order.id}?status=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'Something went wrong');
        onError(error);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong');
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: {
            billingDetails: 'auto',
          },
        }}
      />

      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{message}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? 'Processing...' : `Pay ${order.total} ${order.currency}`}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        Your payment is secure and encrypted
      </p>
    </form>
  );
};
