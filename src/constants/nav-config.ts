import {
  BookOpen,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavLeaf {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export type NavEntry = NavLeaf | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup =>
  "children" in entry;

export const NAV_ENTRIES: NavEntry[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  {
    label: "Knowledge Base",
    icon: BookOpen,
    children: [
      { label: "Documents", to: "/admin/knowledge-base", icon: FileText },
    ],
  },
  { label: "Conversations", to: "/admin/conversations", icon: MessagesSquare },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];
