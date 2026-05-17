import { Router } from "express";
import { db } from "@workspace/db";
import { membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateMemberBody,
  UpdateMemberBody,
  GetMemberParams,
  UpdateMemberParams,
  DeleteMemberParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/members", async (req, res) => {
  const members = await db.select().from(membersTable).orderBy(membersTable.createdAt);
  res.json(members.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/members", async (req, res) => {
  const parsed = CreateMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [member] = await db.insert(membersTable).values(parsed.data).returning();
  res.status(201).json({ ...member, createdAt: member.createdAt.toISOString() });
});

router.get("/members/:id", async (req, res) => {
  const parsed = GetMemberParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, parsed.data.id));
  if (!member) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...member, createdAt: member.createdAt.toISOString() });
});

router.patch("/members/:id", async (req, res) => {
  const paramParsed = UpdateMemberParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [member] = await db
    .update(membersTable)
    .set(parsed.data)
    .where(eq(membersTable.id, paramParsed.data.id))
    .returning();
  if (!member) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...member, createdAt: member.createdAt.toISOString() });
});

router.delete("/members/:id", async (req, res) => {
  const parsed = DeleteMemberParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(membersTable).where(eq(membersTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
