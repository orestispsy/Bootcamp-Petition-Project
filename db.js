const spicedPg = require("spiced-pg");

// for the demo, we will "talk" to the cities database you set up this morning
// you will probably want a new database for the petition
// createdb petition
const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.getAllSignatures = () => {
    const q = `
        SELECT *
        FROM signatures
    `;
    return db.query(q);
};

module.exports.addSignatures= (firstname, lastname) => {
    const q = `
        INSERT INTO signatures (firstname, lastname)
        VALUES ($1, $2)
        RETURNING id
    `;
    const params = [firstname, lastname];
    console.log("q: ", q);
    return db.query(q, params);
};
