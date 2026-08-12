"use client";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import useUserManagement from "@/hooks/useUserManagement";
import UserManagementTable from "@/components/admin/UserManagementTable";
import UserDetailModal from "@/components/admin/UserDetailModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const {
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
    handleRoleChange,
    handleConfirmAction,
  } = useUserManagement();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        <header className="flex items-start gap-4">
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border border-blue-500/20">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              {t("nav.admin.userManagement.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
              {t("nav.admin.userManagement.subtitle")}
            </p>
          </div>
        </header>

        <UserManagementTable
          users={users}
          loading={loading}
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          page={page}
          totalPages={totalPages}
          onRoleChange={handleRoleChange}
          onAction={setConfirmTarget}
          onView={setViewUserId}
        />

        <ConfirmDialog
          isOpen={!!confirmTarget}
          onClose={() => setConfirmTarget(null)}
          title={
            confirmTarget?.action === "ban"
              ? t("nav.admin.confirm.banTitle")
              : t("nav.admin.confirm.unbanTitle")
          }
          description={t("nav.admin.confirm.description")}
          onConfirm={handleConfirmAction}
          confirmLabel={
            confirmTarget?.action === "ban"
              ? t("nav.admin.userManagement.ban")
              : t("nav.admin.userManagement.unban")
          }
          variant={confirmTarget?.action === "ban" ? "danger" : "info"}
        />

        <UserDetailModal
          userId={viewUserId}
          isOpen={!!viewUserId}
          onClose={() => setViewUserId(null)}
        />
      </div>
    </div>
  );
}