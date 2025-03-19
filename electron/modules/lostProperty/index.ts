import db from "../../database";
import { PostLostItemType, ReturnFormType } from "../types";

// Getting all lost items reported
export async function getLostItemsReported() {
  try {
    const rows = await db("lost_items").select("*");

    return rows.map((item) => ({
      ...item,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Getting all found items reported
export async function getFoundItemsReported() {
  try {
    return await db("found_items").select("*");
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Inserting a lost item
export async function postLostItem(data: PostLostItemType) {
  try {
    return await db("lost_items").insert(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Inserting a found item
export async function postFoundItem(data: any) {
  try {
    return await db("found_items").insert(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Deleting a lost item
export async function deleteLostItem(id: number) {
  try {
    return await db("lost_items").where({ id }).del();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Deleting a found item
export async function deleteFoundItem(id: number) {
  try {
    return await db("found_items").where({ id }).del();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Updating lost item as found
export async function updateFoundColumn(id: number) {
  try {
    return await db("lost_items").where({ id }).update({ is_found: true });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Marking a lost item as not found
export async function unFoundLostItem(id: number) {
  try {
    return await db("lost_items").where({ id }).update({ is_found: false });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Returning a found item
export async function returnFoundItem({
  returned_by,
  returned_to_name,
  returned_to_aims_number,
  id,
}: ReturnFormType) {
  try {
    return await db("found_items").where({ id }).update({
      is_returned: true,
      returned_at: db.fn.now(),
      returned_by,
      returned_to_name,
      returned_to_aims_number,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
