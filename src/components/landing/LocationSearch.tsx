
import React from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Region } from "@/types/regions";

interface LocationSearchProps {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Region[];
  handleSearchSelect: (result: Region) => void;
  selectedCity?: string;
  selectedRegion?: string;
  selectedCountry?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
  searchResults,
  handleSearchSelect,
  selectedCity,
  selectedRegion,
  selectedCountry,
}) => {
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="w-full justify-start text-left font-normal hover:bg-primary/5"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        {selectedCity || selectedRegion || selectedCountry || "Search location..."}
      </Button>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Search locations..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.length > 0 && (
            <CommandGroup heading="Locations">
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.name}
                  onSelect={() => handleSearchSelect(result)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-primary/5"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div>{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.type}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
};
