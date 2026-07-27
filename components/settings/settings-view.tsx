"use client";

import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { EquipmentCatalogPanel } from "@/components/settings/equipment-catalog-panel";
import { RolePackagesPanel } from "@/components/settings/role-packages-panel";
import { useCurrentUser } from "@/hooks/use-current-user";

export function SettingsView() {
  const { data: session, isLoading } = useCurrentUser();

  if (isLoading) return null;

  if (session && session.currentUser.role !== "IT") {
    return (
      <div>
        <PageHeader title="Settings" />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ShieldAlert className="size-10 text-muted-foreground" />
            <p className="font-medium">This area is restricted to IT.</p>
            <p className="text-sm text-muted-foreground">
              Switch to an IT account to manage the equipment catalog and role packages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage the equipment catalog and new-hire role packages."
      />
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Equipment Catalog</TabsTrigger>
          <TabsTrigger value="roles">Role Packages</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog" className="mt-4">
          <EquipmentCatalogPanel />
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <RolePackagesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
