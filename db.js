const spicedPg = require("spiced-pg");

const db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/signatures");

module.exports.getAllSigners = () => {
    const q = `
         SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.homepage 
    FROM users
    JOIN signatures
    ON users.id = signatures.user_id
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    `;
    return db.query(q);
};

module.exports.getAllSignersByCity = (city) => {
    const q = `
         SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.homepage 
    FROM users
    JOIN signatures
    ON users.id = signatures.user_id
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    WHERE LOWER(user_profiles.city) = LOWER($1)
    `;
    const params = [city];
    return db.query(q, params);
};

module.exports.addSignatures = (user_id, signature) => {
    const q = `
        INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING id, user_id, signature
    `;
    const params = [user_id, signature];
    console.log("q: ", q);
    return db.query(q, params);
};

module.exports.getSignature = (id) => {
    const q = `
        SELECT signature FROM signatures WHERE id = $1;
    `;
    const params = [id];
    return db.query(q, params);
};

 module.exports.getLoginSignature = (user_id) => {
const q = `
        SELECT id, user_id, signature FROM signatures WHERE user_id = $1
    `;
const params = [user_id];
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

module.exports.getPasswordHashed = (email) => {
    const q = `
        SELECT id, password_hash
        FROM users WHERE email = $1
    `;
   const params = [email];
   return db.query(q, params);
};

module.exports.addUserProfile = (
    age,
    city,
    homepage,
    user_id
) => {
    const q = `
        INSERT INTO user_profiles (age, city, homepage, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `;
    const params = [age, city, homepage, user_id];
    return db.query(q, params);
};

module.exports.getUserToEdit = (id) => {
    const q = `
        SELECT users.id, users.firstname, users.lastname, users.email, users.password_hash, user_profiles.age, user_profiles.city, user_profiles.homepage 
    FROM users
    JOIN signatures
    ON users.id = signatures.user_id
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
	WHERE users.id = $1
    `;
    const params = [id];
    return db.query(q, params);
};

module.exports.updateUserLogin = (firstname, lastname, email, password_hash, id) => {
    const q = `
        UPDATE users
SET firstname = $1, lastname = $2, email = $3, password_hash = $4
WHERE users.id = $5
    `;
    const params = [firstname, lastname, email, password_hash, id];
    return db.query(q, params);
};

module.exports.updateUserProfile = (
    age,
    city,
    homepage,
    id
) => {
    const q = `
        INSERT INTO user_profiles (age, city, homepage, user_id)
        VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age=$1, city = $2, homepage = $3
    `;
    const params = [age, city, homepage, id];
    return db.query(q, params);
};

module.exports.deleteSignature = (user_id) => {
    const q = `
        DELETE FROM signatures
WHERE signatures.user_id = $1
    `;
    const params = [user_id];
    return db.query(q, params);
};

module.exports.deleteUserProfile = (user_id) => {
    const q = `
        DELETE FROM user_profiles
WHERE user_profiles.user_id = $1
    `;
    const params = [user_id];
    return db.query(q, params);
};

module.exports.deleteUser = (user_id) => {
    const q = `
        DELETE FROM users
WHERE users.id = $1
    `;
    const params = [user_id];
    return db.query(q, params);
};


