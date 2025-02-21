import React from 'react';
import { marketplaceService } from '@/services/marketplace.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { StarIcon } from '@heroicons/react/24/solid';

export const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [selectedReview, setSelectedReview] = React.useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showResponseDialog, setShowResponseDialog] = React.useState(false);
  const [response, setResponse] = React.useState('');

  React.useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const result = await marketplaceService.getAllReviews();
      setReviews(result);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      await marketplaceService.deleteReview(selectedReview.id);
      toast.success('Review deleted successfully');
      loadReviews();
      setShowDeleteConfirm(false);
      setSelectedReview(null);
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleRespondToReview = async () => {
    if (!selectedReview || !response.trim()) return;

    try {
      await marketplaceService.respondToReview(selectedReview.id, response);
      toast.success('Response added successfully');
      loadReviews();
      setShowResponseDialog(false);
      setSelectedReview(null);
      setResponse('');
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  const handleFeatureReview = async (reviewId: string, featured: boolean) => {
    try {
      await marketplaceService.updateReview(reviewId, { featured });
      toast.success(
        featured ? 'Review featured successfully' : 'Review unfeatured successfully'
      );
      loadReviews();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const filteredReviews = React.useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === 'all' ||
        (filterType === 'product' && review.type === 'product') ||
        (filterType === 'service' && review.type === 'service');
      return matchesSearch && matchesType;
    });
  }, [reviews, searchQuery, filterType]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (row: any) => row.customer.name,
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row: any) =>
        row.type.charAt(0).toUpperCase() + row.type.slice(1),
    },
    {
      header: 'Item',
      accessor: 'item',
      cell: (row: any) => row.item.name,
    },
    {
      header: 'Rating',
      accessor: 'rating',
      cell: (row: any) => (
        <div className="flex">{renderStars(row.rating)}</div>
      ),
    },
    {
      header: 'Review',
      accessor: 'content',
      cell: (row: any) => (
        <div className="max-w-md">
          <p className="truncate">{row.content}</p>
          {row.response && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              Response: {row.response}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Featured',
      accessor: 'featured',
      cell: (row: any) => (
        <Button
          size="sm"
          variant={row.featured ? 'default' : 'outline'}
          onClick={() => handleFeatureReview(row.id, !row.featured)}
        >
          {row.featured ? 'Featured' : 'Feature'}
        </Button>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedReview(row);
              setShowResponseDialog(true);
            }}
          >
            Respond
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedReview(row);
              setShowDeleteConfirm(true);
            }}
          >
            Delete
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
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="max-w-xs"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredReviews}
        isLoading={isLoading}
      />

      <Dialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedReview(null);
        }}
        title="Delete Review"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedReview(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showResponseDialog}
        onClose={() => {
          setShowResponseDialog(false);
          setSelectedReview(null);
          setResponse('');
        }}
        title="Respond to Review"
      >
        <div className="space-y-4">
          {selectedReview && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {selectedReview.customer.name}
                </span>
                <div className="flex">{renderStars(selectedReview.rating)}</div>
              </div>
              <p className="mt-2">{selectedReview.content}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <textarea
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowResponseDialog(false);
                setSelectedReview(null);
                setResponse('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespondToReview}
              disabled={!response.trim()}
            >
              Submit Response
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
