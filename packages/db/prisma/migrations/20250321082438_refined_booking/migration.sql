/*
  Warnings:

  - Added the required column `availableSeats` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSeats` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'PENDING_PAYMENT', 'TIMEOUT', 'FILLED', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "availableSeats" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalSeats" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SeatType" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE INDEX "admin_email_index" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "admin_number_index" ON "Admin"("number");

-- CreateIndex
CREATE INDEX "booking_event_index" ON "Booking"("eventId");

-- CreateIndex
CREATE INDEX "booking_user_index" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "event_admin_index" ON "Event"("adminId");

-- CreateIndex
CREATE INDEX "event_start_time_index" ON "Event"("startTime");

-- CreateIndex
CREATE INDEX "payment_event_index" ON "Payment"("eventId");

-- CreateIndex
CREATE INDEX "payment_user_index" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "seat_booking_index" ON "Seat"("bookingId");

-- CreateIndex
CREATE INDEX "seat_seat_type_index" ON "Seat"("seatTypeId");

-- CreateIndex
CREATE INDEX "seat_type_event_index" ON "SeatType"("eventId");

-- CreateIndex
CREATE INDEX "seat_type_name_index" ON "SeatType"("name");

-- CreateIndex
CREATE INDEX "user_email_index" ON "User"("email");

-- CreateIndex
CREATE INDEX "user_number_index" ON "User"("number");

-- AddForeignKey
ALTER TABLE "SeatType" ADD CONSTRAINT "SeatType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
