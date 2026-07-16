import { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

interface SearchableSelectOption {
  value: string;
  label: string;
}

/**
 * A lightweight searchable dropdown built on Popover (no extra dependency).
 * Filters options by a text query as the user types.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No matches found.",
  fallbackOption,
  triggerClassName,
}: {
  options: readonly SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Shown as a selectable row when the query filters everything out. */
  fallbackOption?: SearchableSelectOption;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption =
    options.find((option) => option.value === value) ??
    (fallbackOption?.value === value ? fallbackOption : undefined);

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (search.length === 0) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search),
    );
  }, [options, query]);

  useEffect(() => {
    if (open) {
      // Reset the filter each time the dropdown opens and focus the search.
      setQuery("");
      const id = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
        >
          <span className={cn(!selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex w-[--radix-popover-trigger-width] flex-col overflow-hidden p-0"
        style={{
          maxHeight:
            "min(320px, var(--radix-popover-content-available-height))",
        }}
      >
        <div className="shrink-0 border-b p-2">
          <Input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9"
          />
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto p-1"
          onWheel={(event) => {
            // Radix Dialog's scroll-lock swallows wheel events; drive scroll
            // manually so the list is usable when the trigger is inside one.
            event.currentTarget.scrollTop += event.deltaY;
          }}
        >
          {filteredOptions.length === 0 ? (
            fallbackOption ? (
              <>
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(fallbackOption.value)}
                  className="flex w-full appearance-none items-center justify-between rounded-sm border-0 border-t bg-transparent px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {fallbackOption.label}
                </button>
              </>
            ) : (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full appearance-none items-center justify-between rounded-sm border-0 bg-transparent px-3 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground",
                  option.value === value && "bg-accent/60 font-medium",
                )}
              >
                {option.label}
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
