"use server";

import { LeadSchema, LeadFormData } from "@/lib/schemas/lead.schema";

export interface LeadSubmissionResult {
  success: boolean;
  message: string;
  leadId?: string;
  errors?: Record<string, string[]>;
}

export async function submitVipLead(
  formData: LeadFormData
): Promise<LeadSubmissionResult> {
  try {
    // Validate schema on server
    const validatedData = LeadSchema.parse(formData);

    // Simulate backend CRM / Squadra Corse dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));

    const leadId = `LMB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    return {
      success: true,
      message: `Reservation confirmed for ${validatedData.fullName}. Your dedicated Lamborghini Concierge will contact you within 24 hours.`,
      leadId,
    };
  } catch (error: any) {
    if (error?.errors) {
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err: any) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });
      return {
        success: false,
        message: "Please correct the highlighted errors in the form.",
        errors: fieldErrors,
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while transmitting your request. Please try again.",
    };
  }
}
