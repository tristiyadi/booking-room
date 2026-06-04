"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-accent/50 animate-pulse border border-border/50" />
    );
  }

  const changeTheme = (targetTheme: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(false);
    
    if (theme === targetTheme) return;

    // Fallback if Document View Transition is not supported
    if (!(document as any).startViewTransition) {
      setTheme(targetTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setTheme(targetTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const getActiveIcon = () => {
    if (theme === "system") return <Monitor className="w-4 h-4 text-blue-500" />;
    return resolvedTheme === "dark" ? (
      <Moon className="w-4 h-4 text-indigo-400" />
    ) : (
      <Sun className="w-4 h-4 text-amber-500" />
    );
  };

  const themeOptions = [
    { value: "light", label: "Terang", icon: Sun, iconColor: "text-amber-500" },
    { value: "dark", label: "Gelap", icon: Moon, iconColor: "text-indigo-400" },
    { value: "system", label: "Sistem", icon: Monitor, iconColor: "text-blue-500" },
  ];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-all border border-border flex items-center justify-center relative overflow-hidden active:scale-95 z-50"
        aria-label="Pilih tema"
        title="Pilih tema"
      >
        {getActiveIcon()}
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown on click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu Panel */}
          <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={(e) => changeTheme(opt.value, e)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                    isSelected
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
