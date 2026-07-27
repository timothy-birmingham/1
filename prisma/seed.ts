/**
 * Demo seed data for local development and testing. Populates users, the
 * equipment catalog, role packages, and a realistic spread of equipment
 * requests (all four statuses, several departments/offices/roles) so the
 * dashboard, filters, table, and detail views all have something meaningful
 * to show out of the box.
 */
import { PrismaClient, type RequestStatus } from "@prisma/client";
import { DEFAULT_INVENTORY, DEFAULT_ROLE_PACKAGES } from "../lib/constants";
import { STATUS_ORDER } from "../lib/format";

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.requestActivity.deleteMany();
  await prisma.requestEquipmentItem.deleteMany();
  await prisma.equipmentRequest.deleteMany();
  await prisma.rolePackageItem.deleteMany();
  await prisma.rolePackage.deleteMany();
  await prisma.equipmentCatalogItem.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  return Promise.all([
    prisma.user.create({
      data: {
        name: "IT Admin",
        email: "it.admin@vesta.com",
        role: "IT",
        department: "IT",
        office: "Bonita",
      },
    }),
    prisma.user.create({
      data: {
        name: "Marcus Lee",
        email: "marcus.lee@vesta.com",
        role: "IT",
        department: "IT",
        office: "Tampa",
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Shah",
        email: "priya.shah@vesta.com",
        role: "HR",
        department: "Human Resources",
        office: "Bonita",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jane Manager",
        email: "jane.manager@vesta.com",
        role: "MANAGER",
        department: "Community Management",
        office: "Naples",
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Manager",
        email: "bob.manager@vesta.com",
        role: "MANAGER",
        department: "Accounting",
        office: "Fort Myers",
      },
    }),
  ]);
}

async function seedCatalog() {
  await prisma.equipmentCatalogItem.createMany({
    data: DEFAULT_INVENTORY.map((name) => ({ name })),
  });
}

async function seedRolePackages() {
  for (const [roleName, items] of Object.entries(DEFAULT_ROLE_PACKAGES)) {
    await prisma.rolePackage.create({
      data: {
        roleName,
        items: { create: items },
      },
    });
  }
}

interface RequestSpec {
  employeeName: string;
  roleTitle: string;
  department: string;
  officeLocation: string;
  isNewHire: boolean;
  startDateOffsetDays?: number;
  neededByOffsetDays: number;
  createdOffsetDaysAgo: number;
  status: RequestStatus;
  notes?: string;
  equipment: { name: string; quantity: number }[];
  createdByEmail: string;
}

