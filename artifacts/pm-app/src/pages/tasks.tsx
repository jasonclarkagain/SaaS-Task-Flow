import React from "react";
import { useListTasks, getListTasksQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";

const priorityVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  urgent: "destructive",
};

const statusLabel: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export default function Tasks() {
  const { data: tasks, isLoading } = useListTasks(undefined, {
    query: { queryKey: getListTasksQueryKey() }
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Tasks</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">View and filter tasks across all projects.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0" data-testid="button-add-task">
              <Plus className="h-4 w-4 mr-1.5" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tasks?.map((task) => (
          <Card key={task.id} data-testid={`card-task-${task.id}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm sm:text-base leading-snug">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                  <Badge variant={priorityVariant[task.priority] || "outline"} className="text-xs">
                    {task.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {statusLabel[task.status] || task.status}
                  </Badge>
                </div>
              </div>
              {task.dueDate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {tasks?.length === 0 && (
          <div className="py-16 text-center border rounded-lg bg-card text-muted-foreground">
            No tasks yet. Create your first one.
          </div>
        )}
      </div>
    </div>
  );
}
