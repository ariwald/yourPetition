DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    -- name VARCHAR NOT NULL CHECK (name !=''),
    -- lastname VARCHAR NOT NULL CHECK (lastname !=''),
    signature VARCHAR NOT NULL CHECK (signature !=''),
    user_id INT NOT NULL REFERENCES users(id)
);
