/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Authentication types
export type UserRole = "parent" | "teacher" | "principal";

export interface AuthUser {
  username: string;
  role: UserRole;
  studentId?: number; // For parents, links to their student
}

export interface LoginRequest {
  username: string;
  role: UserRole;
}
