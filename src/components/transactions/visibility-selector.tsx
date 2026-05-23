"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { TransactionVisibility } from "@/types"

interface VisibilitySelectorProps {
  value: TransactionVisibility
  onChange: (value: TransactionVisibility) => void
}

export function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TransactionVisibility)}>
      <SelectTrigger className="h-12">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TransactionVisibility.PRIVATE}>
          <span className="flex items-center gap-2">Private</span>
        </SelectItem>
        <SelectItem value={TransactionVisibility.WORKSPACE}>
          <span className="flex items-center gap-2">Workspace</span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
