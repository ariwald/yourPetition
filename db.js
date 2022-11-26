const spicedPg = require("spiced-pg");
const db = spicedPg(
  process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignatures = function() {
  return db.query(`SELECT * FROM signatures`).then(({ rows }) => rows);
};

module.exports.getSigId = function(userId) {
  return db
    .query(`SELECT id FROM signatures WHERE user_id = $1`, [userId])
    .then(({ rows }) => rows);
};

//used for post/register
module.exports.userRegister = (name, lastname, email, password) => {
  return db.query(
    `INSERT INTO users (name, lastname, email, password)
        VALUES ($1, $2, $3, $4) RETURNING id`,
    [name, lastname, email, password]
  );
};

//used for post login
module.exports.getUsersEmail = function(email) {
  return db
    .query(`SELECT * FROM users WHERE email=$1`, [email])
    .then(({ rows }) => rows);
};

//used for post login
module.exports.verifyPassword = function(email) {
  return db.query(
    `SELECT
            users.id,
            users.name,
            users.lastname,
            users.password,
            signatures.id
        FROM
            users
        LEFT JOIN signatures
        ON users.id = signatures.user_id
        WHERE
            users.email = $1`,
    [email]
  );
};

//used for post profile
exports.insertProfile = function(age, city, url, userId) {
  if (age == "") {
    return db.query(
      `INSERT INTO user_profiles (city, url, user_id)
        VALUES ($1, $2, $3)`,
      [city, url, userId]
    );
  } else {
    return db.query(
      `INSERT INTO user_profiles (city, url, user_id)
    VALUES ($1, $2, $3)`,
      [city, url, userId]
    );
  }
};

//used for post/petition
exports.addInfo = function(userId, signature) {
  return db.query(
    //user_id refers to my sql file, table
    //userId refers to my server, variable
    `INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2) RETURNING id`,
    [userId, signature]
  );
};

//used for get thanks
exports.getSignature = function(id) {
  return db
    .query(
      `
        SELECT signature FROM signatures WHERE id = $1`,
      [id]
    )
    .then(({ rows }) => rows);
};

//used for get signatures
module.exports.getInfo = function() {
  return db
    .query(
      `SELECT DISTINCT
                signatures.user_id, age, city, url, name, lastname
            FROM
                signatures
            JOIN
                user_profiles
            ON
                signatures.user_id = user_profiles.user_id
            JOIN
                users
            ON
                users.id = signatures.user_id
        `
    )
    .then(({ rows }) => rows);
};

//used for post get signatures city
exports.getCity = function(userCity) {
  return db.query(
    `SELECT name, lastname, age, city, url
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        JOIN signatures
        ON users.id = signatures.user_id
        WHERE LOWER(city) = LOWER($1)`,
    [userCity]
  );
};

module.exports.getProfile = function(user_id) {
  return db
    .query(
      `SELECT name, lastname, email, password, age, city, url
            FROM users
            LEFT OUTER JOIN user_profiles
            ON users.id = user_profiles.user_id
            WHERE user_id = $1`,
      [user_id]
    )
    .then(({ rows }) => rows);
};

module.exports.updateUser = function(name, lastname, email, password, user_id) {
  return db.query(
    `UPDATE users
        SET name = $1, lastname = $2, email = $3, password = $4
        WHERE id = $5`,
    [name, lastname, email, password, user_id]
  );
};

module.exports.upsertProfile = function(age, city, url, user_id) {
  return db.query(
    `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3`,
    [age, city, url, user_id]
  );
};

module.exports.updateUserSame = function(name, lastname, email, user_id) {
  return db.query(
    `UPDATE users
        SET name = $1, lastname = $2, email = $3
        WHERE id = $4`,
    [name, lastname, email, user_id]
  );
};

module.exports.deleteSignature = function(signatureId) {
  return db.query(`DELETE FROM signatures WHERE id = $1`, [signatureId]);
};
