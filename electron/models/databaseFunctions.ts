import { db } from "./dbConnection";

export function getAllData() {
  const qry = "SELECT * FROM names";
  return new Promise((resolve, reject) => {
    let statement = db.prepare(qry);
    statement.all((err, rows) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        console.log("The data is:", rows);
        resolve(rows);
      }
      statement.finalize();
    });
  });
}
