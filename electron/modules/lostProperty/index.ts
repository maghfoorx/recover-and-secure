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

export async function matchLostItemWithFoundItem({ foundItemId, lostItemId }) {
  try {
    return await db.transaction(async (trx) => {
      const [lostItem, foundItem] = await Promise.all([
        trx("lost_items").where("id", lostItemId).first(),
        trx("found_items").where("id", foundItemId).first(),
      ]);

      if (!lostItem) throw new Error("Lost item not found");
      if (!foundItem) throw new Error("Found item not found");
      if (lostItem.found_item_id) throw new Error("Lost item already matched");
      if (foundItem.lost_item_id) throw new Error("Found item already matched");

      await Promise.all([
        trx("lost_items").where("id", lostItemId).update({
          is_found: true,
          found_item_id: foundItemId,
        }),

        trx("found_items").where("id", foundItemId).update({
          lost_item_id: lostItemId,
        }),
      ]);

      return {
        success: true,
        message: `Successfully matched Lost Item ${lostItemId} with Found Item ${foundItemId}`,
      };
    });
  } catch (error) {
    console.error("Matching failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to match items. Please try again.",
    );
  }
}
