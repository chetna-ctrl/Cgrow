import { z } from 'zod';

/**
 * Validation schema for Microgreens batches
 * Prevents XSS attacks by restricting input to safe characters
 */
export const BatchSchema = z.object({
    crop: z.string()
        .min(1, "Crop name is required")
        .max(50, "Crop name is too long (max 50 characters)")
        .regex(/^[a-zA-Z0-9 \-()]+$/, "Only letters, numbers, spaces, hyphens, and parentheses allowed"),

    qty: z.number()
        .int("Quantity must be a whole number")
        .positive("Quantity must be positive")
        .max(1000, "Quantity is too large (max 1000)"),

    sowDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
        .refine((date) => new Date(date) <= new Date(), "Sow date cannot be in the future")
});

/**
 * Validation schema for Hydroponics systems
 * Ensures all system parameters are within safe, realistic ranges
 */
export const HydroSystemSchema = z.object({
    id: z.string()
        .min(1, "System ID is required")
        .max(20, "System ID is too long")
        .regex(/^[a-zA-Z0-9\-]+$/, "Only letters, numbers, and hyphens allowed in System ID"),

    type: z.enum(['NFT', 'DWC', 'Ebb & Flow', 'Drip', 'Wick', 'Aeroponic'], {
        errorMap: () => ({ message: "Invalid system type" })
    }),

    crop: z.string()
        .min(1, "Crop name is required")
        .max(50, "Crop name is too long")
        .regex(/^[a-zA-Z0-9 \-()]+$/, "Only letters, numbers, spaces, hyphens, and parentheses allowed"),

    ph: z.number()
        .min(0, "pH cannot be negative")
        .max(14, "pH cannot exceed 14"),

    ec: z.number()
        .min(0, "EC cannot be negative")
        .max(10, "EC value is unrealistic (max 10)"),

    temp: z.number()
        .min(-10, "Temperature is too low")
        .max(50, "Temperature is too high")
});

/**
 * Validation schema for Daily Log entries
 */
export const DailyLogSchema = z.object({
    systemId: z.string().min(1, "System ID is required"),
    systemType: z.enum(['microgreens', 'hydroponics']).optional(),
    ph: z.number().min(0).max(14).optional(),
    ec: z.number().min(0).max(10).optional(),
    temp: z.number().min(-10).max(50).optional(),
    humidity: z.number().min(0).max(100).optional(),
    notes: z.string().max(500, "Notes are too long (max 500 characters)").optional()
});
