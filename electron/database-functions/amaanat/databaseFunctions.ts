import { db } from '../dbConnection'

export function getAllAmaanatUsers() {
    const query = "SELECT * FROM amaanat_users;";
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