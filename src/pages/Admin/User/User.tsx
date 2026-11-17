import {
  Eye,
  ShieldCheck,
  UserCheck,
  UserX,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { userApi } from "@/apis/user.api";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DropdownMenu from "@/components/ui/DropdownMenu";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { td, th, tr } from "@/components/ui/Table/TableStyle";
import type { MenuItem } from "@/components/ui/DropdownMenu/DropdownMenu";

import { useDebouncedValue } from "@/hooks/useDebounceValue";
import { useUserQueryConfig } from "@/hooks/useQueryConfig";
import type { User, UserQueryConfig } from "@/types/user.type";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { useUserActions } from "./useUserActions";

export default function User() {
  const navigate = useNavigate();
  const queryConfig = useUserQueryConfig();
  const [, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(queryConfig.search ?? "");
  const [prevSearchParam, setPrevSearchParam] = useState(queryConfig.search);

  if (prevSearchParam !== queryConfig.search) {
    setPrevSearchParam(queryConfig.search);
    setSearchValue(queryConfig.search ?? "");
  }

  const debouncedSearch = useDebouncedValue(searchValue, 350);

  // Cập nhật URL params khi debounce search thay đổi
  useEffect(() => {
    const currentParam = queryConfig.search ?? "";
    const trimmed = debouncedSearch.trim();
    if (trimmed !== currentParam) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) {
          next.set("search", trimmed);
        } else {
          next.delete("search");
        }
        next.set("page", "1");
        return next;
      });
    }
  }, [debouncedSearch, queryConfig.search, setSearchParams]);

  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", queryConfig],
    queryFn: () => userApi.getAllUser(queryConfig as UserQueryConfig),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
  });

  const actions = useUserActions(() => {
    void refetch();
  });

  const listData = usersData?.data?.data;
  const items = listData?.items ?? [];
  const total = Number(listData?.total ?? items.length);
  const page = Number(listData?.page ?? queryConfig.page ?? 1);
  const pageSize = Number(listData?.page_size ?? queryConfig.page_size ?? 10);

  const filtered = Boolean(
    queryConfig.search || queryConfig.role || queryConfig.provider,
  );

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("role", val);
      else next.delete("role");
      next.set("page", "1");
      return next;
    });
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("provider", val);
      else next.delete("provider");
      next.set("page", "1");
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      next.delete("role");
      next.delete("provider");
      next.set("page", "1");
      return next;
    });
  };

  const menuItems = (user: User): MenuItem[] => {
    const self = actions.isSelf(user);
    const isUserAdmin = user.role === "ADMIN";
    const isEnabled = user.enabled !== false;

    return [
      {
        label: "View profile",
        icon: Eye,
        onSelect: () => navigate(`/admin/users/${user.id}`),
      },
      {
        label: isUserAdmin ? "Change to user" : "Make administrator",
        icon: ShieldCheck,
        disabled: self,
        onSelect: () => actions.requestRoleChange(user),
      },
      {
        label: isEnabled ? "Disable account" : "Enable account",
        icon: isEnabled ? UserX : UserCheck,
        tone: isEnabled ? "danger" : "default",
        disabled: self,
        onSelect: () => actions.requestToggle(user),
      },
    ];
  };

  return (
    <div>
      <p className="mb-6 text-sm text-ink-muted">
        Manage accounts, roles and access to the platform.
      </p>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput
            value={searchValue}
            onChange={(v) => setSearchValue(v)}
            placeholder="Search by name or email"
            className="w-full sm:w-72"
          />
          <Select
            label="Filter by role"
            value={queryConfig.role ?? ""}
            onChange={handleRoleChange}
            options={[
              { value: "", label: "All roles" },
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ]}
          />
          <Select
            label="Filter by auth provider"
            value={queryConfig.provider ?? ""}
            onChange={handleProviderChange}
            options={[
              { value: "", label: "All providers" },
              { value: "local", label: "Local" },
              { value: "google", label: "Google" },
            ]}
          />
        </div>

        <div className="border-t border-line">
          {isError && items.length === 0 ? (
            <ErrorState
              message={(error as Error)?.message || "Failed to load users."}
              onRetry={() => refetch()}
            />
          ) : isLoading && items.length === 0 ? (
            <TableSkeleton rows={6} cols={6} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description="Try a different search or clear the filters."
              action={
                filtered ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div
              className={cn(
                "overflow-x-auto transition-opacity",
                isLoading && "opacity-60",
              )}
            >
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr>
                    <th className={th}>Full name</th>
                    <th className={th}>Email</th>
                    <th className={th}>Auth provider</th>
                    <th className={th}>Role</th>
                    <th className={th}>Created at</th>
                    <th className={`${th} w-16 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((user) => {
                    const isUserAdmin = user.role === "ADMIN";
                    const isGoogle = user.authProvider === "GOOGLE";
                    const displayName =
                      user.fullName || user.email?.split("@")[0] || "User";
                    const avatar = user.avatarUrl;
                    const createdAt = user.createdAt;
                    const isSelf = actions.isSelf(user);
                    const isEnabled = user.enabled !== false;

                    return (
                      <tr
                        key={user.id}
                        className={cn(tr, !isEnabled && "bg-slate-50/70")}
                      >
                        <td className={td}>
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="group flex items-center gap-3"
                          >
                            <Avatar name={displayName} src={avatar} size="sm" />
                            <span className="font-medium group-hover:text-primary-700">
                              {displayName}
                            </span>
                            {isSelf && <Badge tone="primary">You</Badge>}
                            {!isEnabled && (
                              <Badge tone="danger">Disabled</Badge>
                            )}
                          </Link>
                        </td>
                        <td className={`${td} text-ink-muted`}>{user.email}</td>
                        <td className={td}>
                          <Badge>{isGoogle ? "Google" : "Local"}</Badge>
                        </td>
                        <td className={td}>
                          <Badge tone={isUserAdmin ? "primary" : "neutral"}>
                            {isUserAdmin ? "Admin" : "User"}
                          </Badge>
                        </td>
                        <td className={`${td} whitespace-nowrap`}>
                          {formatDate(createdAt)}
                        </td>
                        <td className={`${td} text-right`}>
                          <DropdownMenu
                            items={menuItems(user)}
                            label={`Actions for ${displayName}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {total > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      {actions.dialogs}
    </div>
  );
}
