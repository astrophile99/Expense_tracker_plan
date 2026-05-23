"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "name-asc" | "name-desc"

interface SortingControlsProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortingControls({ value, onChange }: SortingControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger className="h-9 w-[160px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Newest first</SelectItem>
          <SelectItem value="date-asc">Oldest first</SelectItem>
          <SelectItem value="amount-desc">Highest amount</SelectItem>
          <SelectItem value="amount-asc">Lowest amount</SelectItem>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
