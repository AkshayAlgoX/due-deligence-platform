"use client";
import { useTranslation } from "react-i18next";
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
    <>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("nav.admin.userManagement.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-[#7d8590]">
            {t("nav.admin.userManagement.subtitle")}
          </p>
        </div>

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
    </>
  );
}