function daysFromNow(offset: number): Date {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

const packageItems = (role: keyof typeof DEFAULT_ROLE_PACKAGES) =>
  DEFAULT_ROLE_PACKAGES[role].map((item) => ({ ...item }));

const requestSpecs: RequestSpec[] = [
  {
    employeeName: "Alex Rivera",
    roleTitle: "Software Engineer",
    department: "Engineering",
    officeLocation: "Tampa",
    isNewHire: true,
    startDateOffsetDays: 8,
    neededByOffsetDays: 5,
    createdOffsetDaysAgo: 6,
    status: "ORDER_SUBMITTED",
    notes: "Standard new-hire setup for the engineering team.",
    equipment: packageItems("Software Engineer"),
    createdByEmail: "priya.shah@vesta.com",
  },
  {
    employeeName: "Morgan Ellis",
    roleTitle: "Help Desk",
    department: "IT",
    officeLocation: "Bonita",
    isNewHire: true,
    startDateOffsetDays: 4,
    neededByOffsetDays: 2,
    createdOffsetDaysAgo: 3,
    status: "UNTOUCHED",
    equipment: packageItems("Help Desk"),
    createdByEmail: "priya.shah@vesta.com",
  },
  {
    employeeName: "Sarah Jones",
    roleTitle: "Accounting",
    department: "Accounting",
    officeLocation: "Naples",
    isNewHire: true,
    startDateOffsetDays: 0,
    neededByOffsetDays: -2,
    createdOffsetDaysAgo: 10,
    status: "IN_TRANSIT",
    notes: "Manager requested expedited shipping.",
    equipment: packageItems("Accounting"),
    createdByEmail: "priya.shah@vesta.com",
  },
  {
    employeeName: "Michael Brown",
    roleTitle: "Sales",
    department: "Sales",
    officeLocation: "Fort Myers",
    isNewHire: true,
    startDateOffsetDays: -2,
    neededByOffsetDays: -5,
    createdOffsetDaysAgo: 14,
    status: "DELIVERED",
    equipment: packageItems("Sales"),
    createdByEmail: "priya.shah@vesta.com",
  },
  {
    employeeName: "Dana Whitfield",
    roleTitle: "Community Association Manager",
    department: "Community Management",
    officeLocation: "Bonita",
    isNewHire: false,
    neededByOffsetDays: 12,
    createdOffsetDaysAgo: 1,
    status: "UNTOUCHED",
    notes: "Current laptop is failing, needs replacement before month-end close.",
    equipment: [
      { name: "Laptop", quantity: 1 },
      { name: "Laptop Charger", quantity: 1 },
    ],
    createdByEmail: "jane.manager@vesta.com",
  },
  {
    employeeName: "Carlos Nguyen",
    roleTitle: "Staff Accountant",
    department: "Accounting",
    officeLocation: "Fort Myers",
    isNewHire: false,
    neededByOffsetDays: 10,
    createdOffsetDaysAgo: 4,
    status: "ORDER_SUBMITTED",
    equipment: [
      { name: "Monitor", quantity: 2 },
      { name: "Dock", quantity: 1 },
      { name: "Keyboard", quantity: 1 },
    ],
    createdByEmail: "bob.manager@vesta.com",
  },
  {
    employeeName: "Emily Chen",
    roleTitle: "IT Support Technician",
    department: "IT",
    officeLocation: "Tampa",
    isNewHire: false,
    neededByOffsetDays: 6,
    createdOffsetDaysAgo: 8,
    status: "IN_TRANSIT",
    equipment: [
      { name: "Phone", quantity: 1 },
      { name: "Headset", quantity: 1 },
    ],
    createdByEmail: "it.admin@vesta.com",
  },
  {
    employeeName: "Robert Kim",
    roleTitle: "Administrator",
    department: "Administration",
    officeLocation: "Naples",
    isNewHire: false,
    neededByOffsetDays: -8,
    createdOffsetDaysAgo: 16,
    status: "DELIVERED",
    equipment: [
      { name: "Standing Desk", quantity: 1 },
      { name: "Office Chair", quantity: 1 },
      { name: "Webcam", quantity: 1 },
    ],
    createdByEmail: "jane.manager@vesta.com",
  },
  {
    employeeName: "Taylor Brooks",
    roleTitle: "Administrator",
    department: "Administration",
    officeLocation: "Bonita",
    isNewHire: true,
    startDateOffsetDays: 21,
    neededByOffsetDays: 19,
    createdOffsetDaysAgo: 0,
    status: "UNTOUCHED",
    equipment: packageItems("Administrator"),
    createdByEmail: "priya.shah@vesta.com",
  },
  {
    employeeName: "Jordan Patel",
    roleTitle: "Community Association Manager",
    department: "Community Management",
    officeLocation: "Naples",
    isNewHire: false,
    neededByOffsetDays: 1,
    createdOffsetDaysAgo: 5,
    status: "ORDER_SUBMITTED",
    equipment: [
      { name: "Laptop", quantity: 1 },
      { name: "Ethernet Adapter", quantity: 1 },
    ],
    createdByEmail: "jane.manager@vesta.com",
  },
  {
    employeeName: "Nina Alvarez",
    roleTitle: "Help Desk",
    department: "IT",
    officeLocation: "Fort Myers",
    isNewHire: true,
    startDateOffsetDays: 12,
    neededByOffsetDays: 9,
    createdOffsetDaysAgo: 7,
    status: "IN_TRANSIT",
    equipment: packageItems("Help Desk"),
    createdByEmail: "priya.shah@vesta.com",
  },
  {
    employeeName: "Chris Osei",
    roleTitle: "Staff Accountant",
    department: "Accounting",
    officeLocation: "Tampa",
    isNewHire: false,
    neededByOffsetDays: 26,
    createdOffsetDaysAgo: 2,
    status: "UNTOUCHED",
    notes: "Current printer is out of service; team needs a replacement.",
    equipment: [
      { name: "Printer", quantity: 1 },
      { name: "Scanner", quantity: 1 },
    ],
    createdByEmail: "bob.manager@vesta.com",
  },
];

async function seedRequests(users: Awaited<ReturnType<typeof seedUsers>>) {
  const userByEmail = new Map(users.map((user) => [user.email, user]));
  const itUser = users.find((user) => user.role === "IT")!;

  for (const spec of requestSpecs) {
    const creator = userByEmail.get(spec.createdByEmail)!;
    const createdAt = daysFromNow(-spec.createdOffsetDaysAgo);

    const request = await prisma.equipmentRequest.create({
      data: {
        employeeName: spec.employeeName,
        roleTitle: spec.roleTitle,
        department: spec.department,
        officeLocation: spec.officeLocation,
        neededByDate: daysFromNow(spec.neededByOffsetDays),
        isNewHire: spec.isNewHire,
        startDate: spec.isNewHire ? daysFromNow(spec.startDateOffsetDays ?? 0) : null,
        status: spec.status,
        notes: spec.notes ?? "",
        createdByUserId: creator.id,
        createdAt,
        updatedAt: createdAt,
        equipmentItems: { create: spec.equipment },
      },
    });

    await prisma.requestActivity.create({
      data: {
        requestId: request.id,
        type: "CREATED",
        toStatus: "UNTOUCHED",
        actorUserId: creator.id,
        createdAt,
      },
    });

    // Walk the status pipeline from UNTOUCHED to the target status, logging
    // a STATUS_CHANGED activity (attributed to IT) at each step so the
    // detail view's timeline has real history to show.
    const targetIndex = STATUS_ORDER.indexOf(spec.status);
    if (targetIndex > 0) {
      const totalSpanMs = Math.max(
        new Date().getTime() - createdAt.getTime(),
        targetIndex * 60 * 60 * 1000
      );
      const stepMs = totalSpanMs / (targetIndex + 1);

      for (let step = 1; step <= targetIndex; step++) {
        const changedAt = new Date(createdAt.getTime() + stepMs * step);
        await prisma.requestActivity.create({
          data: {
            requestId: request.id,
            type: "STATUS_CHANGED",
            fromStatus: STATUS_ORDER[step - 1],
            toStatus: STATUS_ORDER[step],
            actorUserId: itUser.id,
            createdAt: changedAt,
          },
        });
      }

      const lastChangeAt = new Date(createdAt.getTime() + stepMs * targetIndex);
      await prisma.equipmentRequest.update({
        where: { id: request.id },
        data: { updatedAt: lastChangeAt },
      });
    }
  }
}

async function main() {
  await resetDatabase();
  const users = await seedUsers();
  await seedCatalog();
  await seedRolePackages();
  await seedRequests(users);
  console.log(
    `Seeded ${users.length} users, ${DEFAULT_INVENTORY.length} catalog items, ` +
      `${Object.keys(DEFAULT_ROLE_PACKAGES).length} role packages, and ${requestSpecs.length} requests.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
