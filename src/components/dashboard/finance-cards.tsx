"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Wallet, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardStats } from "@/types"
import { TrendChart } from "./trend-chart"

interface FinanceCardsProps {
  stats: DashboardStats | null
  isLoading?: boolean
}

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  trend?: number[]
}

function StatCard({ title, value, change, changeType, icon, trend }: StatCardProps) {
  const IconComponent = changeType === "positive" ? ArrowUpRight : changeType === "negative" ? ArrowDownRight : TrendingUp

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <IconComponent className={cn(
            "h-4 w-4",
            changeType === "positive" && "text-emerald-500",
            changeType === "negative" && "text-red-500",
            changeType === "neutral" && "text-muted-foreground"
          )} />
          <span className={cn(
            "text-xs font-medium",
            changeType === "positive" && "text-emerald-500",
            changeType === "negative" && "text-red-500",
            changeType === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </span>
        </div>
        {trend && (
          <div className="mt-3 h-8">
            <TrendChart data={trend} color={changeType === "positive" ? "#22c55e" : changeType === "negative" ? "#ef4444" : "#a3a3a3"} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function FinanceCards({ stats, isLoading }: FinanceCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const totalBalance = stats.totalIncome - stats.totalExpenses

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Balance"
        value={formatCurrency(totalBalance)}
        change={`${totalBalance >= 0 ? "+" : ""}${((totalBalance / (stats.totalIncome || 1)) * 100).toFixed(1)}% vs last month`}
        changeType={totalBalance >= 0 ? "positive" : "negative"}
        icon={<DollarSign className="h-4 w-4" />}
        trend={[4000, 4500, 4200, 4800, 5100, 5340]}
      />
      <StatCard
        title="Income"
        value={formatCurrency(stats.totalIncome)}
        change={`+${stats.savingsRate}% savings rate`}
        changeType="positive"
        icon={<Wallet className="h-4 w-4" />}
        trend={[6000, 7200, 6800, 7800, 8200, 8500]}
      />
      <StatCard
        title="Expenses"
        value={formatCurrency(stats.totalExpenses)}
        change={`${stats.transactionCount} transactions`}
        changeType="negative"
        icon={<ArrowDownRight className="h-4 w-4" />}
        trend={[2800, 3100, 2900, 3500, 3200, 3340]}
      />
      <StatCard
        title="Savings Rate"
        value={`${stats.savingsRate}%`}
        change={stats.savingsRate > 30 ? "Excellent" : stats.savingsRate > 20 ? "Good" : "Needs improvement"}
        changeType={stats.savingsRate > 30 ? "positive" : stats.savingsRate > 20 ? "neutral" : "negative"}
        icon={<PiggyBank className="h-4 w-4" />}
        trend={[25, 28, 30, 32, 35, stats.savingsRate]}
      />
    </div>
  )
}
