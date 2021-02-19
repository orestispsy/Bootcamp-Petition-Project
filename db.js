const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.getAllSignatures = () => {
    const q = `
        SELECT *
        FROM signatures
    `;
    return db.query(q);
};

module.exports.addSignatures= (signature) => {
    const q = `
        INSERT INTO signatures (signature)
        VALUES ($1)
        RETURNING id
    `;
    const params = [signature];
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

module.exports.addRegistration = (firstname, lastname, email, password_hash) => {
    const q = `
        INSERT INTO users (firstname, lastname, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `;
    const params = [firstname, lastname, email, password_hash];
    return db.query(q, params);
};

module.exports.addRegistration = (
    firstname,
    lastname,
    email,
    password_hash
) => {
    const q = `
        INSERT INTO users (firstname, lastname, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `;
    const params = [firstname, lastname, email, password_hash];
    return db.query(q, params);
};

module.exports.getPasswordHashed = (email) => {
    const q = `
        SELECT password_hash
        FROM users WHERE email = $1
    `;
   const params = [email];
   return db.query(q, params);
};