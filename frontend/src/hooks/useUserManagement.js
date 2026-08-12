"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listUsers,
  banUser,
  unbanUser,
  updateUserRole,
} from "@/services/adminService";

export default function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const result = await listUsers({
        page,
        size: 20,
        search,
      });

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
      if (action === "ban") {
        await banUser(user.id);
      } else {
        await unbanUser(user.id);
      }

      toast.success(
        action === "ban" ? "User banned." : "User unbanned."
      );

      fetchUsers();
    } catch {
      toast.error(`Failed to ${action} user.`);
    } finally {
      setConfirmTarget(null);
    }
  };

  return {
    users,
    loading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    confirmTarget,
    setConfirmTarget,
    viewUserId,
    setViewUserId,
    fetchUsers,
    handleRoleChange,
    handleConfirmAction,
  };
}