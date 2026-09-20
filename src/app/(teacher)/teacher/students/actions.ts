"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/server/auth";
import { createStudent } from "@/server/users";

export async function createStudentAction(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  await requireTeacher();

  const result = createStudent({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/teacher/students");
  return { success: `Student account "${formData.get("username")}" created.` };
}
