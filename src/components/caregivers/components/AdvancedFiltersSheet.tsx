
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Filter, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedFiltersProps {
  filters: {
    specialization: string;
    maxRate: number;
    experienceYears: number;
  };
  advancedFilters: {
    maxHourlyRate: number;
    ratings: number;
    backgroundChecked: boolean;
    transportationProvided: boolean;
  };
  onFiltersChange: (key: string, value: any) => void;
  onAdvancedFiltersChange: (key: string, value: any) => void;
}

export function AdvancedFiltersSheet({
  filters,
  advancedFilters,
  onFiltersChange,
  onAdvancedFiltersChange,
}: AdvancedFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label>Maximum Hourly Rate</Label>
            <Slider
              value={[advancedFilters.maxHourlyRate]}
              onValueChange={([value]) => 
                onAdvancedFiltersChange('maxHourlyRate', value)
              }
              max={100}
              step={5}
            />
            <span className="text-sm text-muted-foreground">
              Up to ${advancedFilters.maxHourlyRate}/hour
            </span>
          </div>

          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  key={rating}
                  className={`h-5 w-5 cursor-pointer ${
                    rating <= advancedFilters.ratings
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => onAdvancedFiltersChange('ratings', rating)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="background-check"
              checked={advancedFilters.backgroundChecked}
              onCheckedChange={(checked) =>
                onAdvancedFiltersChange('backgroundChecked', checked)
              }
            />
            <Label htmlFor="background-check">Background Checked Only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="transportation"
              checked={advancedFilters.transportationProvided}
              onCheckedChange={(checked) =>
                onAdvancedFiltersChange('transportationProvided', checked)
              }
            />
            <Label htmlFor="transportation">Provides Transportation</Label>
          </div>

          <Select
            value={filters.specialization}
            onValueChange={(value) => onFiltersChange('specialization', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dementia">Dementia Care</SelectItem>
              <SelectItem value="elderly">Elderly Care</SelectItem>
              <SelectItem value="disability">Disability Support</SelectItem>
              <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
              <SelectItem value="palliative">Palliative Care</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SheetContent>
    </Sheet>
  );
}
