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

    qty: z.coerce.number()
        .int("Quantity must be a whole number")
        .positive("Quantity must be positive")
        .max(1000, "Quantity is too large (max 1000)"),

    sowDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
        .refine((date) => new Date(date) <= new Date(), "Sow date cannot be in the future"),

    seedWeight: z.coerce.number().optional() // New field for Density Auditor
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

    ph: z.coerce.number()
        .min(0, "pH cannot be negative")
        .max(14, "pH cannot exceed 14"),

    ec: z.coerce.number()
        .min(0, "EC cannot be negative")
        .max(10, "EC value is unrealistic (max 10)"),

    temp: z.coerce.number()
        .min(-10, "Temperature is too low")
        .max(50, "Temperature is too high")
});

/**
 * Validation schema for Daily Log entries
 */
export const DailyLogSchema = z.object({
    systemId: z.string().min(1, "System ID is required"),
    systemType: z.enum(['microgreens', 'hydroponics']).optional(),
    ph: z.coerce.number().min(0).max(14).optional(),
    ec: z.coerce.number().min(0).max(10).optional(),
    temp: z.coerce.number().min(-10).max(50).optional(),
    humidity: z.coerce.number().min(0).max(100).optional(),
    notes: z.string().max(500, "Notes are too long (max 500 characters)").optional()
});

/**
 * Validation schema for Mushroom batches
 */
export const MushroomBatchSchema = z.object({
    type: z.string()
        .min(1, "Mushroom species is required")
        .max(50, "Species name is too long"),

    bags: z.coerce.number()
        .int("Bag count must be a whole number")
        .positive("Bag count must be positive")
        .max(500, "Bag count is too high for this system"),

    startDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
});
