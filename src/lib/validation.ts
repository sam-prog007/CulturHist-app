import { z } from "zod";

/** Account field rules, shared by sign-up and settings. */
export const emailSchema = z.string()
  .email('Email invalide')
  .max(255, 'Email trop long');

export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

export const usernameSchema = z.string()
  .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
  .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Seuls les lettres, chiffres, tirets et underscores sont autorisés');
