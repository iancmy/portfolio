"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { NavbarButton } from "@/components/ui/resizable-navbar";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Track the current theme in state, default to 'system' if not set
  const [current, setCurrent] = React.useState<string>(theme || "system");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setCurrent(theme || "system");
  }, [theme]);

  // Rotates between light and dark, defaulting to system
  const handleToggle = () => {
    let nextTheme;
    if (current === "system") {
      nextTheme = "light";
    } else if (current === "light") {
      nextTheme = "dark";
    } else {
      nextTheme = "light";
    }
    setTheme(nextTheme);
    setCurrent(nextTheme);
  };

  const isDark = current === "dark";

  if (!mounted) return null;

  return (
    <NavbarButton variant="secondary" onClick={handleToggle}>
      {isDark ? <Sun size="1.25em" /> : <Moon size="1.25em" />}
      <span className="sr-only">Toggle theme</span>
    </NavbarButton>
  );
}
