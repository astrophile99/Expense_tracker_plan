"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TransactionForm } from "./transaction-form"
import type { Transaction, Category } from "@/types"
import { TransactionType, TransactionVisibility } from "@/types"
import { useTransactionStore } from "@/store"
import { MOCK_CATEGORIES } from "@/data/mock"
import { useUIStore } from "@/store"

interface EditTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction
  categories?: Category[]
}

export function EditTransactionModal({ open, onOpenChange, transaction, categories = MOCK_CATEGORIES }: EditTransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)
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
    updateTransaction(transaction.id, {
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId,
      description: data.description,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      transactionDate: data.transactionDate,
      visibility: data.visibility,
      isRecurring: data.isRecurring,
      updatedAt: new Date().toISOString(),
      category: categories.find((c) => c.id === data.categoryId),
    })
    setIsLoading(false)
    onOpenChange(false)
    addToast({ title: "Transaction updated", description: `${data.description} has been updated.`, variant: "success" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the details of this transaction.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          initialData={transaction}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
