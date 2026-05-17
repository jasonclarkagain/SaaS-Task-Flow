import React from "react";
import { useParams } from "wouter";
import { useGetMember, getGetMemberQueryKey, useListTasks, getListTasksQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="p-8 space-y-6">
        <Skeleton className="h-24 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!member) return <div>Member not found</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={member.avatarUrl || ""} />
          <AvatarFallback className="text-2xl">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{member.name}</h1>
          <p className="text-muted-foreground text-lg">{member.role || "Member"} • {member.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Assigned Tasks</h2>
        {tasks?.length === 0 ? (
          <div className="py-12 text-center border rounded-lg bg-card text-muted-foreground">
            No tasks assigned to this member.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks?.map(task => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge variant="outline">{task.priority}</Badge>
                  </div>
                  <Badge variant="secondary">{task.status.replace("_", " ")}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
