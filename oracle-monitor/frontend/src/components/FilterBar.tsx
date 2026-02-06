import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  modelFilter: string;
  onModelFilterChange: (value: string) => void;
  statusOptions: FilterOption[];
  modelOptions: FilterOption[];
}

export function FilterBar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  modelFilter,
  onModelFilterChange,
  statusOptions,
  modelOptions,
}: FilterBarProps) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-deep" />
        <input
          type="text"
          placeholder="Search agents..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-deep focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-muted-deep" />
        <span className="text-xs font-medium text-muted-deep">Status:</span>
        <div className="flex gap-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusFilterChange(option.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === option.value
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-background border border-border text-muted hover:text-foreground hover:border-border-strong"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Model Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-deep">Model:</span>
        <select
          value={modelFilter}
          onChange={(e) => onModelFilterChange(e.target.value)}
          className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
