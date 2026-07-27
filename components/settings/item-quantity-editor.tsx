"use client";

import * as React from "react";
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

export interface QuantityItem {
  name: string;
  quantity: number;
}

/** Standalone (non react-hook-form) version of the equipment quantity list
 * editor, used inside the Settings dialogs where a role package's default
 * items are edited as plain component state rather than as part of a
 * request form. */
export function ItemQuantityEditor({
  items,
  onChange,
}: {
  items: QuantityItem[];
  onChange: (items: QuantityItem[]) => void;
}) {
  const { data: catalog } = useCatalog();
  const [selectedItem, setSelectedItem] = React.useState("");

  function handleAdd() {
    if (!selectedItem) return;
    const existingIndex = items.findIndex((item) => item.name === selectedItem);
    if (existingIndex >= 0) {
      const next = [...items];
      next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + 1 };
      onChange(next);
    } else {
      onChange([...items, { name: selectedItem, quantity: 1 }]);
    }
    setSelectedItem("");
  }

  function changeQuantity(index: number, delta: number) {
    const next = [...items];
    next[index] = {
      ...next[index],
      quantity: Math.max(1, Math.min(50, next[index].quantity + delta)),
    };
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground">
          No items yet.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item, index) => (
            <li key={item.name} className="flex items-center justify-between gap-3 p-2.5">
              <span className="text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => changeQuantity(index, -1)}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-7 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => changeQuantity(index, 1)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeItem(index)}
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
          <SelectTrigger className="flex-1">
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
