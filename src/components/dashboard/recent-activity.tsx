"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Transaction } from "@/types"
import { TransactionType } from "@/types"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { TRANSACTION_COLORS } from "@/constants/theme"
import { ArrowUpRight, ArrowDownRight, RotateCw, RefreshCw, ArrowLeftRight, HandCoins } from "lucide-react"

interface RecentActivityProps {
  transactions: Transaction[]
  isLoading?: boolean
  maxItems?: number
}

const typeIcons = {
  [TransactionType.EXPENSE]: ArrowDownRight,
  [TransactionType.INCOME]: ArrowUpRight,
  [TransactionType.CASHBACK]: RefreshCw,
  [TransactionType.REFUND]: RotateCw,
  [TransactionType.TRANSFER]: ArrowLeftRight,
  [TransactionType.DEBT]: HandCoins,
}

export function RecentActivity({ transactions, isLoading, maxItems = 5 }: RecentActivityProps) {
  const recent = transactions.slice(0, maxItems)

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            No recent transactions
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.map((tx, i) => {
          const Icon = typeIcons[tx.type]
          const color = TRANSACTION_COLORS[tx.type]
          const isPositive = [TransactionType.INCOME, TransactionType.CASHBACK, TransactionType.REFUND].includes(tx.type)

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 group"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDateTime(tx.transactionDate)}</span>
                  {tx.isRecurring && <RotateCw className="h-3 w-3" />}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums" style={{ color }}>
                  {isPositive ? "+" : ""}{formatCurrency(tx.amount)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
