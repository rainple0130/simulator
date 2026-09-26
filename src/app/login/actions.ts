"use server";

import { redirect } from "next/navigation";
import { createSession, verifyPassword } from "@/server/auth";
import { findUserByUsername } from "@/server/users";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = username ? await findUserByUsername(username) : null;
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Invalid username or password." };
  }

  await createSession(user.id);
  redirect(user.role === "teacher" ? "/teacher" : "/library");
}
