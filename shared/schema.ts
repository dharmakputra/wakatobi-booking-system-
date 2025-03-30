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
  activityDays: text("activity_days"), // Stored as JSON string
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
  // Trip Type Selection
  tripType: z.enum(["resort-only", "combination-stay", "pelagian-only"], {
    required_error: "Please select your trip type.",
  }),
  
  // For combination stays, the order of resort and Pelagian
  combinationOrder: z.enum(["resort-first", "pelagian-first"]).optional(),

  // Resort Stay
  resortArrivalDate: z.date({
    required_error: "Please select a resort arrival date.",
  }).optional(),
  resortDepartureDate: z.date({
    required_error: "Please select a resort departure date.",
  }).optional(),
  accommodationId: z.string().optional(),
  
  // Pelagian Stay
  pelagianArrivalDate: z.date({
    required_error: "Please select a Pelagian cruise date.",
  }).optional(),
  pelagianDepartureDate: z.date({
    required_error: "Please select a Pelagian departure date.",
  }).optional(),
  pelagianCabinId: z.string().optional(),
  
  // Legacy date fields (for backward compatibility with existing components)
  arrivalDate: z.date().optional(),
  departureDate: z.date().optional(),
  
  // Guest Information
  adults: z.number({
    required_error: "Please specify number of adults.",
  }).min(1, "At least 1 adult is required."),
  children: z.number().default(0),
  infants: z.number().default(0),
  visitCount: z.enum(["first", "second-third", "fourth-plus"], {
    required_error: "Please select your visit count.",
  }),

  // Activities
  activityId: z.string().optional(),
  activityDays: z.record(z.string(), z.number()).optional(), // Map guest ID to number of activity days
  
  // Contact Information
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(5, "Please enter a valid phone number."),
  specialRequests: z.string().optional(),
});

// Helper function to validate booking data based on trip type
export const validateBookingData = (data: BookingFormData) => {
  const errors: Record<string, string> = {};
  
  if (data.tripType === 'resort-only' || data.tripType === 'combination-stay') {
    if (!data.resortArrivalDate) errors.resortArrivalDate = 'Please select a resort arrival date';
    if (!data.resortDepartureDate) errors.resortDepartureDate = 'Please select a resort departure date';
    if (!data.accommodationId) errors.accommodationId = 'Please select an accommodation';
    if (!data.activityId) errors.activityId = 'Please select an activity package';
  }
  
  if (data.tripType === 'pelagian-only' || data.tripType === 'combination-stay') {
    if (!data.pelagianArrivalDate) errors.pelagianArrivalDate = 'Please select a Pelagian cruise date';
    if (!data.pelagianDepartureDate) errors.pelagianDepartureDate = 'Please select a Pelagian departure date';
    if (!data.pelagianCabinId) errors.pelagianCabinId = 'Please select a Pelagian cabin';
  }
  
  return errors;
};

export type BookingFormData = z.infer<typeof bookingFormSchema>;
