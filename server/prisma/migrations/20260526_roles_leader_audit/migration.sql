-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'TABLE_LEADER', 'ADMIN');

-- AlterTable: add role column (default PLAYER)
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'PLAYER';

-- Backfill: any user that was an admin becomes role=ADMIN.
UPDATE "User" SET "role" = 'ADMIN' WHERE "isAdmin" = true;

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AlterTable: room gains a table leader (nullable for legacy rows).
ALTER TABLE "Room" ADD COLUMN "tableLeaderId" TEXT;

-- Backfill: existing rooms default the host as the leader.
UPDATE "Room" SET "tableLeaderId" = "hostId" WHERE "tableLeaderId" IS NULL;

-- CreateIndex
CREATE INDEX "Room_tableLeaderId_idx" ON "Room"("tableLeaderId");

-- AlterTable: GameRound persists the full per-player final state (set-aside, rolls used, etc.).
ALTER TABLE "GameRound" ADD COLUMN "finalState" JSONB;

-- CreateIndex on completedAt for admin Games list ordering
CREATE INDEX IF NOT EXISTS "GameRound_completedAt_idx" ON "GameRound"("completedAt");

-- CreateTable: AdminAuditLog
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorId_idx" ON "AdminAuditLog"("actorId");
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
