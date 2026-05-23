"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Budget, Transaction } from "@/types"
import { TransactionType } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface BudgetProgressProps {
  budgets: Budget[]
  transactions: Transaction[]
  isLoading?: boolean
}

export function BudgetProgress({ budgets, transactions, isLoading }: BudgetProgressProps) {
  const getSpent = (categoryId: string) =>
    transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amount, 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Budget Progress</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Budget Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            No budgets set yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {budgets.map((budget) => {
          const spent = getSpent(budget.categoryId)
          const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
          const isOver = spent > budget.amount
          const isClose = percentage >= 80 && !isOver
          const color = budget.category?.color ?? "#0ea5e9"

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium">{budget.category?.name ?? "Unknown"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{formatCurrency(spent)}</span>
                  {" / "}
                  {formatCurrency(budget.amount)}
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isOver ? "bg-destructive" : isClose ? "bg-warning" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-end mt-0.5">
                <span className={cn(
                  "text-xs font-medium",
                  isOver && "text-destructive",
                  isClose && "text-amber-500"
                )}>
                  {percentage.toFixed(0)}%
                  {isOver && " (over budget!)"}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
