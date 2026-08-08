"use client";
import UserDetailModal from "@/components/admin/UserDetailModal";
import { Eye } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { listUsers, banUser, unbanUser, updateUserRole } from "@/services/adminService";

const ROLES = ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState(null); // { user, action: "ban"|"unban" }
const [viewUserId, setViewUserId] = useState(null);
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers({ page, size: 20, search });
      setUsers(result.users);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      toast.success("Role updated.");
      fetchUsers();
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    const { user, action } = confirmTarget;
    try {
      if (action === "ban") await banUser(user.id);
      else await unbanUser(user.id);
      toast.success(action === "ban" ? "User banned." : "User unbanned.");
      fetchUsers();
    } catch {
      toast.error(`Failed to ${action} user.`);
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-gray-500">View, promote, and moderate platform users.</p>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setPage(0); setSearch(e.target.value); }}
        className="max-w-sm"
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try a different search term." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                 <select
  value={u.role}
  onChange={(e) => handleRoleChange(u.id, e.target.value)}
  className="bg-white text-gray-900 dark:bg-[#161b22] dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] rounded px-2 py-1 text-sm"
>
  {ROLES.map((r) => (
    <option key={r} value={r} className="bg-white text-gray-900 dark:bg-[#161b22] dark:text-[#e6edf3]">
      {r}
    </option>
  ))}
</select>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isBanned ? "destructive" : u.isActive ? "default" : "secondary"}>
                    {u.isBanned ? "Banned" : u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setViewUserId(u.id)}>
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant={u.isBanned ? "outline" : "destructive"}
                      onClick={() => setConfirmTarget({ user: u, action: u.isBanned ? "unban" : "ban" })}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
      

      <ConfirmDialog
  isOpen={!!confirmTarget}
  onClose={() => setConfirmTarget(null)}
  title={confirmTarget?.action === "ban" ? "Ban this user?" : "Unban this user?"}
  description="This action can be reversed later."
  onConfirm={handleConfirmAction}
  confirmLabel={confirmTarget?.action === "ban" ? "Ban" : "Unban"}
  variant={confirmTarget?.action === "ban" ? "danger" : "info"}
/>
{viewUserId && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
    <div className="bg-white p-6 rounded-xl">
      <p>Inline test modal for user {viewUserId}</p>
      <button onClick={() => setViewUserId(null)}>Close</button>
    </div>
  </div>
)}
    </div>
  );
}