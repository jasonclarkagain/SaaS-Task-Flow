import React from "react";
import { useParams, Link } from "wouter";
import {
  useGetProject, getGetProjectQueryKey,
  useListTasks, getListTasksQueryKey,
  useGetProjectProgress, getGetProjectProgressQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  completed: "secondary",
  on_hold: "outline",
  cancelled: "destructive",
};

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

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);

  const { data: project, isLoading: isLoadingProject } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) }
  });
  const { data: tasks, isLoading: isLoadingTasks } = useListTasks({ projectId }, {
    query: { enabled: !!projectId, queryKey: getListTasksQueryKey({ projectId }) }
  });
  const { data: progress, isLoading: isLoadingProgress } = useGetProjectProgress(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectProgressQueryKey(projectId) }
  });

  if (isLoadingProject || isLoadingTasks || isLoadingProgress) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant={statusVariant[project.status] || "secondary"}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            {project.description && (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{project.description}</p>
            )}
            {project.dueDate && (
              <p className="text-sm text-muted-foreground mt-1">
                Due {new Date(project.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shrink-0" data-testid="button-add-task">
                <Plus className="h-4 w-4 mr-1.5" /> Add Task
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
      </div>

      {/* Progress card — full width on mobile, sidebar on desktop */}
      <Card>
        <CardHeader className="p-4 sm:p-5">
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-semibold">{progress?.percentComplete || 0}%</span>
            </div>
            <Progress value={progress?.percentComplete || 0} />
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2 border-t text-center">
            {[
              { label: "Total", value: progress?.total || 0 },
              { label: "To Do", value: progress?.todo || 0 },
              { label: "Active", value: (progress?.inProgress || 0) + (progress?.inReview || 0) },
              { label: "Done", value: progress?.done || 0 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-lg font-semibold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tasks</h2>
        {tasks?.length === 0 ? (
          <div className="py-12 text-center border rounded-lg bg-card text-muted-foreground">
            No tasks in this project yet.
          </div>
        ) : (
          tasks?.map((task) => (
            <Card key={task.id} data-testid={`card-task-${task.id}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm sm:text-base leading-snug">{task.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {statusLabel[task.status] || task.status}
                    </p>
                  </div>
                  <Badge variant={priorityVariant[task.priority] || "outline"} className="shrink-0 text-xs">
                    {task.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
