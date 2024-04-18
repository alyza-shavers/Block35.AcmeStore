const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Route to get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.fetchProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get favorites for a user
app.get('/api/users/:id/favorites', async (req, res) => {
  const userId = req.params.id;
  try {
    const favorites = await db.fetchFavorites(userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to create a favorite for a user
app.post('/api/users/:id/favorites', async (req, res) => {
  const userId = req.params.id;
  const { product_id } = req.body;
  try {
    const favorite = await db.createFavorite(product_id, userId);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to delete a favorite for a user
app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
  const userId = req.params.userId;
  const favoriteId = req.params.id;
  try {
    await db.destroyFavorite(favoriteId);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize database tables
db.createTables();
