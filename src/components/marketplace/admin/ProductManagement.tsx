import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { marketplaceService } from '@/services/marketplace.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { ProductForm } from './ProductForm';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [showProductForm, setShowProductForm] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  React.useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await marketplaceService.getProducts();
      setProducts(result);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      await marketplaceService.createProduct(productData);
      toast.success('Product created successfully');
      loadProducts();
      setShowProductForm(false);
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    try {
      await marketplaceService.updateProduct(selectedProduct.id, productData);
      toast.success('Product updated successfully');
      loadProducts();
      setShowProductForm(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await marketplaceService.deleteProduct(selectedProduct.id);
      toast.success('Product deleted successfully');
      loadProducts();
      setShowDeleteConfirm(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'price' },
    { header: 'Stock', accessor: 'stock' },
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
              setSelectedProduct(row);
              setShowProductForm(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              setSelectedProduct(row);
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
            placeholder="Search products..."
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
            <option value="health">Health</option>
            <option value="wellness">Wellness</option>
            <option value="medical">Medical</option>
            <option value="equipment">Equipment</option>
          </Select>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setShowProductForm(true);
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      <Table
        columns={columns}
        data={filteredProducts}
        isLoading={isLoading}
      />

      <Dialog
        open={showProductForm}
        onClose={() => {
          setShowProductForm(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          product={selectedProduct}
          onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
        />
      </Dialog>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
