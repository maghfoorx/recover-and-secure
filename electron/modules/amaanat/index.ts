import db from "../../database";
import {
  AddAmaanatItemType,
  AmaanatUserType,
  ReturnAmaanatType,
} from "../types";

// Get all amaanat users
export function getAllAmaanatUsers() {
  return db("amaanat_users").orderBy("id", "desc");
}

// Get a specific amaanat user by ID
export function getAmaanatUser(id: number) {
  return db("amaanat_users").where({ id }).first();
}

// Register a new amaanat user
export function addAmaanatUser(data: any) {
  return db("amaanat_users")
    .insert({
      name: data.name,
      aims_no: data.aims_no,
      phone_no: data.phone_no,
      jamaat: data.jamaat,
    })
    .returning("*")
    .then((result: any[]) => result[0]);
}

// Get all items for a specific user
export function getUserAmaanatItems(userId: number) {
  return db("amaanat_items").where({ user_id: userId });
}

// Add a new amaanat item
export function addAmaanatItem(data: any) {
  return db("amaanat_items")
    .insert({
      user_id: data.user_id,
      item_name: data.item_name,
      item_details: data.item_details,
      stored_location: data.stored_location,
      entry_date: db.fn.now(),
    })
    .returning("*")
    .then((result: any[]) => {
      return result[0];
    });
}

// Return an amaanat item
export function returnAmaanatItem(data: ReturnAmaanatType) {
  return db("amaanat_items")
    .where({ id: data.id })
    .update({
      returned: true,
      returned_by: data.returnedBy,
      returned_date: db.fn.now(),
    })
    .returning("*");
}

// Get total amaanat items
export function getTotalAmaanatItems() {
  return db("amaanat_items").select("*");
}
