import type { UserRole } from "@prisma/client";

/** Office locations. Kept as a fixed constant rather than a database table --
 * unlike the equipment catalog and role packages, the spec doesn't call for
 * these to be admin-editable, so a table would just be unused complexity. */
export const OFFICES = ["Bonita", "Naples", "Fort Myers", "Tampa"] as const;

/** Suggestions only (rendered as a <datalist>) -- department stays a free-text
 * field so it can hold any value a real org uses. */
export const DEPARTMENT_SUGGESTIONS = [
  "Community Management",
  "Accounting",
  "IT",
  "Engineering",
  "Sales",
  "Human Resources",
  "Administration",
  "Facilities",
] as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  HR: "HR",
  MANAGER: "Manager",
  IT: "IT",
};

/** The full equipment inventory available to the existing-employee picker.
 * Seeded into EquipmentCatalogItem so it's editable later from Settings. */
export const DEFAULT_INVENTORY: string[] = [
  "Laptop",
  "Dock",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headset",
  "USB-C Adapter",
  "HDMI Adapter",
  "Ethernet Adapter",
  "Laptop Charger",
  "Phone",
  "Printer",
  "Scanner",
  "Webcam",
  "Conference Speaker",
  "Standing Desk",
  "Office Chair",
];

export interface PackageItem {
  name: string;
  quantity: number;
}

/** Recommended equipment packages per new-hire role. Seeded into RolePackage
 * / RolePackageItem so they're editable later from Settings, but this is the
 * source of truth for the initial demo data. "Dual Monitors" is modeled as
 * Monitor x2 rather than two separate line items. */
export const DEFAULT_ROLE_PACKAGES: Record<string, PackageItem[]> = {
  "Software Engineer": [
    { name: "Laptop", quantity: 1 },
    { name: "Dock", quantity: 1 },
    { name: "Monitor", quantity: 2 },
    { name: "Keyboard", quantity: 1 },
    { name: "Mouse", quantity: 1 },
    { name: "Headset", quantity: 1 },
  ],
  "Help Desk": [
    { name: "Laptop", quantity: 1 },
    { name: "Dock", quantity: 1 },
    { name: "Monitor", quantity: 1 },
    { name: "Keyboard", quantity: 1 },
    { name: "Mouse", quantity: 1 },
    { name: "Headset", quantity: 1 },
    { name: "USB-C Adapter", quantity: 1 },
  ],
  Sales: [
    { name: "Laptop", quantity: 1 },
    { name: "Dock", quantity: 1 },
    { name: "Monitor", quantity: 1 },
    { name: "Webcam", quantity: 1 },
    { name: "Headset", quantity: 1 },
  ],
  Accounting: [
    { name: "Laptop", quantity: 1 },
    { name: "Dock", quantity: 1 },
    { name: "Monitor", quantity: 2 },
    { name: "Keyboard", quantity: 1 },
    { name: "Mouse", quantity: 1 },
  ],
  Administrator: [
    { name: "Laptop", quantity: 1 },
    { name: "Dock", quantity: 1 },
    { name: "Monitor", quantity: 2 },
    { name: "Webcam", quantity: 1 },
    { name: "Keyboard", quantity: 1 },
    { name: "Mouse", quantity: 1 },
  ],
};
