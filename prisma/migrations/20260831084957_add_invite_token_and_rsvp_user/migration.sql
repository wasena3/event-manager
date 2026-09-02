/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `event_invites` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `event_invites` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "event_invites" ADD COLUMN     "token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "event_rsvps" ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "event_invites_token_key" ON "event_invites"("token");
