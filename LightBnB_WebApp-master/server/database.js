/* eslint-disable no-undef */
/* eslint-disable camelcase */
const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'shakiratkomolafe',
  password: '1234',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = (email) => {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      return (result.rows);
    })
    .catch((err) => {
      return (err.message);
    });

};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = (id) => {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      return (result.rows);
    }).catch((err) => {
      return (err.message);
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  (user) => {
  const password = user.password;
  const email = user.email;
  const name = user.username;
  return pool
    .query(`INSERT INTO users (name, email, password) values($1, $2, $3)`, [name,email,password])
    .then((result) => {
      return (result.rows);
    }).catch((err) => {
      return (err.message);
    });
  
};
exports.addUser = addUser;
/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = (guest_id, limit = 10) => {
  return pool
    .query = `SELECT reservations.*, properties.* FROM reservations 
    JOIN properties ON property_id=properties.id WHERE guest_id=$1 LIMIT $2`,[guest_id, limit]
    .then((result) => {
      return (result.rows);
    }).catch((err) => {
      return (err.message);
    });
  
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */


const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1`;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city LIKE $${queryParams.length} `;
  }

  // 4
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `AND owner_id = $${queryParams.length} `;

  }
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `AND cost_per_night / 100 >= $${queryParams.length - 1}`;
    queryString += `AND cost_per_night / 100 < $${queryParams.length}`;
  }
  // if a minimum_rating is passed in, only return properties with a rating equal to or higher than that.
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `
    GROUP BY properties.id
    HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  } else {

    queryParams.push(limit);
    queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;
  }
  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool
    .query = `INSERT INTO properties (owner_id,title,
  description,thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, 
  province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  values ($1,$2, $3, $4, $5, $6, $7, $8,$9, $10, $11, $12, $13, $14), 
`, [properties.owner_id, properties.title, properties.description,properties.properties.thumbnail_photo_url, properties.cover_photo_url, properties.cost_per_night, properties.street, properties.city, properties.province, properties.post_code, properties.country, properties.parking_spaces, properties.number_of_bathrooms,properties.number_of_bedrooms]
    .then((result) => {
      return (result.rows);
    }).catch((err) => {
      return (err.message);
    });
  
};
exports.addProperty = addProperty;
