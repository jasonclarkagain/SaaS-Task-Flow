import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import {
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  ListTasksQueryParams,
} from "@workspace/api-zod";

const router = Router();

function serializeTask(t: typeof tasksTable.$inferSelect) {
  return {
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

router.get("/tasks/overdue", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        isNotNull(tasksTable.dueDate),
        lte(tasksTable.dueDate, today)
      )
    )
    .orderBy(tasksTable.dueDate);
  const overdue = tasks.filter(t => t.status !== "done");
  res.json(overdue.map(serializeTask));
});

router.get("/tasks", async (req, res) => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  const conditions = [];
  if (parsed.success) {
    const { projectId, assigneeId, status, priority } = parsed.data;
    if (projectId) conditions.push(eq(tasksTable.projectId, Number(projectId)));
    if (assigneeId) conditions.push(eq(tasksTable.assigneeId, Number(assigneeId)));
    if (status) conditions.push(eq(tasksTable.status, status));
    if (priority) conditions.push(eq(tasksTable.priority, priority));
  }
  const tasks = conditions.length > 0
    ? await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.createdAt)
    : await db.select().from(tasksTable).orderBy(tasksTable.createdAt);
  res.json(tasks.map(serializeTask));
});

router.post("/tasks", async (req, res) => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [task] = await db.insert(tasksTable).values({
    ...parsed.data,
    updatedAt: new Date(),
  }).returning();
  res.status(201).json(serializeTask(task));
});

router.get("/tasks/:id", async (req, res) => {
  const parsed = GetTaskParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, parsed.data.id));
  if (!task) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeTask(task));
});

router.patch("/tasks/:id", async (req, res) => {
  const paramParsed = UpdateTaskParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [task] = await db
    .update(tasksTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tasksTable.id, paramParsed.data.id))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeTask(task));
});

router.delete("/tasks/:id", async (req, res) => {
  const parsed = DeleteTaskParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(tasksTable).where(eq(tasksTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
