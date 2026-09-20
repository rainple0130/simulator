import { requireUser } from "@/server/auth";
import { NavBar } from "@/components/nav-bar";
import { STUDENT_NAV_LINKS, TEACHER_NAV_LINKS } from "@/lib/nav-links";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Teachers land on some of these routes too (e.g. /reports/[attemptId] when viewing a
  // student's attempt), so the nav should reflect their actual role, not this group's name.
  const links = user.role === "teacher" ? TEACHER_NAV_LINKS : STUDENT_NAV_LINKS;

  return (
    <div className="min-h-screen bg-bg">
      <NavBar user={user} links={links} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
