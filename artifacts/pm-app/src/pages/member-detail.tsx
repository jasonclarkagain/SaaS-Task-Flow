import React from "react";
import { useParams, Link } from "wouter";
import { useGetMember, getGetMemberQueryKey, useListTasks, getListTasksQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

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

export default function MemberDetail() {
  const { id } = useParams();
  const memberId = Number(id);

  const { data: member, isLoading: isLoadingMember } = useGetMember(memberId, {
    query: { enabled: !!memberId, queryKey: getGetMemberQueryKey(memberId) }
  });
  const { data: tasks, isLoading: isLoadingTasks } = useListTasks({ assigneeId: memberId }, {
    query: { enabled: !!memberId, queryKey: getListTasksQueryKey({ assigneeId: memberId }) }
  });

  if (isLoadingMember || isLoadingTasks) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!member) return <div className="p-8">Member not found</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <Link href="/members" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Team
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 sm:h-20 sm:w-20 shrink-0">
          <AvatarImage src={member.avatarUrl || ""} />
          <AvatarFallback className="text-lg sm:text-2xl">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">{member.name}</h1>
          <p className="text-muted-foreground text-sm sm:text-base truncate">{member.role || "Member"}</p>
          <p className="text-muted-foreground text-xs sm:text-sm truncate">{member.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Assigned Tasks
          {tasks && tasks.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({tasks.length})</span>
          )}
        </h2>
        {tasks?.length === 0 ? (
          <div className="py-12 text-center border rounded-lg bg-card text-muted-foreground">
            No tasks assigned to this member.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tasks?.map((task) => (
              <Card key={task.id} data-testid={`card-task-${task.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm leading-snug">{task.title}</h3>
                    <Badge variant={priorityVariant[task.priority] || "outline"} className="text-xs shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {statusLabel[task.status] || task.status}
                  </Badge>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
