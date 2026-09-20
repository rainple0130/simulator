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

export function findUserByUsername(username: string): UserRow | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as UserRow | undefined;
  return row ?? null;
}

export function listStudents(): UserRow[] {
  return getDb()
    .prepare("SELECT * FROM users WHERE role = 'student' ORDER BY display_name")
    .all() as UserRow[];
}

export function getUserById(id: string): UserRow | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
  return row ?? null;
}

export interface CreateStudentInput {
  username: string;
  password: string;
  displayName: string;
}

export function createStudent(input: CreateStudentInput): { ok: true; id: string } | { ok: false; error: string } {
  const username = input.username.trim();
  const displayName = input.displayName.trim();

  if (!username || !displayName) {
    return { ok: false, error: "Username and display name are required." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (findUserByUsername(username)) {
    return { ok: false, error: "That username is already taken." };
  }

  const id = crypto.randomUUID();
  getDb()
    .prepare(
      "INSERT INTO users (id, username, password_hash, role, display_name) VALUES (?, ?, ?, 'student', ?)"
    )
    .run(id, username, hashPassword(input.password), displayName);

  return { ok: true, id };
}
