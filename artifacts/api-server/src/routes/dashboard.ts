import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, tasksTable, membersTable, activityTable } from "@workspace/db";
import { eq, lte, isNotNull, and } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  const [projects, tasks, members] = await Promise.all([
    db.select().from(projectsTable),
    db.select().from(tasksTable),
    db.select().from(membersTable),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter(
    t => t.status !== "done" && t.dueDate != null && t.dueDate <= today
  ).length;

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    in_review: tasks.filter(t => t.status === "in_review").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  res.json({
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === "active").length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "done").length,
    overdueTasks,
    totalMembers: members.length,
    tasksByStatus,
  });
});

router.get("/dashboard/activity", async (req, res) => {
  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(activityTable.createdAt)
    .limit(20);

  res.json(activity.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  })).reverse());
});

export default router;
