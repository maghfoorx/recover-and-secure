import { db } from '../dbConnection'
import { AmaanatUserType } from './amaanatTypes';

//getting all the amaanat users
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

//to register a new user
export function addAmaanatUser(data: AmaanatUserType) {
    const { Name, AIMSNo, PhoneNo } = data
    const query = `INSERT INTO amaanat_users (Name, AIMSNo, PhoneNo) VALUES
    ("${Name}", "${AIMSNo}", "${PhoneNo}") RETURNING *;`
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
    });
};

//getting all the items for a specific user
export function getUserAmaanatItems(ID: number) {
    const query = `SELECT * FROM amaanat_items WHERE UserID = ${ID};`

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
    });
}