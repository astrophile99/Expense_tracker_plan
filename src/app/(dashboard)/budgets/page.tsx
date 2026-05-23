import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function BudgetsPage() {
  const budgets = [
    { category: "Food & Dining", budget: 500, spent: 350, color: "#0ea5e9" },
    { category: "Transportation", budget: 200, spent: 150, color: "#22c55e" },
    { category: "Entertainment", budget: 150, spent: 120, color: "#f59e0b" },
    { category: "Shopping", budget: 300, spent: 280, color: "#ef4444" },
    { category: "Bills", budget: 400, spent: 380, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Track your spending limits</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <Card key={budget.category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">{budget.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">${budget.spent} / ${budget.budget}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(budget.spent / budget.budget) * 100}%`,
                      backgroundColor: budget.color,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {budget.budget - budget.spent} remaining
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}