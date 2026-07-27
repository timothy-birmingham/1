"use client";

import * as React from "react";
import type { UseFieldArrayReturn } from "react-hook-form";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalog } from "@/hooks/use-catalog";
import type { RequestFormValues } from "@/components/requests/request-form-schema";

export function EquipmentEditor({
  fieldArray,
}: {
  fieldArray: UseFieldArrayReturn<RequestFormValues, "equipmentItems">;
}) {
  const { fields, append, remove, update } = fieldArray;
  const { data: catalog } = useCatalog();
  const [selectedItem, setSelectedItem] = React.useState("");

  function handleAdd() {
    if (!selectedItem) return;
    const existingIndex = fields.findIndex((field) => field.name === selectedItem);
    if (existingIndex >= 0) {
      update(existingIndex, {
        ...fields[existingIndex],
        quantity: fields[existingIndex].quantity + 1,
      });
    } else {
      append({ name: selectedItem, quantity: 1 });
    }
    setSelectedItem("");
  }

  function changeQuantity(index: number, delta: number) {
    const next = Math.max(1, Math.min(50, fields[index].quantity + delta));
    update(index, { ...fields[index], quantity: next });
  }

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
          No equipment added yet.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {fields.map((field, index) => (
            <li key={field.id} className="flex items-center justify-between gap-3 p-3">
              <span className="text-sm font-medium">{field.name}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => changeQuantity(index, -1)}
                    aria-label={`Decrease ${field.name} quantity`}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {field.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => changeQuantity(index, 1)}
                    aria-label={`Increase ${field.name} quantity`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${field.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger className="flex-1" aria-label="Add equipment item">
            <SelectValue placeholder="Add an equipment item…" />
          </SelectTrigger>
          <SelectContent>
            {catalog
              ?.filter((item) => item.active)
              .map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={handleAdd} disabled={!selectedItem}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
