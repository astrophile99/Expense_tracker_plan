"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useTransactionStore } from "@/store"
import { useUIStore } from "@/store"
import type { Transaction } from "@/types"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction
}

export function DeleteConfirmationDialog({ open, onOpenChange, transaction }: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const removeTransaction = useTransactionStore((s) => s.removeTransaction)
  const addToast = useUIStore((s) => s.addToast)

  const handleDelete = async () => {
    setIsDeleting(true)
    await new Promise((r) => setTimeout(r, 600))
    removeTransaction(transaction.id)
    setIsDeleting(false)
    onOpenChange(false)
    addToast({ title: "Transaction deleted", description: `${transaction.description} has been removed.`, variant: "error" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-destructive/10 p-2 shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Transaction</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete "{transaction.description}"? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1 sm:flex-none">
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
