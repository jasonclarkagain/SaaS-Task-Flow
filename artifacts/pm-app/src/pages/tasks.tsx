import React from "react";
import { useListTasks, getListTasksQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";

export default function Tasks() {
  const { data: tasks, isLoading } = useListTasks(undefined, {
    query: { queryKey: getListTasksQueryKey() }
  });

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground mt-2">View and filter tasks across all projects.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
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

      <div className="space-y-4">
        {tasks?.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{task.priority}</Badge>
                <Badge variant="secondary">{task.status.replace("_", " ")}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks?.length === 0 && (
          <div className="py-12 text-center border rounded-lg bg-card text-muted-foreground">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
}
