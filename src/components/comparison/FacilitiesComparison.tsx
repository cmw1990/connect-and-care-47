import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { CareFacility } from "./types";

interface FacilitiesComparisonProps {
  facilities: CareFacility[];
  isAnalyzing: boolean;
  onCompare: (facilities: CareFacility[]) => void;
  onLocationChange: (country: string, state: string) => void;
}

export const FacilitiesComparison = ({
  facilities,
  isAnalyzing,
  onCompare,
  onLocationChange,
}: FacilitiesComparisonProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    onLocationChange(value, "all");
    setSelectedState("all");
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    onLocationChange(selectedCountry, value);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Country</Label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>State/Province</Label>
          <Select value={selectedState} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {selectedCountry === "USA" ? (
                <>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="Ontario">Ontario</SelectItem>
                  <SelectItem value="Quebec">Quebec</SelectItem>
                  <SelectItem value="British Columbia">British Columbia</SelectItem>
                  <SelectItem value="Alberta">Alberta</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.map((facility) => (
          <div key={facility.id} className="p-4 border rounded">
            <h3 className="font-semibold">{facility.name}</h3>
            <p className="text-sm text-gray-600">{facility.description}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {facility.listing_type}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button 
        onClick={() => onCompare(facilities)}
        className="mt-4"
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <Brain className="mr-2 h-4 w-4 animate-pulse" />
            Analyzing...
          </>
        ) : (
          'Compare Facilities'
        )}
      </Button>
    </div>
  );
};