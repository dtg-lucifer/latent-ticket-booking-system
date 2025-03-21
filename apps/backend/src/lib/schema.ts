/**
 * @info Auth related schemas
 * @maintainer dtg-lucifer <dev.bosepiush@gmail.com>
 */

import z from "zod";

/**
 * This is for signup
 */
export const SignUpUserSchema = z.object({
  number: z.string().min(10).max(10),
  name: z.string().min(3),
  email: z.string().email(),
});

/**
 * This is for the otp verification part
 */
export const OtpSchema = z.object({
  otp: z.string().min(6).max(6),
  number: z.string().min(10).max(10),
  requestId: z.string().uuid(),
});

// ---------------------------------------

/**
 * HOW TO CREATE A COMPLETE EVENT WITH RELATIONS:
 *
 * 1. Create Event with admin relationship:
 *    - Get the adminId (User with ADMIN role) from authentication
 *    - Create the event record with the adminId
 *
 * 2. Create SeatTypes for the event:
 *    - For each seatType in the request:
 *      - Create a SeatType record with the eventId
 *
 * 3. Create Seats for each SeatType:
 *    - For each seatType:
 *      - Create the specified number of seats (count)
 *      - Link each seat to the seatType via seatTypeId
 *
 * 4. Example implementation flow:
 *
 *   async function createEventWithRelations(data, adminId) {
 *     // 1. Create the event
 *     const event = await prisma.event.create({
 *       data: {
 *         ...data.event,
 *         adminId: adminId,
 *       }
 *     });
 *
 *     // 2. Create seat types and seats in a transaction
 *     for (const seatTypeData of data.seatTypes) {
 *       const { count, ...seatTypeInfo } = seatTypeData;
 *
 *       // Create seat type
 *       const seatType = await prisma.seatType.create({
 *         data: {
 *           ...seatTypeInfo,
 *           eventId: event.id,
 *         }
 *       });
 *
 *       // Create seats for this type
 *       const seatCreateData = Array(count).fill(null).map(() => ({
 *         status: "AVAILABLE",
 *         seatTypeId: seatType.id,
 *       }));
 *
 *       await prisma.seat.createMany({
 *         data: seatCreateData
 *       });
 *     }
 *
 *     return event;
 *   }
 *
 * 5. Booking flow:
 *   - User selects seats (get seatIds)
 *   - Create booking record linking user, event and seats
 *   - Update seat status to BOOKED
 *   - Create payment record (initially PENDING)
 *   - After payment process completes, update payment status
 */
export const CreateEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  startTime: z.date(),
  endTime: z.date(),
  location: z.string().min(3),
  // type: z.enum(["online", "offline"]), // TODO: Add this later
  availableSeats: z.number().min(10),
  totalSeats: z.number().min(10),
  banner: z.string().url(), // URL for the event banner image
});

export const CreateSeatTypeSchema = z.array(
  z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    price: z.number().min(0),
    count: z.number().min(1),
  })
);

export const CreateSeatSchema = z.object({
  status: z.enum(["AVAILABLE", "BOOKED"]),
});
