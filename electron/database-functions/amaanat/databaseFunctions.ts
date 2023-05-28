import { db } from '../dbConnection'
import { AddAmaanatItemType, AmaanatUserType } from './amaanatTypes';

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

//getting a specific amaanat user by ID
export function getAmaanatUser(ID: string) {
    const query = `SELECT * FROM amaanat_users WHERE ID = "${ID}"`;
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
export function getUserAmaanatItems(ID: string) {
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

//adding an amaanat item
export function AddAmaanatItem(data: AddAmaanatItemType) {
    const { UserID, ItemName, ItemDetails, StoredLocation} = data
    const query = 
    `INSERT INTO amaanat_items
    (UserID, ItemName, ItemDetails, StoredLocation)
    VALUES ("${UserID}", "${ItemName}", "${ItemDetails}", "${StoredLocation}")
    RETURNING *;
    `
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