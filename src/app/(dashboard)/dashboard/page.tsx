"use client"

import { useMemo } from "react"
import { FinanceCards } from "@/components/dashboard/finance-cards"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { useTransactionStore } from "@/store"
import { MOCK_CATEGORIES, MOCK_BUDGETS, getDashboardStats, getCategorySummaries, getMonthlyTrends } from "@/data/mock"
import { Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  const transactions = useTransactionStore((s) => s.transactions)

  const stats = useMemo(() => getDashboardStats(transactions), [transactions])
  const categorySummaries = useMemo(() => getCategorySummaries(transactions, MOCK_CATEGORIES), [transactions])
  const monthlyTrends = useMemo(() => getMonthlyTrends(), [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your financial overview</p>
        </div>
        <Link href="/transactions">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            View all transactions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <FinanceCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <SpendingChart trends={monthlyTrends} />
        <CategoryBreakdown summaries={categorySummaries} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity transactions={transactions} />
        <BudgetProgress budgets={MOCK_BUDGETS} transactions={transactions} />
      </div>
    </div>
  )
}
