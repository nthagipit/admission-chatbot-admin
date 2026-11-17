import { Bell, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import UserMenu from "../UserMenu";
import { getPageMeta } from "@/utils/route-meta";

export function Header({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { pathname } = useLocation();
  const { title, crumbs } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <Breadcrumb items={crumbs} />
        <h1 className="truncate text-lg leading-tight font-semibold text-ink">
          {title}
        </h1>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex size-9 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
      >
        <Bell className="size-[18px]" />
        <span
          aria-hidden
          className="absolute top-2 right-2 size-2 rounded-full bg-primary-600 ring-2 ring-surface"
        />
      </button>
      <UserMenu />
    </header>
  );
}
