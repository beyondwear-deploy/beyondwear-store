"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton } from "@/components/ui/Button";

type Theme = "light" | "dark";
const KEY = "sequelcloset.theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    setTheme((document.documentElement.getAttribute("data-theme") as Theme) || "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch {}
    setTheme(next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 700);
  };
  const isDark = theme === "dark";
  return (
    <IconButton label={isDark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle} className={className} aria-pressed={isDark}>
      <span className="relative grid size-5 place-items-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={isDark ? "moon" : "sun"} initial={{ y: 14, rotate: -50, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} exit={{ y: -14, rotate: 50, opacity: 0 }} transition={{ duration: 0.28 }} className="absolute">
            {isDark ? <Moon className="size-5" aria-hidden /> : <Sun className="size-5" aria-hidden />}
          </motion.span>
        </AnimatePresence>
      </span>
    </IconButton>
  );
}
