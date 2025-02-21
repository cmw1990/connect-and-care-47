import React from 'react';
import { useRouter } from 'next/navigation';
import { marketplaceService } from '@/services/marketplace.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export const OrderManagement: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = React.useState(false);

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const result = await marketplaceService.getAllOrders();
      setOrders(result);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (status: string) => {
    if (!selectedOrder) return;

    try {
      await marketplaceService.updateOrderStatus(selectedOrder.id, status);
      toast.success('Order status updated successfully');
      loadOrders();
      setShowStatusDialog(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { header: 'Order ID', accessor: 'id' },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row: any) => row.customer.name,
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row: any) => (
        <Badge variant={row.type === 'product' ? 'default' : 'secondary'}>
          {row.type}
        </Badge>
      ),
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
    { header: 'Total', accessor: 'total' },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedOrder(row);
              setShowStatusDialog(true);
            }}
          >
            Update Status
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/marketplace/orders/${row.id}`)}
          >
            View Details
          </Button>
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
            placeholder="Search orders..."
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
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredOrders}
        isLoading={isLoading}
      />

      <Dialog
        open={showStatusDialog}
        onClose={() => {
          setShowStatusDialog(false);
          setSelectedOrder(null);
        }}
        title="Update Order Status"
      >
        <div className="space-y-4">
          <Select
            className="w-full"
            defaultValue={selectedOrder?.status}
            onChange={(e) => handleUpdateOrderStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog(false);
                setSelectedOrder(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
