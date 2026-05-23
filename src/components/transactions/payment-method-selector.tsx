"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAYMENT_METHODS } from "@/data/mock"

interface PaymentMethodSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12">
        <SelectValue placeholder="Select method" />
      </SelectTrigger>
      <SelectContent>
        {PAYMENT_METHODS.map((method) => (
          <SelectItem key={method.value} value={method.value}>
            {method.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
