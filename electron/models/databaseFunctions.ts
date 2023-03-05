import { db } from "./dbConnection";

export function getLostItemsReported() {
  const qry = "SELECT * FROM lost_items";
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
