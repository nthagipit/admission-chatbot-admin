import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import Avatar from "@/components/ui/Avatar";

export function UserMenu() {
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = "Administrator";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
  };

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-sm text-ink transition-colors hover:bg-slate-100";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-control p-1 pr-2 transition-colors hover:bg-slate-100"
      >
        <Avatar
          name={name}
          src={
            "https://static.vecteezy.com/system/resources/previews/023/506/852/non_2x/cute-kawaii-mushroom-chibi-mascot-cartoon-style-vector.jpg"
          }
          size="sm"
        />
        <span className="hidden max-w-40 truncate text-sm font-medium text-ink md:block">
          {name}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-ink-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-card border border-line bg-surface p-1.5 shadow-pop"
        >
          <div className="border-b border-line px-3 pt-2 pb-3">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-ink-muted">Email</p>
          </div>
          <div className="pt-1.5">
            <Link
              to="/admin/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Settings className="size-4 text-ink-muted" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className={itemClass}
            >
              <LogOut className="size-4 text-ink-muted" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
