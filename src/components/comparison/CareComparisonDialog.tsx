import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CareComparison } from "./CareComparison";
import { ChartBar } from "lucide-react";

export const CareComparisonDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ChartBar className="h-4 w-4" />
          Compare Care Options
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Care Comparison</DialogTitle>
        </DialogHeader>
        <CareComparison />
      </DialogContent>
    </Dialog>
  );
};