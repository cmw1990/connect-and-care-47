
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const InsuranceDeductiblesSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-[200px]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
