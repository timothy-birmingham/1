"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/requests/status-badge";
import { RequestProgressBar } from "@/components/requests/progress-bar";
import { formatCalendarDate, formatDate } from "@/lib/format";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { RequestSummaryDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SortState {
  sort: string;
  order: "asc" | "desc";
}

interface RequestsTableProps {
  data: RequestSummaryDTO[];
  isLoading?: boolean;
  sortable?: boolean;
  sortState?: SortState;
  onSortChange?: (state: SortState) => void;
  onDeleteRequest?: (request: RequestSummaryDTO) => void;
  emptyMessage?: string;
}

function SortableHeader({
  label,
  field,
  sortState,
  onSortChange,
}: {
  label: string;
  field: string;
  sortState?: SortState;
  onSortChange?: (state: SortState) => void;
}) {
  if (!onSortChange) return <span>{label}</span>;

  const active = sortState?.sort === field;
  const Icon = active ? (sortState!.order === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1 text-left font-medium hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground"
      )}
      onClick={() =>
        onSortChange({
          sort: field,
          order: active && sortState!.order === "asc" ? "desc" : "asc",
        })
      }
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  );
}

export function RequestsTable({
  data,
  isLoading,
  sortState,
  onSortChange,
  onDeleteRequest,
  emptyMessage = "No requests found.",
}: RequestsTableProps) {
  const router = useRouter();
  const { data: session } = useCurrentUser();
  const isIT = session?.currentUser.role === "IT";

  const columns: ColumnDef<RequestSummaryDTO>[] = [
    {
      id: "requestNumber",
      header: () => (
        <SortableHeader
          label="Request ID"
          field="createdAt"
          sortState={sortState}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.requestNumber}
        </span>
      ),
    },
    {
      id: "employeeName",
      header: () => (
        <SortableHeader
          label="Employee"
          field="employeeName"
          sortState={sortState}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.employeeName}</div>
          {row.original.isNewHire && (
            <div className="text-xs text-muted-foreground">New hire</div>
          )}
        </div>
      ),
    },
    {
      id: "department",
      header: () => (
        <SortableHeader
          label="Department"
          field="department"
          sortState={sortState}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.original.department,
    },
    {
      id: "officeLocation",
      header: () => (
        <SortableHeader
          label="Office"
          field="officeLocation"
          sortState={sortState}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.original.officeLocation,
    },
    {
      id: "roleTitle",
      header: () => (
        <SortableHeader
          label="Role"
          field="roleTitle"
          sortState={sortState}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.original.roleTitle,
    },
    {
      id: "neededByDate",
      header: () => (
        <SortableHeader
          label="Needed By"
          field="neededByDate"
          sortState={sortState}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => formatCalendarDate(row.original.neededByDate),
    },
    {
      id: "status",
      header: () => (
        <SortableHeader
          label="Status"
          field="status"
          sortState={sortState}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => (
        <RequestProgressBar status={row.original.status} className="w-28" />
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" asChild aria-label="View request">
            <Link href={`/requests/${row.original.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon-sm" asChild aria-label="Edit request">
            <Link href={`/requests/${row.original.id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          {isIT && onDeleteRequest && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete request"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(row.original);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/requests/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
