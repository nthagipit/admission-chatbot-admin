import { useState } from "react";
import { userApi } from "@/apis/user.api";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import type { UserRole } from "@/types/auth.type";
import type { User } from "@/types/user.type";
import { getErrorMessage } from "@/utils/api-error";
import { getProfileFromLS } from "@/utils/auth";

/** Xử lý Change Role / Enable-Disable kèm dialog xác nhận. */
export function useUserActions(onChanged: () => void) {
  const toast = useToast();
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const me = getProfileFromLS();
  const isSelf = (user: User) =>
    Boolean(
      (me?.id && user.id === me.id) ||
        (me?.email && user.email === me.email),
    );

  const getUserName = (u: User | null) =>
    u?.fullName || u?.email?.split("@")[0] || "User";

  const isUserEnabled = (u: User | null) => u?.enabled !== false;

  const isUserAdmin = (u: User | null) =>
    String(u?.role).toUpperCase() === "ADMIN";

  const confirmRole = async () => {
    if (!roleTarget) return;
    const next: UserRole = isUserAdmin(roleTarget) ? "USER" : "ADMIN";
    setBusy(true);
    try {
      await userApi.updateUser(roleTarget.id, { role: next });
      toast.success(
        `${getUserName(roleTarget)} is now ${next === "ADMIN" ? "an administrator" : "a regular user"}.`,
      );
      setRoleTarget(null);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmToggle = async () => {
    if (!toggleTarget) return;
    const currentEnabled = isUserEnabled(toggleTarget);
    setBusy(true);
    try {
      await userApi.updateUser(toggleTarget.id, { enabled: !currentEnabled });
      toast.success(
        `${getUserName(toggleTarget)}'s account ${currentEnabled ? "disabled" : "enabled"}.`,
      );
      setToggleTarget(null);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const promoting = !isUserAdmin(roleTarget);
  const disabling = isUserEnabled(toggleTarget);

  const dialogs = (
    <>
      <ConfirmDialog
        open={!!roleTarget}
        title={promoting ? "Make administrator?" : "Remove administrator access?"}
        description={
          promoting
            ? `${getUserName(roleTarget)} will be able to manage documents, conversations and users.`
            : `${getUserName(roleTarget)} will no longer be able to open the admin dashboard.`
        }
        confirmLabel={promoting ? "Make administrator" : "Change to user"}
        tone={promoting ? "primary" : "danger"}
        loading={busy}
        onConfirm={confirmRole}
        onCancel={() => setRoleTarget(null)}
      />
      <ConfirmDialog
        open={!!toggleTarget}
        title={disabling ? "Disable account?" : "Enable account?"}
        description={
          disabling
            ? `${getUserName(toggleTarget)} won't be able to sign in until the account is enabled again.`
            : `${getUserName(toggleTarget)} will be able to sign in again.`
        }
        confirmLabel={disabling ? "Disable account" : "Enable account"}
        tone={disabling ? "danger" : "primary"}
        loading={busy}
        onConfirm={confirmToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </>
  );

  return {
    requestRoleChange: setRoleTarget,
    requestToggle: setToggleTarget,
    isSelf,
    dialogs,
  };
}
