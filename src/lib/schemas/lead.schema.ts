import { z } from "zod";

export const LeadSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please provide a valid email address"),
  phone: z
    .string()
    .min(8, "Phone number is required")
    .max(25, "Phone number is too long"),
  preferredTrack: z.enum([
    "Monza (Italy)",
    "Nürburgring Nordschleife (Germany)",
    "Circuit de Spa-Francorchamps (Belgium)",
    "Circuit of the Americas (USA)",
    "Suzuka International (Japan)",
    "Private Sant'Agata Bolognese Track",
  ]),
  currentVehicles: z.string().optional(),
  interestType: z.enum([
    "Private Track Experience & Hotlap Session",
    "Ad Personam Bespoke Commissioning",
    "Official Dealership Allocation Consultation",
    "Hypercar Dynamic Driving Masterclass",
  ]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type LeadFormData = z.infer<typeof LeadSchema>;
