import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { marketplaceService } from '@/services/marketplace.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { ProviderForm } from './ProviderForm';

export const ProviderManagement: React.FC = () => {
  const router = useRouter();
  const [providers, setProviders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [showProviderForm, setShowProviderForm] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);

  React.useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const result = await marketplaceService.getProviders();
      setProviders(result);
    } catch (error) {
      toast.error('Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProvider = async (providerData: any) => {
    try {
      await marketplaceService.createProvider(providerData);
      toast.success('Provider created successfully');
      loadProviders();
      setShowProviderForm(false);
    } catch (error) {
      toast.error('Failed to create provider');
    }
  };

  const handleUpdateProvider = async (providerData: any) => {
    try {
      await marketplaceService.updateProvider(selectedProvider.id, providerData);
      toast.success('Provider updated successfully');
      loadProviders();
      setShowProviderForm(false);
      setSelectedProvider(null);
    } catch (error) {
      toast.error('Failed to update provider');
    }
  };

  const handleUpdateProviderStatus = async (providerId: string, status: string) => {
    try {
      await marketplaceService.updateProviderStatus(providerId, status);
      toast.success('Provider status updated successfully');
      loadProviders();
    } catch (error) {
      toast.error('Failed to update provider status');
    }
  };

  const filteredProviders = React.useMemo(() => {
    return providers.filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || provider.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [providers, searchQuery, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const ProviderDetails: React.FC<{ provider: any }> = ({ provider }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact Info</h3>
          <div className="mt-2 space-y-2">
            <p>Email: {provider.email}</p>
            <p>Phone: {provider.phone}</p>
            <p>Address: {provider.address}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Business Details</h3>
          <div className="mt-2 space-y-2">
            <p>Business Name: {provider.businessName}</p>
            <p>Tax ID: {provider.taxId}</p>
            <p>Registration Date: {new Date(provider.registrationDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Services</h3>
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-4">
            {provider.services.map((service: any) => (
              <div
                key={service.id}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <h4 className="font-medium">{service.name}</h4>
                <p className="text-sm text-gray-500">{service.category}</p>
                <p className="text-sm">Price: ${service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Qualifications</h3>
        <div className="mt-2">
          <div className="space-y-2">
            {provider.qualifications.map((qual: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{qual.name}</p>
                  <p className="text-sm text-gray-500">
                    Issued by: {qual.issuedBy}
                  </p>
                </div>
                <p className="text-sm">
                  Expires: {new Date(qual.expiryDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Performance Metrics</h3>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-semibold">{provider.metrics.rating}</p>
            <p className="text-sm text-gray-500">Average Rating</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-semibold">
              {provider.metrics.completionRate}%
            </p>
            <p className="text-sm text-gray-500">Completion Rate</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-semibold">
              {provider.metrics.responseTime}m
            </p>
            <p className="text-sm text-gray-500">Avg. Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      header: 'Provider',
      accessor: 'name',
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Business Name',
      accessor: 'businessName',
    },
    {
      header: 'Services',
      accessor: 'services',
      cell: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.services.slice(0, 2).map((service: any) => (
            <Badge key={service.id} variant="outline">
              {service.name}
            </Badge>
          ))}
          {row.services.length > 2 && (
            <Badge variant="outline">+{row.services.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Rating',
      accessor: 'metrics.rating',
      cell: (row: any) => (
        <div className="flex items-center">
          <span className="font-medium">{row.metrics.rating}</span>
          <span className="text-sm text-gray-500 ml-1">
            ({row.metrics.reviewCount})
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: any) => (
        <Select
          value={row.status}
          onChange={(e) => handleUpdateProviderStatus(row.id, e.target.value)}
          className="w-32"
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </Select>
      ),
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
              setSelectedProvider(row);
              setShowDetailsDialog(true);
            }}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedProvider(row);
              setShowProviderForm(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
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
            placeholder="Search providers..."
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
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <Button
          onClick={() => {
            setSelectedProvider(null);
            setShowProviderForm(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Provider
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredProviders}
        isLoading={isLoading}
      />

      <Dialog
        open={showProviderForm}
        onClose={() => {
          setShowProviderForm(false);
          setSelectedProvider(null);
        }}
        title={selectedProvider ? 'Edit Provider' : 'Add Provider'}
      >
        <ProviderForm
          provider={selectedProvider}
          onSubmit={selectedProvider ? handleUpdateProvider : handleCreateProvider}
          onCancel={() => {
            setShowProviderForm(false);
            setSelectedProvider(null);
          }}
        />
      </Dialog>

      <Dialog
        open={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedProvider(null);
        }}
        title="Provider Details"
      >
        {selectedProvider && <ProviderDetails provider={selectedProvider} />}
      </Dialog>
    </div>
  );
};
