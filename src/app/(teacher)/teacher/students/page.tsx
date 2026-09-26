import Link from "next/link";
import { listStudents } from "@/server/users";
import { NewStudentForm } from "./new-student-form";

export default async function TeacherStudentsPage() {
  const students = await listStudents();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Students</h1>
        <p className="mt-1 text-sm text-muted">
          Create accounts for your students. They'll sign in with the username and password you set.
        </p>
      </div>

      <div className="border border-line bg-surface p-5">
        <NewStudentForm />
      </div>

      <div className="overflow-x-auto border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Display name</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-surface-hover">
                <td className="px-4 py-3">
                  <Link
                    href={`/teacher/students/${s.id}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {s.display_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{s.username}</td>
                <td className="px-4 py-3 text-muted">{s.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
