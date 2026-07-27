"use client";

import * as React from "react";
import { Menu, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav, SidebarFooter } from "@/components/layout/app-sidebar";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="flex items-center justify-between border-b bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Laptop className="size-4" />
        </span>
        <span className="font-semibold">Vesta</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"
        >
          <SheetHeader className="px-6 pt-7 pb-2">
            <SheetTitle className="text-sidebar-foreground">
              Vesta &middot; IT Equipment Ordering
            </SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setOpen(false)} />
          <SidebarFooter />
        </SheetContent>
      </Sheet>
    </header>
  );
}
