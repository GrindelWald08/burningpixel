import { z } from 'zod';

/**
 * Validates that a URL is safe (http or https protocol only)
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true; // Empty URLs are valid (optional fields)
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitizes a URL by removing potentially dangerous protocols
 * Returns empty string if URL is invalid
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  
  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return url;
    }
    return '';
  } catch {
    return '';
  }
};

// Portfolio item validation schema
export const portfolioItemSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  category: z.string()
    .trim()
    .min(1, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),
  description: z.string()
    .trim()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  image_url: z.string()
    .trim()
    .max(2000, 'Image URL must be less than 2000 characters')
    .refine((val) => !val || isValidUrl(val), 'Invalid image URL - must use http or https')
    .optional()
    .nullable(),
  link_url: z.string()
    .trim()
    .max(2000, 'Link URL must be less than 2000 characters')
    .refine((val) => !val || isValidUrl(val), 'Invalid link URL - must use http or https')
    .optional()
    .nullable(),
  sort_order: z.number().int().min(0).max(9999).optional(),
  is_visible: z.boolean().optional(),
});

// Pricing package validation schema
export const pricingPackageSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(999999, 'Price is too large'),
  period: z.string()
    .trim()
    .max(50, 'Period must be less than 50 characters')
    .optional(),
  features: z.array(
    z.string().trim().max(200, 'Feature must be less than 200 characters')
  ).max(20, 'Maximum 20 features allowed').optional(),
  is_popular: z.boolean().optional(),
  discount_percentage: z.number().min(0).max(100).optional().nullable(),
  discount_label: z.string()
    .trim()
    .max(50, 'Discount label must be less than 50 characters')
    .optional()
    .nullable(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type PricingPackageInput = z.infer<typeof pricingPackageSchema>;
