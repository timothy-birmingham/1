"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EquipmentEditor } from "@/components/requests/equipment-editor";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRolePackages } from "@/hooks/use-catalog";
import { OFFICES, DEPARTMENT_SUGGESTIONS } from "@/lib/constants";
import { createRequestSchema, type CreateRequestInput } from "@/lib/validations/request";
import {
  EMPTY_REQUEST_FORM_VALUES,
  type RequestFormValues,
} from "@/components/requests/request-form-schema";
import { cn } from "@/lib/utils";

interface RequestFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<RequestFormValues>;
  onSubmit: (input: CreateRequestInput) => Promise<unknown>;
  onCancel: () => void;
  submitLabel: string;
}

export function RequestForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: RequestFormProps) {
  const { data: session } = useCurrentUser();
  const { data: rolePackages } = useRolePackages();

  const form = useForm<RequestFormValues>({
    defaultValues: { ...EMPTY_REQUEST_FORM_VALUES, ...defaultValues },
  });
  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const equipmentFieldArray = useFieldArray({ control, name: "equipmentItems" });
  const isNewHire = watch("isNewHire");

  // In create mode (no explicit defaults passed in), default the New Hire
  // checkbox to match how each role typically works: HR mostly onboards new
  // hires, managers mostly order for existing employees. Purely a UX
  // nicety -- the checkbox stays fully editable either way.
  const appliedSmartDefault = React.useRef(false);
  React.useEffect(() => {
    if (mode !== "create" || defaultValues?.isNewHire !== undefined) return;
    if (appliedSmartDefault.current || !session) return;
    appliedSmartDefault.current = true;
    setValue("isNewHire", session.currentUser.role === "HR");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, mode]);

  function handleRoleSelect(roleName: string) {
    setValue("roleTitle", roleName);
    const pkg = rolePackages?.find((p) => p.roleName === roleName);
    if (pkg) {
      equipmentFieldArray.replace(
        pkg.items.map((item) => ({ name: item.name, quantity: item.quantity }))
      );
    }
  }

  function onValidSubmit(values: RequestFormValues) {
    const parsed = createRequestSchema.safeParse({
      ...values,
      startDate: values.isNewHire ? values.startDate || null : null,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof RequestFormValues;
        setError(field, { message: issue.message });
      }
      toast.error("Please fix the highlighted fields.");
      return;
    }

    onSubmit(parsed.data).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    });
  }

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input id="employeeName" {...register("employeeName")} />
              {errors.employeeName && (
                <p className="text-xs text-destructive">{errors.employeeName.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={isNewHire}
                onCheckedChange={(checked) => setValue("isNewHire", checked === true)}
              />
              This request is for a new hire
            </label>

            {isNewHire && (
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="roleTitle">Role</Label>
              {isNewHire ? (
                <Select value={watch("roleTitle")} onValueChange={handleRoleSelect}>
                  <SelectTrigger id="roleTitle" className="w-full">
                    <SelectValue placeholder="Select a role…" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolePackages?.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.roleName}>
                        {pkg.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="roleTitle"
                  placeholder="e.g. Staff Accountant"
                  {...register("roleTitle")}
                />
              )}
              {errors.roleTitle && (
                <p className="text-xs text-destructive">{errors.roleTitle.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                list="department-suggestions"
                {...register("department")}
              />
              <datalist id="department-suggestions">
                {DEPARTMENT_SUGGESTIONS.map((department) => (
                  <option key={department} value={department} />
                ))}
              </datalist>
              {errors.department && (
                <p className="text-xs text-destructive">{errors.department.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="officeLocation">Office Location</Label>
                <Select
                  value={watch("officeLocation")}
                  onValueChange={(value) => setValue("officeLocation", value)}
                >
                  <SelectTrigger id="officeLocation" className="w-full">
                    <SelectValue placeholder="Select office…" />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFICES.map((office) => (
                      <SelectItem key={office} value={office}>
                        {office}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.officeLocation && (
                  <p className="text-xs text-destructive">{errors.officeLocation.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="neededByDate">Needed By</Label>
                <Input id="neededByDate" type="date" {...register("neededByDate")} />
                {errors.neededByDate && (
                  <p className="text-xs text-destructive">{errors.neededByDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={4} {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentEditor fieldArray={equipmentFieldArray} />
          </CardContent>
        </Card>
      </div>

      <div className={cn("flex justify-end gap-3")}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
