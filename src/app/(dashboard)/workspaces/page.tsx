import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, Settings } from "lucide-react";

export default function WorkspacesPage() {
  const workspaces = [
    { id: "1", name: "Personal", description: "My personal finances", members: 1, color: "#0ea5e9" },
    { id: "2", name: "Family", description: "Family budget tracking", members: 4, color: "#22c55e" },
    { id: "3", name: "Business", description: "Business expenses", members: 2, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">Manage your workspaces</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: workspace.color }}
                  >
                    {workspace.name[0]}
                  </div>
                  <div>
                    <CardTitle className="text-base">{workspace.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{workspace.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {workspace.members} member{workspace.members > 1 ? "s" : ""}
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}