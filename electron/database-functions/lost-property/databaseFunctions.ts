import { PostFoundItem, PostLostItemType, ReturnFormType } from "../../preload";
import { db } from "../dbConnection";

// getting all lost items reported from lost_items table
export function getLostItemsReported() {
  const qry = "SELECT * FROM lost_items;";
  return new Promise((resolve, reject) => {
    let statement = db.prepare(qry);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        const formattedData = rows.map((item) => {
          if (item.ItemFound === 0) {
            return { ...item, ItemFound: "No" };
          } else {
            return { ...item, ItemFound: "Yes" };
          }
        });
        resolve(formattedData);
      }
      statement.finalize();
    });
  });
}

//getting items from found_items table
export function getFoundItemsReported() {
  const qry = `
  SELECT
    found_items.*,
    returned_items.ReturnDate,
    returned_items.PersonName,
    returned_items.AimsNumber,
    returned_items.ReturnedBy
  FROM
    found_items
    LEFT JOIN returned_items ON found_items.ID = returned_items.ItemID;`;
  return new Promise((resolve, reject) => {
    let statement = db.prepare(qry);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        resolve(rows);
      }
      statement.finalize();
    });
  });
}

//inserting a lost item
export function postLostItem(data: PostLostItemType) {
  const { PersonName, ItemName, AimsID, Details, LostArea, PhoneNumber } = data;

  const query = `INSERT INTO lost_items (ItemName, Details, LostArea, PersonName, AimsID, PhoneNumber) VALUES ('${ItemName}', '${Details}', '${LostArea}', '${PersonName}', '${AimsID}', '${PhoneNumber}');
  `;
  return new Promise((resolve, reject) => {
    let statement = db.prepare(query);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err.message);
      } else {
        resolve(rows);
      }
      statement.finalize();
    });
  });
}

//inserting a found item
export function postFoundItem(data: PostFoundItem) {
  let query = `INSERT INTO found_items (ItemName, Details, FoundArea) VALUES ('${data.ItemName}', '${data.Details}', '${data.FoundArea}')`;
  if (data.FinderName && data.AIMSNumber) {
    query = `INSERT INTO found_items (ItemName, Details, FoundArea, FinderName, AIMSNumber) VALUES ('${data.ItemName}', '${data.Details}', '${data.FoundArea}', '${data.FinderName}', '${data.AIMSNumber}')`
  }
  return new Promise((resolve, reject) => {
    let statement = db.prepare(query);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err.message)
      } else {
        resolve(rows)
      }
      statement.finalize();
    })
  })
}

//deleting a Lost item
export function deleteLostItem(id: number) {
  const query = `DELETE FROM lost_items WHERE ID = ${id}`;
  return new Promise((resolve, reject) => {
    let statement = db.prepare(query);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err.message);
      } else {
        resolve(rows);
      }
      statement.finalize();
    });
  });
}

//deleting a Found Item
export function deleteFoundItem(id: number) {
  deleteReturnedItem(id)
  const query = `DELETE FROM found_items WHERE ID = ${id}; DELETE FROM returned_items WHERE ItemID = ${id};`
  return new Promise((resolve, reject) => {
    let statement = db.prepare(query)
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message)
        reject(err.message)
      } else {
        resolve(rows);
      }
      statement.finalize();
    })
  })
}

function deleteReturnedItem(id: number) {
  const query = `DELETE FROM returned_items WHERE ItemID = ${id}`
  return new Promise((resolve, reject) => {
    let statement = db.prepare(query);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message)
        reject(err.message)
      } else {
        resolve(rows)
      }
      statement.finalize();
    })
  })
}

//Found a lost reported item
export function updateFoundColumn(id: number) {
  const query = `UPDATE lost_items SET ItemFound = 1 WHERE ID = ${id}`;
  return new Promise((resolve, reject) => {
    let statement = db.prepare(query);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err.message);
      } else {
        resolve(rows);
      }
      statement.finalize();
    });
  });
}

//Returned a found item
export function returnFoundItem({itemID, PersonName, AimsNumber, ReturnedBy}: ReturnFormType) {
  const query = `
  INSERT INTO returned_items 
  (ItemID, PersonName, AimsNumber, ReturnedBy)
  VALUES
  (${itemID}, "${PersonName}", "${AimsNumber}", "${ReturnedBy}")`
  return new Promise((resolve, reject) => {
    let statement = db.prepare(query);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message)
        reject(err.message)
      } else {
        resolve(rows)
      }
      statement.finalize();
    })
  })
}
