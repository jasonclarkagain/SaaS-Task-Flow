import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/members", label: "Team", icon: Users },
];

function NavLinks({ location, onNav }: { location: string; onNav?: () => void }) {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNav}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            location === item.href || (item.href !== "/" && location.startsWith(item.href))
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          }`}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r bg-sidebar">
        <div className="flex h-14 items-center px-6 border-b">
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">Flowdesk</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLinks location={location} />
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-5 border-b">
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">Flowdesk</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground"
            data-testid="button-close-menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLinks location={location} onNav={() => setMobileOpen(false)} />
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted"
            data-testid="button-open-menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-base font-bold tracking-tight">Flowdesk</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
