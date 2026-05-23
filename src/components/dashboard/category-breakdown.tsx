"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { CategorySummary } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface CategoryBreakdownProps {
  summaries: CategorySummary[]
  isLoading?: boolean
}

export function CategoryBreakdown({ summaries, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Spending by Category</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Spending by Category</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            No expense data yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {summaries.map((cat) => (
          <div key={cat.categoryId} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: cat.categoryColor }}
                />
                <span className="text-sm font-medium">{cat.categoryName}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{formatCurrency(cat.total)}</span>
                <span className="text-xs text-muted-foreground ml-2">{cat.percentage}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.categoryColor,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
