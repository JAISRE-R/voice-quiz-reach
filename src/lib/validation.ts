import { z } from 'zod';

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  displayName: z.string().trim().min(1, 'Display name is required').max(100).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

// Quiz validation schemas
export const quizAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  selectedAnswer: z.number().int().min(0).max(3, 'Invalid answer selection'),
  quizId: z.string().uuid('Invalid quiz ID'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;