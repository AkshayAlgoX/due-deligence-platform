"use client";

import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

const ROLES = [
  "BUYER",
  "REAL_ESTATE_AGENT",
  "LEGAL_REVIEWER",
  "FINANCIAL_INSTITUTION",
  "ADMIN",
];

export default function UserManagementTable({
  users,
  loading,
  search,
  setSearch,
  setPage,
  page,
  totalPages,
  onRoleChange,
  onAction,
  onView,
}) {
  const { t } = useTranslation();
  return (
    <>
      <Input
        placeholder={t("nav.admin.userManagement.searchPlaceholder")}
        value={search}
        onChange={(e) => {
          setPage(0);
          setSearch(e.target.value);
        }}
        className="max-w-sm"
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : users.length === 0 ? (
        <EmptyState
          title={t("nav.admin.userManagement.noUsers")}
          description={t("nav.admin.userManagement.tryDifferentSearch")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("nav.admin.userManagement.name")}</TableHead>
              <TableHead>{t("nav.admin.userManagement.email")}</TableHead>
              <TableHead>{t("nav.admin.userManagement.role")}</TableHead>
              <TableHead>{t("nav.admin.userManagement.status")}</TableHead>
              <TableHead className="text-right">{t("nav.admin.userManagement.actions")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.fullName}</TableCell>

                <TableCell>{u.email}</TableCell>

                <TableCell>
                  <Select
                    value={u.role}
                    onValueChange={(value) => onRoleChange(u.id, value)}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-auto min-w-[10rem] bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d] text-gray-900 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] focus-visible:ring-green-500"
                    >
                      {u.role}
                    </SelectTrigger>
                    <SelectContent align="start">
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      u.isBanned
                        ? "destructive"
                        : u.isActive
                          ? "default"
                          : "secondary"
                    }
                  >
                    {u.isBanned
                      ? t("nav.admin.userManagement.banned")
                      : u.isActive
                        ? t("nav.admin.userManagement.active")
                        : t("nav.admin.userManagement.inactive")}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(u.id)}
                    >
                      <Eye size={16} className="mr-1" />
                      {t("nav.admin.userManagement.view")}
                    </Button>

                    <Button
                      size="sm"
                      variant={u.isBanned ? "outline" : "destructive"}
                      onClick={() =>
                        onAction({
                          user: u,
                          action: u.isBanned ? "unban" : "ban",
                        })
                      }
                    >
                      {u.isBanned
                        ? t("nav.admin.userManagement.unban")
                        : t("nav.admin.userManagement.ban")}
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
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("nav.admin.userManagement.prev")}
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("nav.admin.userManagement.next")}
          </Button>
        </div>
      )}
    </>
  );
}