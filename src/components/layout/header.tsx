"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-accent"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
          Sistem Booking Ruang Meeting
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(session.user as Record<string, unknown>).role === "admin" ? "Administrator" : "Pengguna"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
