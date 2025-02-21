import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { marketplaceService } from '@/services/marketplace.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { ServiceForm } from './ServiceForm';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

export const ServiceManagement: React.FC = () => {
  const [services, setServices] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [showServiceForm, setShowServiceForm] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  React.useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const result = await marketplaceService.getServices();
      setServices(result);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = async (serviceData: any) => {
    try {
      await marketplaceService.createService(serviceData);
      toast.success('Service created successfully');
      loadServices();
      setShowServiceForm(false);
    } catch (error) {
      toast.error('Failed to create service');
    }
  };

  const handleUpdateService = async (serviceData: any) => {
    try {
      await marketplaceService.updateService(selectedService.id, serviceData);
      toast.success('Service updated successfully');
      loadServices();
      setShowServiceForm(false);
      setSelectedService(null);
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await marketplaceService.deleteService(selectedService.id);
      toast.success('Service deleted successfully');
      loadServices();
      setShowDeleteConfirm(false);
      setSelectedService(null);
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = React.useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, categoryFilter]);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'price' },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedService(row);
              setShowServiceForm(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              setSelectedService(row);
              setShowDeleteConfirm(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
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
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="max-w-xs"
          >
            <option value="all">All Categories</option>
            <option value="healthcare">Healthcare</option>
            <option value="therapy">Therapy</option>
            <option value="wellness">Wellness</option>
            <option value="consultation">Consultation</option>
          </Select>
        </div>
        <Button
          onClick={() => {
            setSelectedService(null);
            setShowServiceForm(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Service
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredServices}
        isLoading={isLoading}
      />

      <Dialog
        open={showServiceForm}
        onClose={() => {
          setShowServiceForm(false);
          setSelectedService(null);
        }}
        title={selectedService ? 'Edit Service' : 'Add Service'}
      >
        <ServiceForm
          service={selectedService}
          onSubmit={selectedService ? handleUpdateService : handleCreateService}
          onCancel={() => {
            setShowServiceForm(false);
            setSelectedService(null);
          }}
        />
      </Dialog>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedService(null);
        }}
        title="Delete Service"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete this service? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedService(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
