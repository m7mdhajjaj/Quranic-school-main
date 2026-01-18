// types/profile.types.ts
// Use UserProfile from API to avoid type conflicts
export type { UserProfile } from "@/Api/profileApi";

export type Endpoint = "students" | "teachers" | "admins" | "secretaries" | "teacher-assistants";

export type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok" }
  | { status: "redirecting"; message?: string }
  | { status: "error"; message: string };

export interface RoleConfig {
  label: string;
  icon: string;
}
