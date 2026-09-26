import "server-only";
import crypto from "node:crypto";
import { getDb } from "./db";
import { hashPassword } from "./auth";

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: "student" | "teacher";
  display_name: string;
  created_at: string;
}

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE username = ?",
    args: [username],
  });
  return (result.rows[0] as unknown as UserRow) ?? null;
}

export async function listStudents(): Promise<UserRow[]> {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM users WHERE role = 'student' ORDER BY display_name");
  return result.rows as unknown as UserRow[];
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const db = await getDb();
  const result = await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [id] });
  return (result.rows[0] as unknown as UserRow) ?? null;
}

export interface CreateStudentInput {
  username: string;
  password: string;
  displayName: string;
}

export async function createStudent(
  input: CreateStudentInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const username = input.username.trim();
  const displayName = input.displayName.trim();

  if (!username || !displayName) {
    return { ok: false, error: "Username and display name are required." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (await findUserByUsername(username)) {
    return { ok: false, error: "That username is already taken." };
  }

  const id = crypto.randomUUID();
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO users (id, username, password_hash, role, display_name) VALUES (?, ?, ?, 'student', ?)",
    args: [id, username, hashPassword(input.password), displayName],
  });

  return { ok: true, id };
}
