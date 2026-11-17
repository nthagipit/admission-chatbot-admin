import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { cn } from "@/utils/cn";
import Avatar from "@/components/ui/Avatar";
import Tooltip from "@/components/ui/ToolTip";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Logo from "@/components/Logo";
import SidebarNav from "../SidebarNav";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const iconButton =
  "flex size-8 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink";

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Trên tablet, drawer luôn hiển thị dạng đầy đủ
  const compact = collapsed && isDesktop;
  const name = "Administrator";

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {mobileOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        aria-label="Sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-[width,transform] duration-200",
          compact && "lg:w-[72px]",
          mobileOpen ? "translate-x-0 shadow-pop" : "-translate-x-full",
          "lg:translate-x-0 lg:shadow-none",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-line px-4",
            compact ? "justify-center" : "justify-between",
          )}
        >
          <Logo compact={compact} />
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className={cn(iconButton, "lg:hidden")}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nút thu gọn nằm trên mép sidebar (chỉ desktop) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-5 -right-3 hidden size-6 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-card transition-colors hover:text-ink lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>

        <SidebarNav collapsed={compact} onNavigate={onCloseMobile} />

        <div className="shrink-0 border-t border-line p-3">
          {compact ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip label={`${name} · Administrator`}>
                <Avatar
                  name={name}
                  src="https://static.vecteezy.com/system/resources/previews/023/506/852/non_2x/cute-kawaii-mushroom-chibi-mascot-cartoon-style-vector.jpg"
                />
              </Tooltip>
              <Tooltip label="Log out">
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className={iconButton}
                >
                  <LogOut className="size-[18px]" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar
                name={name}
                src="https://static.vecteezy.com/system/resources/previews/023/506/852/non_2x/cute-kawaii-mushroom-chibi-mascot-cartoon-style-vector.jpg"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-ink">{name}</p>
                <p className="truncate text-xs text-ink-muted">Administrator</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className={iconButton}
              >
                <LogOut className="size-[18px]" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
