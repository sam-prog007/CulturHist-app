import { z } from 'zod';

/**
 * Schémas de validation pour la sécurité des inputs
 */

export const emailSchema = z.string()
  .trim()
  .email('Email invalide')
  .max(255, 'Email trop long')
  .toLowerCase();

export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe est trop long')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

export const usernameSchema = z.string()
  .trim()
  .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
  .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Seuls les lettres, chiffres, tirets et underscores sont autorisés');

export const textInputSchema = z.string()
  .trim()
  .max(1000, 'Le texte est trop long');

/**
 * Sanitize HTML pour éviter les attaques XSS
 */
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valider et sanitizer un texte utilisateur
 */
export const validateAndSanitizeText = (text: string): string => {
  const validated = textInputSchema.parse(text);
  return sanitizeText(validated);
};
