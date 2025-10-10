import { z } from 'zod';

// Auth validations
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Adresse email invalide" })
  .max(255, { message: "L'email ne peut pas dépasser 255 caractères" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
  .max(72, { message: "Le mot de passe ne peut pas dépasser 72 caractères" })
  .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule" })
  .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
  .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" });

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sanitize user inputs to prevent XSS
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Validate and sanitize email for external APIs (like WhatsApp)
export const sanitizeEmail = (email: string): string => {
  const parsed = emailSchema.parse(email);
  return encodeURIComponent(parsed);
};
