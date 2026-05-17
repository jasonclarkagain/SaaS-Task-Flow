import React from "react";
import { useListMembers, getListMembersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MemberForm } from "@/components/member-form";
import { Link } from "wouter";

export default function Members() {
  const { data: members, isLoading } = useListMembers(undefined, {
    query: { queryKey: getListMembersQueryKey() }
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Members</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardHeader>
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage people in your workspace.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0" data-testid="button-add-member">
              <Plus className="h-4 w-4 mr-1.5" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <MemberForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members?.map((member) => (
          <Link key={member.id} href={`/members/${member.id}`} className="block" data-testid={`card-member-${member.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={member.avatarUrl || ""} />
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-semibold truncate">{member.name}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">{member.role || "Member"}</p>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs truncate text-muted-foreground">{member.email}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {members?.length === 0 && (
          <div className="col-span-full py-16 text-center border rounded-lg bg-card text-muted-foreground">
            No team members yet.
          </div>
        )}
      </div>
    </div>
  );
}
