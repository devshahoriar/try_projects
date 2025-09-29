import { z } from "zod";

export const rowSchema = z.object({
  domain: z
    .string({
      required_error: "Domain is required",
    })
    .min(1, "Domain cannot be empty"),
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(1, "Title cannot be empty"),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(3, "Description cannot be empty"),
  phone: z
    .string({
      required_error: "Phone is required",
    })
    .min(3, "Phone cannot be empty"),
  address: z
    .string({
      required_error: "Address is required",
    })
    // bangladeshi context
    .min(11, "Address cannot be empty"),
});

export const arrayRowSchema = z.array(rowSchema);


export type CSVRow = z.infer<typeof rowSchema>;