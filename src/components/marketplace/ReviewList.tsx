import React from 'react';
import Image from 'next/image';
import { Review } from '@/services/marketplace.service';
import { formatDate } from '@/utils/format';
import { StarIcon, HandThumbUpIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

interface ReviewListProps {
  reviews: Review[];
  onHelpfulClick?: (reviewId: string) => void;
  onRespond?: (reviewId: string, response: string) => void;
  canRespond?: boolean;
}

const ReviewStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onHelpfulClick,
  onRespond,
  canRespond = false,
}) => {
  const [respondingTo, setRespondingTo] = React.useState<string | null>(null);
  const [response, setResponse] = React.useState('');

  const handleSubmitResponse = (reviewId: string) => {
    if (onRespond) {
      onRespond(reviewId, response);
      setRespondingTo(null);
      setResponse('');
    }
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center mb-2">
                <ReviewStars rating={review.rating} />
                {review.verified && (
                  <span className="ml-2 flex items-center text-green-600 text-sm">
                    <CheckBadgeIcon className="h-4 w-4 mr-1" />
                    Verified Purchase
                  </span>
                )}
              </div>
              {review.title && (
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {review.title}
                </h4>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{review.content}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-4 mb-4">
              {review.images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative h-24 w-24 rounded-lg overflow-hidden"
                >
                  <Image
                    src={image.url}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => onHelpfulClick?.(review.id)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <HandThumbUpIcon className="h-4 w-4 mr-1" />
              Helpful ({review.helpful})
            </button>
          </div>

          {review.response && (
            <div className="mt-4 pl-4 border-l-4 border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Seller Response
              </p>
              <p className="text-sm text-gray-600">{review.response.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(review.response.timestamp)}
              </p>
            </div>
          )}

          {canRespond && !review.response && (
            <div className="mt-4">
              {respondingTo === review.id ? (
                <div className="space-y-2">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setRespondingTo(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitResponse(review.id)}
                      className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRespondingTo(review.id)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Respond to Review
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
