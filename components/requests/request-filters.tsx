"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OFFICES } from "@/lib/constants";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/format";
import { useRequestFacets } from "@/hooks/use-requests";

export interface RequestFiltersValue {
  q: string;
  status: string;
  department: string;
  office: string;
  role: string;
}

export const DEFAULT_REQUEST_FILTERS: RequestFiltersValue = {
  q: "",
  status: "ALL",
  department: "ALL",
  office: "ALL",
  role: "ALL",
};

export function RequestFilters({
  value,
  onChange,
}: {
  value: RequestFiltersValue;
  onChange: (value: RequestFiltersValue) => void;
}) {
  const { data: facets } = useRequestFacets();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <div className="relative w-full md:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="Search requests…"
          className="pl-8"
          aria-label="Search requests"
        />
      </div>

      <Select
        value={value.status}
        onValueChange={(status) => onChange({ ...value, status })}
      >
        <SelectTrigger className="w-full md:w-44" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {STATUS_ORDER.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.department}
        onValueChange={(department) => onChange({ ...value, department })}
      >
        <SelectTrigger className="w-full md:w-48" aria-label="Filter by department">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All departments</SelectItem>
          {facets?.departments.map((department) => (
            <SelectItem key={department} value={department}>
              {department}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.office}
        onValueChange={(office) => onChange({ ...value, office })}
      >
        <SelectTrigger className="w-full md:w-40" aria-label="Filter by office">
          <SelectValue placeholder="Office" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All offices</SelectItem>
          {OFFICES.map((office) => (
            <SelectItem key={office} value={office}>
              {office}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.role} onValueChange={(role) => onChange({ ...value, role })}>
        <SelectTrigger className="w-full md:w-48" aria-label="Filter by role">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All roles</SelectItem>
          {facets?.roles.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
