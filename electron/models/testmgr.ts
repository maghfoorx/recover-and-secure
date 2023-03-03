import { db } from "./dbConnection";

export function getNames() {
  const qry = "SELECT * FROM names";
  let statement = db.prepare(qry);
  statement.all((err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("The result is", rows);
      return rows;
    }
    statement.finalize();
  });
}

getNames();
