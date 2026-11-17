import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import Tooltip from "@/components/ui/ToolTip";
import { NAV_ENTRIES, isNavGroup, type NavGroup } from "@/constants/nav-config";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  end?: boolean;
  nested?: boolean;
  forceActive?: boolean;
  onNavigate?: () => void;
}

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
  end,
  nested,
  forceActive,
  onNavigate,
}: NavItemProps) {
  return (
    <Tooltip label={label} disabled={!collapsed}>
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        aria-label={label}
        className={({ isActive }) =>
          cn(
            "relative flex h-10 w-full items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors",
            collapsed && "justify-center px-0",
            nested && !collapsed && "h-9 pl-10",
            isActive || forceActive
              ? "bg-primary-50 text-primary-700"
              : "text-ink-muted hover:bg-slate-100 hover:text-ink",
          )
        }
      >
        {({ isActive }) => (
          <>
            {(isActive || forceActive) && (
              <span
                aria-hidden
                className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary-600"
              />
            )}
            {(!nested || collapsed) && (
              <Icon className="size-[18px] shrink-0" />
            )}
            {!collapsed && <span className="truncate">{label}</span>}
          </>
        )}
      </NavLink>
    </Tooltip>
  );
}

function NavGroupItem({
  group,
  collapsed,
  onNavigate,
}: {
  group: NavGroup;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);
  const active = group.children.some((child) => pathname.startsWith(child.to));
  const GroupIcon = group.icon;

  // Thu gọn: chỉ hiện icon của nhóm, bấm vào đi tới mục con đầu tiên
  if (collapsed) {
    return (
      <NavItem
        to={group.children[0].to}
        icon={group.icon}
        label={group.label}
        collapsed
        forceActive={active}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors hover:bg-slate-100",
          active ? "text-ink" : "text-ink-muted",
        )}
      >
        <GroupIcon className="size-[18px] shrink-0" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", !open && "-rotate-90")}
        />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {group.children.map((child) => (
            <NavItem
              key={child.to}
              {...child}
              nested
              collapsed={false}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main" className="flex-1 space-y-1 px-3 py-4">
      {NAV_ENTRIES.map((entry) =>
        isNavGroup(entry) ? (
          <NavGroupItem
            key={entry.label}
            group={entry}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ) : (
          <NavItem
            key={entry.to}
            {...entry}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ),
      )}
    </nav>
  );
}
