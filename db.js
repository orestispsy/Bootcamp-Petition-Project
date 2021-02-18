const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.getAllSignatures = () => {
    const q = `
        SELECT *
        FROM signatures
    `;
    return db.query(q);
};

module.exports.addSignatures= (firstname, lastname, signature) => {
    const q = `
        INSERT INTO signatures (firstname, lastname, signature)
        VALUES ($1, $2, $3)
        RETURNING id
    `;
    const params = [firstname, lastname, signature];
    console.log("q: ", q);
    return db.query(q, params);
};

module.exports.getSignatureId = (id) => {
    const q = `
        SELECT signature FROM signatures WHERE id = $1;
    `;
    const params = [id];
    return db.query(q, params);
};
