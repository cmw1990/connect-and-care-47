import React from 'react';
import { marketplaceService } from '@/services/marketplace.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { PencilIcon, EyeIcon } from '@heroicons/react/24/outline';

export const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedSubscription, setSelectedSubscription] = React.useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  React.useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const result = await marketplaceService.getSubscriptions();
      setSubscriptions(result);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubscription = async (subscriptionData: any) => {
    try {
      await marketplaceService.updateSubscription(
        selectedSubscription.id,
        subscriptionData
      );
      toast.success('Subscription updated successfully');
      loadSubscriptions();
      setShowEditDialog(false);
      setSelectedSubscription(null);
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await marketplaceService.cancelSubscription(subscriptionId);
      toast.success('Subscription cancelled successfully');
      loadSubscriptions();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const filteredSubscriptions = React.useMemo(() => {
    return subscriptions.filter((subscription) => {
      const matchesSearch =
        subscription.customer.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        subscription.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || subscription.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      canceled: 'bg-red-100 text-red-800',
      incomplete: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const SubscriptionDetails: React.FC<{ subscription: any }> = ({
    subscription,
  }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Customer Info</h3>
          <div className="mt-2 space-y-2">
            <p>Name: {subscription.customer.name}</p>
            <p>Email: {subscription.customer.email}</p>
            <p>Customer Since: {new Date(subscription.customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">
            Subscription Details
          </h3>
          <div className="mt-2 space-y-2">
            <p>Plan: {subscription.plan.name}</p>
            <p>Price: ${subscription.plan.price}/month</p>
            <p>Started: {new Date(subscription.startDate).toLocaleDateString()}</p>
            {subscription.endDate && (
              <p>Ends: {new Date(subscription.endDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Billing History</h3>
        <div className="mt-2">
          <Table
            columns={[
              { header: 'Date', accessor: 'date' },
              { header: 'Amount', accessor: 'amount' },
              { header: 'Status', accessor: 'status' },
            ]}
            data={subscription.billingHistory}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Usage Statistics</h3>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-semibold">
              {subscription.usage.totalServices}
            </p>
            <p className="text-sm text-gray-500">Total Services Used</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-semibold">
              ${subscription.usage.totalSpent}
            </p>
            <p className="text-sm text-gray-500">Total Amount Spent</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-semibold">
              {subscription.usage.activeServices}
            </p>
            <p className="text-sm text-gray-500">Active Services</p>
          </div>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.customer.name}</p>
          <p className="text-sm text-gray-500">{row.customer.email}</p>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: 'plan',
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.plan.name}</p>
          <p className="text-sm text-gray-500">
            ${row.plan.price}/month
          </p>
        </div>
      ),
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      cell: (row: any) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: any) => (
        <Badge className={getStatusBadgeColor(row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Next Billing',
      accessor: 'nextBillingDate',
      cell: (row: any) =>
        row.status === 'canceled'
          ? '-'
          : new Date(row.nextBillingDate).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedSubscription(row);
              setShowDetailsDialog(true);
            }}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedSubscription(row);
              setShowEditDialog(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {row.status !== 'canceled' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleCancelSubscription(row.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4 flex-1">
          <Input
            type="search"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="max-w-xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="incomplete">Incomplete</option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredSubscriptions}
        isLoading={isLoading}
      />

      <Dialog
        open={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedSubscription(null);
        }}
        title="Subscription Details"
      >
        {selectedSubscription && (
          <SubscriptionDetails subscription={selectedSubscription} />
        )}
      </Dialog>

      <Dialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedSubscription(null);
        }}
        title="Edit Subscription"
      >
        {selectedSubscription && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateSubscription({
                planId: formData.get('planId'),
                status: formData.get('status'),
                billingCycle: formData.get('billingCycle'),
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plan
              </label>
              <Select
                name="planId"
                defaultValue={selectedSubscription.plan.id}
                className="mt-1"
              >
                <option value="basic">Basic Plan</option>
                <option value="premium">Premium Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <Select
                name="status"
                defaultValue={selectedSubscription.status}
                className="mt-1"
              >
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="incomplete">Incomplete</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Billing Cycle
              </label>
              <Select
                name="billingCycle"
                defaultValue={selectedSubscription.billingCycle}
                className="mt-1"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedSubscription(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Subscription</Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
};
