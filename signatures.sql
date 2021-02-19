DROP TABLE IF EXISTS signatures;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    firstname    VARCHAR NOT NULL CHECK (firstname <> ''),
    lastname     VARCHAR NOT NULL CHECK (lastname <> ''),
    email         VARCHAR NOT NULL UNIQUE CHECK (email <> ''),
    password_hash VARCHAR NOT NULL CHECK (password_hash <> ''),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature TEXT NOT NULL CHECK (signature <> ''),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
