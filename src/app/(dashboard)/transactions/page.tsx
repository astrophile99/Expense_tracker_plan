"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { SearchBar } from "@/components/transactions/search-bar"
import { SortingControls, type SortOption } from "@/components/transactions/sorting-controls"
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal"
import { FloatingActionButton } from "@/components/transactions/floating-action-button"
import { useTransactionStore } from "@/store"
import { MOCK_CATEGORIES } from "@/data/mock"
import { TransactionType } from "@/types"
import { Plus, ListTodo } from "lucide-react"

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("date-desc")
  const [filters, setFilters] = useState<{ type?: TransactionType; categoryId?: string; paymentMethod?: string }>({})
  const [addModalOpen, setAddModalOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...transactions]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (filters.type) result = result.filter((t) => t.type === filters.type)
    if (filters.categoryId) result = result.filter((t) => t.categoryId === filters.categoryId)
    if (filters.paymentMethod) result = result.filter((t) => t.paymentMethod === filters.paymentMethod)

    const [field, dir] = sort.split("-") as [string, "asc" | "desc"]
    result.sort((a, b) => {
      let cmp = 0
      if (field === "date") cmp = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
      else if (field === "amount") cmp = a.amount - b.amount
      else if (field === "name") cmp = a.description.localeCompare(b.description)
      return dir === "desc" ? -cmp : cmp
    })

    return result
  }, [transactions, search, filters, sort])

  const handleFiltersChange = useCallback((f: typeof filters) => {
    setFilters(f)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="hidden md:inline-flex shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchBar value={search} onChange={setSearch} className="w-full sm:max-w-xs" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <TransactionFilters categories={MOCK_CATEGORIES} filters={filters} onFiltersChange={handleFiltersChange} />
              <SortingControls value={sort} onChange={setSort} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ListTodo className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Get started by adding your first transaction. Track your expenses, income, and more.
              </p>
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first transaction
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ListTodo className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No matching transactions</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="mb-3 text-xs text-muted-foreground">
                Showing {filtered.length} of {transactions.length} transactions
              </div>
              <TransactionTable transactions={filtered} categories={MOCK_CATEGORIES} />
            </>
          )}
        </CardContent>
      </Card>

      <FloatingActionButton onClick={() => setAddModalOpen(true)} />
      <AddTransactionModal open={addModalOpen} onOpenChange={setAddModalOpen} categories={MOCK_CATEGORIES} />
    </div>
  )
}
