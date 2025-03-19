import db from "../../database";

// Getting all lost items reported
export async function getLostItemsReported() {
  try {
    const rows = await db("lost_items").select("*");

    return rows.map((item) => ({
      ...item,
      item_found: item.item_found ? "Yes" : "No",
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
export async function postLostItem(data: any) {
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
    return await db("lost_items").where({ id }).update({ item_found: true });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Marking a lost item as not found
export async function unFoundLostItem(id: number) {
  try {
    return await db("lost_items").where({ id }).update({ item_found: false });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Returning a found item
export async function returnFoundItem({
  itemID,
  returned_by,
}: {
  itemID: number;
  returned_by: string;
}) {
  try {
    return await db("found_items").where({ id: itemID }).update({
      returned: true,
      returned_date: db.fn.now(),
      returned_by,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
