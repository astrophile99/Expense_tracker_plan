"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EditTransactionModal } from "./edit-transaction-modal"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import type { Transaction, Category } from "@/types"
import { TransactionType } from "@/types"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { TRANSACTION_COLORS } from "@/constants/theme"
import { ArrowUpDown, ChevronUp, ChevronDown, Pencil, Trash2, RotateCw, MoreHorizontal } from "lucide-react"

type SortField = "date" | "amount" | "description"
type SortDir = "asc" | "desc"

interface TransactionTableProps {
  transactions: Transaction[]
  categories: Category[]
  isLoading?: boolean
}

export function TransactionTable({ transactions, categories, isLoading }: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null)

  const sorted = [...transactions].sort((a, b) => {
    let cmp = 0
    if (sortField === "date") cmp = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    else if (sortField === "amount") cmp = a.amount - b.amount
    else if (sortField === "description") cmp = a.description.localeCompare(b.description)
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("desc") }
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
      {sortField === field ? (
        sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      )}
    </button>
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <MoreHorizontal className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
        <p className="text-muted-foreground text-sm">Add your first transaction to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3.5 text-left group">
                  <SortHeader field="date">Date</SortHeader>
                </th>
                <th className="px-4 py-3.5 text-left group">
                  <SortHeader field="description">Description</SortHeader>
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3.5 text-left text-sm font-medium text-muted-foreground">Payment</th>
                <th className="px-4 py-3.5 text-right group">
                  <SortHeader field="amount">Amount</SortHeader>
                </th>
                <th className="px-4 py-3.5 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId)
                const color = TRANSACTION_COLORS[tx.type]
                const isPositive = [TransactionType.INCOME, TransactionType.CASHBACK, TransactionType.REFUND].includes(tx.type)
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30 group"
                  >
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          {tx.isRecurring && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <RotateCw className="h-3 w-3" />
                              Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {cat && (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                          style={{ borderColor: cat.color, color: cat.color }}
                        >
                          {cat.name}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground capitalize">
                      {tx.paymentMethod?.replace("-", " ") ?? "—"}
                    </td>
                    <td className={cn("px-4 py-4 text-right text-sm font-semibold tabular-nums")} style={{ color }}>
                      {isPositive ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditTx(tx)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTx(tx)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {sorted.map((tx) => {
          const cat = categories.find((c) => c.id === tx.categoryId)
          const color = TRANSACTION_COLORS[tx.type]
          const isPositive = [TransactionType.INCOME, TransactionType.CASHBACK, TransactionType.REFUND].includes(tx.type)
          return (
            <div
              key={tx.id}
              className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(tx.transactionDate)}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold tabular-nums" style={{ color }}>
                  {isPositive ? "+" : ""}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {cat && (
                  <Badge variant="outline" className="text-xs font-normal" style={{ borderColor: cat.color, color: cat.color }}>
                    {cat.name}
                  </Badge>
                )}
                {tx.paymentMethod && (
                  <span className="text-xs text-muted-foreground capitalize">{tx.paymentMethod.replace("-", " ")}</span>
                )}
                {tx.isRecurring && <RotateCw className="h-3 w-3 text-muted-foreground" />}
                <div className="ml-auto flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditTx(tx)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTx(tx)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editTx && (
        <EditTransactionModal
          open={!!editTx}
          onOpenChange={(o) => { if (!o) setEditTx(null) }}
          transaction={editTx}
          categories={categories}
        />
      )}
      {deleteTx && (
        <DeleteConfirmationDialog
          open={!!deleteTx}
          onOpenChange={(o) => { if (!o) setDeleteTx(null) }}
          transaction={deleteTx}
        />
      )}
    </>
  )
}
