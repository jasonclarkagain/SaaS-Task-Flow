import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, tasksTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  GetProjectProgressParams,
  ListProjectsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function serializeProject(p: typeof projectsTable.$inferSelect) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/projects", async (req, res) => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  const conditions = [];
  if (parsed.success && parsed.data.status) {
    conditions.push(eq(projectsTable.status, parsed.data.status));
  }
  const projects = conditions.length > 0
    ? await db.select().from(projectsTable).where(and(...conditions)).orderBy(projectsTable.createdAt)
    : await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  res.json(projects.map(serializeProject));
});

router.post("/projects", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [project] = await db.insert(projectsTable).values({
    ...parsed.data,
    updatedAt: new Date(),
  }).returning();
  res.status(201).json(serializeProject(project));
});

router.get("/projects/:id", async (req, res) => {
  const parsed = GetProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, parsed.data.id));
  if (!project) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeProject(project));
});

router.patch("/projects/:id", async (req, res) => {
  const paramParsed = UpdateProjectParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [project] = await db
    .update(projectsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projectsTable.id, paramParsed.data.id))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeProject(project));
});

router.delete("/projects/:id", async (req, res) => {
  const parsed = DeleteProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(projectsTable).where(eq(projectsTable.id, parsed.data.id));
  res.status(204).send();
});

router.get("/projects/:id/progress", async (req, res) => {
  const parsed = GetProjectProgressParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, parsed.data.id));
  const total = tasks.length;
  const todo = tasks.filter(t => t.status === "todo").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const inReview = tasks.filter(t => t.status === "in_review").length;
  const done = tasks.filter(t => t.status === "done").length;
  const percentComplete = total > 0 ? Math.round((done / total) * 100) : 0;
  res.json({ projectId: parsed.data.id, total, todo, inProgress, inReview, done, percentComplete });
});

export default router;
