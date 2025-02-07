
import React from "react";
import { Star, ThumbsUp, Award, Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FacilityReview, DetailedReviewMetrics } from "./types";
import { format } from "date-fns";

interface FacilityReviewsProps {
  reviews: FacilityReview[];
  onWriteReview?: () => void;
  isPremium?: boolean;
}

const ReviewMetricBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value.toFixed(1)}</span>
    </div>
    <Progress value={value * 20} className="h-2" />
  </div>
);

const AggregateMetrics = ({ reviews }: { reviews: FacilityReview[] }) => {
  const metrics = reviews.reduce(
    (acc, review) => {
      if (review.metrics) {
        Object.keys(review.metrics).forEach((key) => {
          acc[key] = (acc[key] || 0) + review.metrics[key as keyof DetailedReviewMetrics];
        });
      }
      return acc;
    },
    {} as Record<string, number>
  );

  Object.keys(metrics).forEach((key) => {
    metrics[key] = metrics[key] / reviews.length;
  });

  return (
    <div className="space-y-3">
      <ReviewMetricBar label="Staff & Care" value={metrics.staff_rating || 0} />
      <ReviewMetricBar label="Cleanliness" value={metrics.cleanliness_rating || 0} />
      <ReviewMetricBar label="Care Quality" value={metrics.care_quality_rating || 0} />
      <ReviewMetricBar label="Amenities" value={metrics.amenities_rating || 0} />
      <ReviewMetricBar label="Activities" value={metrics.activities_rating || 0} />
      <ReviewMetricBar label="Value" value={metrics.value_rating || 0} />
    </div>
  );
};

export const FacilityReviews: React.FC<FacilityReviewsProps> = ({
  reviews,
  onWriteReview,
  isPremium,
}) => {
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {averageRating.toFixed(1)}
                <span className="text-lg text-gray-500 ml-2">/ 5.0</span>
              </CardTitle>
              <CardDescription>
                Based on {reviews.length} verified reviews
              </CardDescription>
            </div>
            <Button onClick={onWriteReview} className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white">
              Write a Review
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AggregateMetrics reviews={reviews} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    {review.verified_review && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Verified Stay</span>
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-gray-700">{review.review_text}</p>
              
              {review.response && isPremium && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-[#9b87f5]" />
                    <span className="font-medium">Facility Response</span>
                  </div>
                  <p className="text-gray-600 italic">{review.response.response_text}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
