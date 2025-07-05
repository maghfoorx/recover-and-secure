// convex/types.ts
import { Doc, Id } from "./_generated/dataModel";

// Types for your amaanat system
export type AmaanatUser = Doc<"amaanat_users">;
export type AmaanatItem = Doc<"amaanat_items">;
export type LostItem = Doc<"lost_items">;
export type FoundItem = Doc<"found_items">;

// Input types for mutations
export interface AddAmaanatUserType {
  name: string;
  aims_number?: string;
  jamaat?: string;
  phone_number?: string;
}

export interface AddAmaanatItemType {
  user_id: Id<"amaanat_users">;
  name: string;
  details?: string;
  location?: string;
}

export interface ReturnAmaanatType {
  id: Id<"amaanat_items">;
  returned_by: string;
}

// Extended types with relations
export interface AmaanatItemWithUser extends AmaanatItem {
  user: AmaanatUser | null;
}

export interface AmaanatUserWithItems extends AmaanatUser {
  items: AmaanatItem[];
}

export const LOCATION_COLOUR_BY_SIZE: Record<
  "x_small" | "small" | "medium" | "large" | "x_large" | "bulky_storage",
  string
> = {
  x_small: "bg-pink-100",
  small: "bg-rose-100",
  medium: "bg-orange-100",
  large: "bg-green-100",
  x_large: "bg-teal-100",
  bulky_storage: "bg-sky-100",
};

export const LOCATION_NAME_BY_ID: Record<
  "x_small" | "small" | "medium" | "large" | "x_large" | "bulky_storage",
  "Extra small" | "Small" | "Medium" | "Large" | "Extra large" | "Bulky storage"
> = {
  x_small: "Extra small",
  small: "Small",
  medium: "Medium",
  large: "Large",
  x_large: "Extra large",
  bulky_storage: "Bulky storage",
};
