import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  displayName: z.string().min(1, "Display name is required").max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const completeQuestSchema = z.object({
  questId: z.string().cuid("Invalid quest ID"),
  notes: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(300).optional(),
  isPublic: z.boolean().optional(),
});

export const sendFriendRequestSchema = z.object({
  username: z.string().min(3).max(20),
});

export const respondFriendRequestSchema = z.object({
  friendshipId: z.string().cuid(),
  action: z.enum(["accept", "reject"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CompleteQuestInput = z.infer<typeof completeQuestSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
