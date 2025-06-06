/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as amaanat_mutations from "../amaanat/mutations.js";
import type * as amaanat_queries from "../amaanat/queries.js";
import type * as location_mutations from "../location/mutations.js";
import type * as location_queries from "../location/queries.js";
import type * as lostProperty_mutations from "../lostProperty/mutations.js";
import type * as lostProperty_queries from "../lostProperty/queries.js";
import type * as types from "../types.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "amaanat/mutations": typeof amaanat_mutations;
  "amaanat/queries": typeof amaanat_queries;
  "location/mutations": typeof location_mutations;
  "location/queries": typeof location_queries;
  "lostProperty/mutations": typeof lostProperty_mutations;
  "lostProperty/queries": typeof lostProperty_queries;
  types: typeof types;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
