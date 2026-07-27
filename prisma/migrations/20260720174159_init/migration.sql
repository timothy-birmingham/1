-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EquipmentRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "officeLocation" TEXT NOT NULL,
    "neededByDate" DATETIME NOT NULL,
    "isNewHire" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'UNTOUCHED',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EquipmentRequest_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequestEquipmentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "requestId" INTEGER NOT NULL,
    CONSTRAINT "RequestEquipmentItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequestActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "note" TEXT,
    "requestId" INTEGER NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequestActivity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EquipmentRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RequestActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentCatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RolePackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RolePackageItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "rolePackageId" TEXT NOT NULL,
    CONSTRAINT "RolePackageItem_rolePackageId_fkey" FOREIGN KEY ("rolePackageId") REFERENCES "RolePackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "EquipmentRequest_status_idx" ON "EquipmentRequest"("status");

-- CreateIndex
CREATE INDEX "EquipmentRequest_department_idx" ON "EquipmentRequest"("department");

-- CreateIndex
CREATE INDEX "EquipmentRequest_officeLocation_idx" ON "EquipmentRequest"("officeLocation");

-- CreateIndex
CREATE INDEX "EquipmentRequest_roleTitle_idx" ON "EquipmentRequest"("roleTitle");

-- CreateIndex
CREATE INDEX "RequestEquipmentItem_requestId_idx" ON "RequestEquipmentItem"("requestId");

-- CreateIndex
CREATE INDEX "RequestActivity_requestId_idx" ON "RequestActivity"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentCatalogItem_name_key" ON "EquipmentCatalogItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePackage_roleName_key" ON "RolePackage"("roleName");

-- CreateIndex
CREATE INDEX "RolePackageItem_rolePackageId_idx" ON "RolePackageItem"("rolePackageId");
