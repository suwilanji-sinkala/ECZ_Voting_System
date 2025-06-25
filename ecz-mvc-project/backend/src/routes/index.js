const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/index');

// Define routes
router.get('/items', getItems);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

module.exports = router;