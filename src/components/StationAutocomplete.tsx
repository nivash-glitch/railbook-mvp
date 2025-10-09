import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchStations, Station } from "@/data/stations";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationAutocompleteProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  required?: boolean;
}

const StationAutocomplete = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  icon,
  required = false,
}: StationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length >= 2) {
      const results = searchStations(inputValue);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectStation = (station: Station) => {
    onChange(`${station.name} (${station.code})`);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectStation(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.length >= 2) {
              const results = searchStations(value);
              setSuggestions(results);
              setShowSuggestions(true);
            }
          }}
          className="h-12"
          required={required}
          autoComplete="off"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map((station, index) => (
              <div
                key={station.code}
                className={cn(
                  "px-4 py-3 cursor-pointer hover:bg-accent transition-colors border-b border-border last:border-b-0",
                  selectedIndex === index && "bg-accent"
                )}
                onClick={() => handleSelectStation(station)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {station.name}
                      <span className="ml-2 text-xs font-mono text-muted-foreground">
                        ({station.code})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {station.city}, {station.state}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showSuggestions && suggestions.length === 0 && value.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
            No stations found
          </div>
        )}
      </div>
    </div>
  );
};

export default StationAutocomplete;
