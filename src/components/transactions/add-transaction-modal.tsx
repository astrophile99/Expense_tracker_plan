"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TransactionForm } from "./transaction-form"
import type { Category } from "@/types"
import type { Transaction as FinanceTransaction } from "@/types"
import { TransactionType, TransactionVisibility, PaymentMethod } from "@/types"
import { useTransactionStore } from "@/store"
import { MOCK_CATEGORIES, MOCK_TRANSACTIONS } from "@/data/mock"
import { useUIStore } from "@/store"
import { generateId } from "@/lib/utils"

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories?: Category[]
}

export function AddTransactionModal({ open, onOpenChange, categories = MOCK_CATEGORIES }: AddTransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const addToast = useUIStore((s) => s.addToast)

  const handleSubmit = async (data: {
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
  }) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    const transaction = {
      id: generateId(),
      amount: data.amount,
      currency: "USD" as const,
      type: data.type,
      categoryId: data.categoryId,
      description: data.description,
      notes: data.notes,
      tags: data.tags ?? [],
      paymentMethod: data.paymentMethod as PaymentMethod | undefined,
      transactionDate: data.transactionDate,
      createdBy: "user-1",
      visibility: data.visibility,
      isRecurring: data.isRecurring,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: categories.find((c) => c.id === data.categoryId),
    } as FinanceTransaction
    addTransaction(transaction)
    setIsLoading(false)
    onOpenChange(false)
    addToast({ title: "Transaction added", description: `${data.description} has been added.`, variant: "success" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense transaction.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
