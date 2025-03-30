import { pgTable, text, serial, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  arrivalDate: date("arrival_date").notNull(),
  departureDate: date("departure_date").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").notNull().default(0),
  infants: integer("infants").notNull().default(0),
  visitCount: text("visit_count").notNull(),
  accommodationId: text("accommodation_id").notNull(),
  activityId: text("activity_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  specialRequests: text("special_requests"),
  totalPrice: integer("total_price").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Schema for frontend validation
export const bookingFormSchema = z.object({
  arrivalDate: z.date({
    required_error: "Please select an arrival date.",
  }),
  departureDate: z.date({
    required_error: "Please select a departure date.",
  }),
  adults: z.number({
    required_error: "Please specify number of adults.",
  }).min(1, "At least 1 adult is required."),
  children: z.number().default(0),
  infants: z.number().default(0),
  visitCount: z.enum(["first", "second-third", "fourth-plus"], {
    required_error: "Please select your visit count.",
  }),
  accommodationId: z.string({
    required_error: "Please select an accommodation.",
  }),
  activityId: z.string({
    required_error: "Please select an activity.",
  }),
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(5, "Please enter a valid phone number."),
  specialRequests: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
