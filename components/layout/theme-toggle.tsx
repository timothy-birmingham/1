"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // next-themes reads the already-applied DOM class synchronously on the
  // client's first render (to avoid a flash of the wrong theme), which is
  // exactly one render ahead of the server's render -- so gating the icon
  // on `mounted` (set via effect) is required here to avoid a hydration
  // mismatch, not optional. The lint rule's general "avoid setState in
  // effect" advice doesn't have a substitute for this specific case.
  const [mounted, setMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
