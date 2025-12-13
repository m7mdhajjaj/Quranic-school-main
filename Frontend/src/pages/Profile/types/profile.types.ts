// types/profile.types.ts
// Use UserProfile from API to avoid type conflicts
export type { UserProfile } from "@/Api/profileApi";

export type Endpoint = "students" | "teachers" | "admins";

export type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok" }
  | { status: "error"; message: string };

export interface RoleConfig {
  label: string;
  icon: string;
}
