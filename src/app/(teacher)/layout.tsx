import { requireTeacher } from "@/server/auth";
import { NavBar } from "@/components/nav-bar";
import { TEACHER_NAV_LINKS } from "@/lib/nav-links";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeacher();

  return (
    <div className="min-h-screen bg-bg">
      <NavBar user={user} links={TEACHER_NAV_LINKS} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
