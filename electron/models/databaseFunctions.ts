import { PostLostItemType } from "../preload";
import { db } from "./dbConnection";

export function getLostItemsReported() {
  const qry = "SELECT * FROM lost_items;";
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
