/*
  Warnings:

  - Added the required column `rsvp_deadline` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "rsvp_deadline" TIMESTAMPTZ(6) NOT NULL DEFAULT now();
