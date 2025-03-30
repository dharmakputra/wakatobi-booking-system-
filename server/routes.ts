import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to handle booking requests
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const createdBooking = await storage.createBooking(bookingData);
      res.status(201).json({ booking: createdBooking });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create booking" });
      }
    }
  });

  // API endpoint to get all bookings
  app.get("/api/bookings", async (req: Request, res: Response) => {
    try {
      const allBookings = await storage.getAllBookings();
      res.status(200).json({ bookings: allBookings });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve bookings" });
    }
  });

  // API endpoint to get a specific booking
  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }
      
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.status(200).json({ booking });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
