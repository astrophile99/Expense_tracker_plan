"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemo } from "react"
import type { MonthlyTrend } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface SpendingChartProps {
  trends: MonthlyTrend[]
  isLoading?: boolean
}

export function SpendingChart({ trends, isLoading }: SpendingChartProps) {
  const maxValue = useMemo(() => Math.max(...trends.flatMap(t => [t.expenses, t.income]), 0), [trends])

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Income vs Expenses</CardTitle></CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-end gap-3">
          {trends.map((month) => {
            const incomeHeight = (month.income / maxValue) * 200
            const expenseHeight = (month.expenses / maxValue) * 200
            return (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                <div className="relative w-full flex items-end justify-center gap-[3px] h-[200px]">
                  <div
                    className="w-[40%] rounded-t-md bg-emerald-400/80 hover:bg-emerald-400 transition-all duration-300 group-hover:scale-y-105 origin-bottom cursor-pointer relative"
                    style={{ height: `${incomeHeight}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Income: {formatCurrency(month.income)}
                    </div>
                  </div>
                  <div
                    className="w-[40%] rounded-t-md bg-primary/80 hover:bg-primary transition-all duration-300 group-hover:scale-y-105 origin-bottom cursor-pointer relative"
                    style={{ height: `${expenseHeight}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Expenses: {formatCurrency(month.expenses)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{month.month}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-400/80" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary/80" />
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
