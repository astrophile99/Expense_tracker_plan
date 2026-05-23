"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Category } from "@/types"
import { TransactionType } from "@/types"
import { TRANSACTION_COLORS } from "@/constants/theme"
import { Filter, RotateCcw, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterState {
  type?: TransactionType
  categoryId?: string
  paymentMethod?: string
}

interface TransactionFiltersProps {
  categories: Category[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function TransactionFilters({ categories, filters, onFiltersChange }: TransactionFiltersProps) {
  const [open, setOpen] = useState(false)

  const hasActiveFilters = filters.type || filters.categoryId || filters.paymentMethod

  const handleReset = () => {
    onFiltersChange({})
    setOpen(false)
  }

  const ActiveFilterBadge = ({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium">
      {children}
      <button onClick={onRemove} className="hover:text-primary/70 ml-0.5">&times;</button>
    </span>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("relative", hasActiveFilters && "border-primary")}>
          <Filter className="h-4 w-4 mr-1.5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filters</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select
              value={filters.type ?? "all"}
              onValueChange={(v) => onFiltersChange({ ...filters, type: v === "all" ? undefined : v as TransactionType })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.values(TransactionType).map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2 capitalize">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TRANSACTION_COLORS[t] }} />
                      {t}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select
              value={filters.categoryId ?? "all"}
              onValueChange={(v) => onFiltersChange({ ...filters, categoryId: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <Select
              value={filters.paymentMethod ?? "all"}
              onValueChange={(v) => onFiltersChange({ ...filters, paymentMethod: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="debit-card">Debit Card</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-1.5">
                {filters.type && (
                  <ActiveFilterBadge onRemove={() => onFiltersChange({ ...filters, type: undefined })}>
                    {filters.type}
                  </ActiveFilterBadge>
                )}
                {filters.categoryId && (
                  <ActiveFilterBadge onRemove={() => onFiltersChange({ ...filters, categoryId: undefined })}>
                    {categories.find(c => c.id === filters.categoryId)?.name ?? "Category"}
                  </ActiveFilterBadge>
                )}
                {filters.paymentMethod && (
                  <ActiveFilterBadge onRemove={() => onFiltersChange({ ...filters, paymentMethod: undefined })}>
                    {filters.paymentMethod.replace("-", " ")}
                  </ActiveFilterBadge>
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
