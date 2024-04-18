// Import necessary libraries
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Create a new PostgreSQL client
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Method to create tables
async function createTables() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        name VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES products(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_favorites UNIQUE (product_id, user_id)
      );
    `);
    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Method to create a product
async function createProduct(name) {
  try {
    const result = await client.query('INSERT INTO products (id, name) VALUES (uuid_generate_v4(), $1) RETURNING *', [name]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Method to create a user
async function createUser(username, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query('INSERT INTO users (id, username, password) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [username, hashedPassword]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Method to fetch users
async function fetchUsers() {
  try {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Method to fetch products
async function fetchProducts() {
  try {
    const result = await client.query('SELECT * FROM products');
    return result.rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Method to fetch favorites for a user
async function fetchFavorites(userId) {
  try {
    const result = await client.query('SELECT * FROM favorites WHERE user_id = $1', [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

// Method to create a favorite
async function createFavorite(productId, userId) {
  try {
    const result = await client.query('INSERT INTO favorites (id, product_id, user_id) VALUES (uuid_generate_v4(), $1, $2) RETURNING *', [productId, userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating favorite:', error);
    throw error;
  }
}

// Method to delete a favorite
async function destroyFavorite(favoriteId) {
  try {
    await client.query('DELETE FROM favorites WHERE id = $1', [favoriteId]);
    console.log('Favorite deleted successfully.');
  } catch (error) {
    console.error('Error deleting favorite:', error);
    throw error;
  }
}

module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  createFavorite,
  destroyFavorite,
};
