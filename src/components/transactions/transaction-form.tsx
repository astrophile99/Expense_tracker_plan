"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategorySelector } from "./category-selector"
import { DatePicker } from "./date-picker"
import { PaymentMethodSelector } from "./payment-method-selector"
import { VisibilitySelector } from "./visibility-selector"
import type { Transaction, Category } from "@/types"
import { TransactionType, TransactionVisibility, PaymentMethod } from "@/types"
import { cn } from "@/lib/utils"
import { TRANSACTION_COLORS } from "@/constants/theme"
import { formatCurrency } from "@/lib/utils"

const TYPE_TABS = [
  { value: TransactionType.EXPENSE, label: "Expense", color: TRANSACTION_COLORS.expense },
  { value: TransactionType.INCOME, label: "Income", color: TRANSACTION_COLORS.income },
  { value: TransactionType.CASHBACK, label: "Cashback", color: TRANSACTION_COLORS.cashback },
  { value: TransactionType.REFUND, label: "Refund", color: TRANSACTION_COLORS.refund },
  { value: TransactionType.TRANSFER, label: "Transfer", color: TRANSACTION_COLORS.transfer },
  { value: TransactionType.DEBT, label: "Debt", color: TRANSACTION_COLORS.debt },
]

interface TransactionFormProps {
  initialData?: Transaction
  categories: Category[]
  onSubmit: (data: {
    type: TransactionType
    amount: number
    description: string
    categoryId: string
    transactionDate: string
    paymentMethod?: string
    notes?: string
    tags?: string[]
    isRecurring: boolean
  visibility: TransactionVisibility
  workspaceId?: string
}) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TransactionForm({ initialData, categories, onSubmit, onCancel, isLoading }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialData?.type ?? TransactionType.EXPENSE)
  const [amount, setAmount] = useState(initialData?.amount ? String(Math.abs(initialData.amount)) : "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "")
  const [date, setDate] = useState(initialData?.transactionDate ?? new Date().toISOString())
  const [paymentMethod, setPaymentMethod] = useState<string>(initialData?.paymentMethod ?? "")
  const [notes, setNotes] = useState(initialData?.notes ?? "")
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false)
  const [visibility, setVisibility] = useState<TransactionVisibility>(initialData?.visibility ?? TransactionVisibility.PRIVATE)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const amountDisplay = initialData ? String(Math.abs(initialData.amount)) : amount

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    const numAmount = parseFloat(amountDisplay)
    if (!amountDisplay || isNaN(numAmount) || numAmount <= 0) e.amount = "Enter a valid amount"
    if (!description.trim()) e.description = "Description is required"
    if (!categoryId) e.categoryId = "Select a category"
    return e
  }, [amountDisplay, description, categoryId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    onSubmit({
      type,
      amount: parseFloat(amountDisplay),
      description: description.trim(),
      categoryId,
      transactionDate: date,
      paymentMethod: paymentMethod || undefined,
      notes: notes.trim() || undefined,
      isRecurring,
      visibility,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Type</Label>
        <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-1 bg-transparent p-0">
            {TYPE_TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className={cn(
                  "data-[state=active]:text-white text-xs py-1.5 px-2 rounded-lg border transition-all",
                  type === t.value
                    ? "border-transparent shadow-sm"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted"
                )}
                style={type === t.value ? { backgroundColor: t.color, borderColor: t.color } : undefined}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">
            $
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amountDisplay}
            onChange={(e) => { setAmount(e.target.value); if (initialData) setAmount(e.target.value) }}
            className={cn("pl-8 text-lg h-12", errors.amount && "ring-2 ring-destructive")}
          />
        </div>
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
        {amountDisplay && parseFloat(amountDisplay) > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatCurrency(parseFloat(amountDisplay))} {type === TransactionType.EXPENSE ? "will be deducted" : type === TransactionType.INCOME ? "will be added" : ""}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={cn("h-12", errors.description && "ring-2 ring-destructive")}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <CategorySelector
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            error={errors.categoryId}
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <DatePicker value={date} onChange={setDate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
        </div>
        <div className="space-y-2">
          <Label>Visibility</Label>
          <VisibilitySelector value={visibility} onChange={setVisibility} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="recurring" className="text-sm font-medium">Recurring Transaction</Label>
          <p className="text-xs text-muted-foreground">Set up a repeating transaction</p>
        </div>
        <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 h-12">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Saving...
            </span>
          ) : (
            initialData ? "Update Transaction" : "Add Transaction"
          )}
        </Button>
      </div>
    </form>
  )
}
