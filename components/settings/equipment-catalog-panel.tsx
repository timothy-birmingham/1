"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  useCatalog,
  useCreateCatalogItem,
  useDeleteCatalogItem,
  useUpdateCatalogItem,
} from "@/hooks/use-catalog";
import type { CatalogItemDTO } from "@/lib/types";

function CatalogItemDialog({
  item,
  open,
  onOpenChange,
}: {
  item?: CatalogItemDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = React.useState(item?.name ?? "");
  const [category, setCategory] = React.useState(item?.category ?? "");
  const [active, setActive] = React.useState(item?.active ?? true);

  const createItem = useCreateCatalogItem();
  const updateItem = useUpdateCatalogItem(item?.id ?? "");
  const isPending = createItem.isPending || updateItem.isPending;

  function handleSave() {
    const input = { name: name.trim(), category: category.trim() || undefined, active };
    if (!input.name) {
      toast.error("Item name is required");
      return;
    }
    const mutation = item ? updateItem : createItem;
    mutation.mutate(input, {
      onSuccess: () => {
        toast.success(item ? "Item updated" : "Item added");
        onOpenChange(false);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to save"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit equipment item" : "Add equipment item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="catalog-name">Name</Label>
            <Input id="catalog-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="catalog-category">Category (optional)</Label>
            <Input
              id="catalog-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={active} onCheckedChange={setActive} />
            Active (available in equipment pickers)
          </label>
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

export function EquipmentCatalogPanel() {
  const { data: catalog, isLoading } = useCatalog();
  const deleteItem = useDeleteCatalogItem();

  const [dialogItem, setDialogItem] = React.useState<CatalogItemDTO | undefined>();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<CatalogItemDTO | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setDialogItem(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : catalog?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No equipment items yet.
                </TableCell>
              </TableRow>
            ) : (
              catalog?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.category || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.active ? "default" : "outline"}>
                      {item.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setDialogItem(item);
                        setDialogOpen(true);
                      }}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(item)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CatalogItemDialog
        key={dialogOpen ? dialogItem?.id ?? "new" : "closed"}
        item={dialogItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && (
                <>Remove <span className="font-medium text-foreground">{pendingDelete.name}</span> from the equipment catalog. Existing requests keep their line items.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (!pendingDelete) return;
                deleteItem.mutate(pendingDelete.id, {
                  onSuccess: () => {
                    toast.success(`${pendingDelete.name} removed`);
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
