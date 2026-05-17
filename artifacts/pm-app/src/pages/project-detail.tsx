import React from "react";
import { useParams, Link } from "wouter";
import { useGetProject, getGetProjectQueryKey, useListTasks, getListTasksQueryKey, useGetProjectProgress, getGetProjectProgressQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);

  const { data: project, isLoading: isLoadingProject } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) }
  });

  const { data: tasks, isLoading: isLoadingTasks } = useListTasks({ projectId }, {
    query: { enabled: !!projectId, queryKey: getListTasksQueryKey({ projectId }) }
  });

  const { data: progress, isLoading: isLoadingProgress } = useGetProjectProgress(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectProgressQueryKey(projectId) }
  });

  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);

  if (isLoadingProject || isLoadingTasks || isLoadingProgress) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === "active" ? "default" : "secondary"}>
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">{project.description}</p>
        </div>
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task to {project.name}</DialogTitle>
            </DialogHeader>
            <TaskForm projectId={project.id} onSuccess={() => setIsTaskDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
          {tasks?.length === 0 ? (
            <div className="py-12 text-center border rounded-lg bg-card text-muted-foreground">
              No tasks in this project yet.
            </div>
          ) : (
            tasks?.map(task => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.status.replace("_", " ")}</p>
                  </div>
                  <Badge variant="outline">{task.priority}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium">{progress?.percentComplete || 0}%</span>
                </div>
                <Progress value={progress?.percentComplete || 0} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                <div>
                  <span className="text-muted-foreground">Total</span>
                  <div className="text-lg font-medium">{progress?.total || 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Done</span>
                  <div className="text-lg font-medium">{progress?.done || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
