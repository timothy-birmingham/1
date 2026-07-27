"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ItemQuantityEditor,
  type QuantityItem,
} from "@/components/settings/item-quantity-editor";
import {
  useCreateRolePackage,
  useDeleteRolePackage,
  useRolePackages,
  useUpdateRolePackage,
} from "@/hooks/use-catalog";
import type { RolePackageDTO } from "@/lib/types";

function RolePackageDialog({
  pkg,
  open,
  onOpenChange,
}: {
  pkg?: RolePackageDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [roleName, setRoleName] = React.useState(pkg?.roleName ?? "");
  const [items, setItems] = React.useState<QuantityItem[]>(pkg?.items ?? []);

  const createPkg = useCreateRolePackage();
  const updatePkg = useUpdateRolePackage(pkg?.id ?? "");
  const isPending = createPkg.isPending || updatePkg.isPending;

  function handleSave() {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    const input = {
      roleName: roleName.trim(),
      items: items.map(({ name, quantity }) => ({ name, quantity })),
    };
    const mutation = pkg ? updatePkg : createPkg;
    mutation.mutate(input, {
      onSuccess: () => {
        toast.success(pkg ? "Role package updated" : "Role package added");
        onOpenChange(false);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to save"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit role package" : "Add role package"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default equipment</Label>
            <ItemQuantityEditor items={items} onChange={setItems} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RolePackagesPanel() {
  const { data: packages, isLoading } = useRolePackages();
  const deletePkg = useDeleteRolePackage();

  const [dialogPkg, setDialogPkg] = React.useState<RolePackageDTO | undefined>();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<RolePackageDTO | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setDialogPkg(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add Role Package
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : packages?.length === 0 ? (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          No role packages yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {packages?.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{pkg.roleName}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setDialogPkg(pkg);
                      setDialogOpen(true);
                    }}
                    aria-label={`Edit ${pkg.roleName}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(pkg)}
                    aria-label={`Delete ${pkg.roleName}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {pkg.items.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No default items</span>
                ) : (
                  pkg.items.map((item) => (
                    <Badge key={item.id} variant="outline" className="font-normal">
                      {item.name} × {item.quantity}
                    </Badge>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RolePackageDialog
        key={dialogOpen ? dialogPkg?.id ?? "new" : "closed"}
        pkg={dialogPkg}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this role package?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && (
                <>
                  Remove the <span className="font-medium text-foreground">{pendingDelete.roleName}</span>{" "}
                  package. It will no longer appear in the New Hire role dropdown.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (!pendingDelete) return;
                deletePkg.mutate(pendingDelete.id, {
                  onSuccess: () => {
                    toast.success(`${pendingDelete.roleName} removed`);
                    setPendingDelete(null);
                  },
                  onError: (error) =>
                    toast.error(error instanceof Error ? error.message : "Failed to delete"),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
