DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL CHECK (name != ''),
    lastname VARCHAR NOT NULL CHECK (lastname != ''),
    email VARCHAR NOT NULL UNIQUE CHECK (email != ''),
    password VARCHAR NOT NULL CHECK (password != ''),
    created timestamp with time zone default now()
);
