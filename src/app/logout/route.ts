import { redirect } from "next/navigation";
import { destroySession } from "@/server/auth";

export async function POST() {
  await destroySession();
  redirect("/login");
}
