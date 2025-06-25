const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/ecz_db_1.4.db');
const db = new sqlite3.Database(dbPath);

// Fetch all items from the database
const fetchItems = (callback) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
};

// Add a new item to the database
const addItem = (item, callback) => {
    const { name, description } = item;
    db.run('INSERT INTO items (name, description) VALUES (?, ?)', [name, description], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id: this.lastID, ...item });
        }
    });
};

// Update an existing item in the database
const updateItem = (id, item, callback) => {
    const { name, description } = item;
    db.run('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, id], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id, ...item });
        }
    });
};

// Remove an item from the database
const removeItem = (id, callback) => {
    db.run('DELETE FROM items WHERE id = ?', id, function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id });
        }
    });
};

module.exports = {
    fetchItems,
    addItem,
    updateItem,
    removeItem
};