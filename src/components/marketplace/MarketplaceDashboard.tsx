import React from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { ShoppingBagIcon, ClockIcon, HeartIcon } from '@heroicons/react/24/outline';
import { ProductList } from './ProductList';
import { ServiceList } from './ServiceList';
import { SearchFilters } from './SearchFilters';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { marketplaceService } from '@/services/marketplace.service';

const categories = [
  'Medical Supplies',
  'Home Care Equipment',
  'Personal Care',
  'Mobility Aids',
  'Monitoring Devices',
];

const serviceCategories = [
  'Home Care',
  'Nursing',
  'Physical Therapy',
  'Occupational Therapy',
  'Mental Health',
];

export const MarketplaceDashboard: React.FC = () => {
  const router = useRouter();
  const { cartItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [products, setProducts] = React.useState([]);
  const [services, setServices] = React.useState([]);

  const handleFilter = async (filters: any) => {
    setIsLoading(true);
    try {
      if (selectedTab === 0) {
        const result = await marketplaceService.searchProducts(filters);
        setProducts(result.products);
      } else {
        const result = await marketplaceService.searchServices(filters);
        setServices(result.services);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [productsResult, servicesResult] = await Promise.all([
          marketplaceService.searchProducts({}),
          marketplaceService.searchServices({}),
        ]);
        setProducts(productsResult.products);
        setServices(servicesResult.services);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/marketplace/wishlist')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <HeartIcon className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="ml-1 text-sm font-medium">{wishlistCount}</span>
            )}
          </button>
          <button
            onClick={() => router.push('/marketplace/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ShoppingBagIcon className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="ml-1 text-sm font-medium">{cartItemCount}</span>
            )}
          </button>
          <button
            onClick={() => router.push('/marketplace/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ClockIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-900/20 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Products
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? 'bg-white text-primary-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Services
          </Tab>
        </Tab.List>

        <div className="mt-6">
          <SearchFilters
            type={selectedTab === 0 ? 'product' : 'service'}
            categories={selectedTab === 0 ? categories : serviceCategories}
            onFilter={handleFilter}
          />
        </div>

        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <ProductList
              products={products}
              isLoading={isLoading}
              onProductClick={(id) => router.push(`/marketplace/products/${id}`)}
            />
          </Tab.Panel>
          <Tab.Panel>
            <ServiceList
              services={services}
              isLoading={isLoading}
              onServiceClick={(id) => router.push(`/marketplace/services/${id}`)}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
