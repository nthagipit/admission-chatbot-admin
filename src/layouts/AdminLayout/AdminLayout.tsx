import Header from "@/pages/Admin/components/Header";
import Sidebar from "@/pages/Admin/components/Sidebar";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const COLLAPSE_KEY = "admission-admin:sidebar-collapsed";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const toggleCollapse = () => {
    setCollapsed((value) => {
      localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      return !value;
    });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64",
        )}
      >
        <Header onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
