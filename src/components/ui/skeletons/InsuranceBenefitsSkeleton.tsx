
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const InsuranceBenefitsSkeleton = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
          <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
          <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
          <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
          <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3].map((i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[24px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
