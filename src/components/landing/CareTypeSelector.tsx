
import React from "react";
import { Heart, Baby, Brain, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CareTypeSelectorProps {
  selectedCareType: string;
  onCareTypeChange: (value: string) => void;
}

export const CareTypeSelector: React.FC<CareTypeSelectorProps> = ({
  selectedCareType,
  onCareTypeChange,
}) => {
  const careTypes = [
    { value: "senior", label: "Senior Care", icon: Heart },
    { value: "child", label: "Child Care", icon: Baby },
    { value: "special", label: "Special Needs Care", icon: Brain },
    { value: "respite", label: "Respite Care", icon: Users },
  ];

  return (
    <Select value={selectedCareType} onValueChange={onCareTypeChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Type of Care" />
      </SelectTrigger>
      <SelectContent>
        {careTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <div className="flex items-center gap-2">
              <type.icon className="h-4 w-4" />
              {type.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
