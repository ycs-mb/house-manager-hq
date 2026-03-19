"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CheckSquare,
  Wallet,
  ThumbsUp,
  Settings,
  LogOut,
  Home,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/dashboard/chores", label: "Chores", icon: CheckSquare },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/approvals", label: "Approvals", icon: ThumbsUp },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-screen w-64 flex-col bg-brand-navy text-white shrink-0 md:w-16 lg:w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5 lg:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue">
          <Home className="h-5 w-5 text-white" />
        </div>
        <span className="hidden text-sm font-semibold tracking-wide text-white lg:block">
          Casa Yash HQ
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 lg:px-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-blue text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                  title={label}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:block">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-white/10 px-2 py-4 lg:px-3">
        {session?.user?.email && (
          <div className="mb-2 hidden rounded-lg bg-white/5 px-3 py-2 lg:block">
            <p className="truncate text-xs text-white/60">Signed in as</p>
            <p className="truncate text-sm font-medium text-white">
              {session.user.email}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          title="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden lg:block">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
