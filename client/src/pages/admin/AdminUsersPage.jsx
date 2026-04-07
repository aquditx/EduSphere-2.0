import { PageShell } from "@/components/layout/PageShell.jsx";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import Select from "@/components/ui/Select.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useState } from "react";
import { useUpdateUser, useUsers } from "@/hooks/useUsers.js";

export default function AdminUsersPage() {
  const [filters, setFilters] = useState({ role: "all", search: "" });
  const usersQuery = useUsers(filters);
  const updateUserMutation = useUpdateUser();

  if (usersQuery.isLoading) {
    return <PageShell title="Admin users" subtitle="Review and manage learner, instructor, and admin accounts."><Spinner label="Loading users" /></PageShell>;
  }

  if (usersQuery.isError) {
    return <PageShell title="Admin users" subtitle="Review and manage learner, instructor, and admin accounts."><ErrorState message={usersQuery.error.message} onAction={() => usersQuery.refetch()} /></PageShell>;
  }

  return (
    <PageShell title="Admin users" subtitle="Review and manage learner, instructor, and admin accounts.">
      <section className="surface p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Search users" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
          <Select label="Role" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}>
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </section>
      <section className="surface overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.data.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4 capitalize text-slate-600">{user.role}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    {user.role !== "admin" ? (
                      <Button variant="secondary" onClick={() => updateUserMutation.mutate({ userId: user.id, payload: { role: "admin" } })}>Promote</Button>
                    ) : null}
                    {user.role !== "student" ? (
                      <Button variant="secondary" onClick={() => updateUserMutation.mutate({ userId: user.id, payload: { role: "student" } })}>Make student</Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}

