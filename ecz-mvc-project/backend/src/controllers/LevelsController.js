const sqlite3 = require('sqlite3').verbose();
const Level = require('../models/Level');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class LevelController {
    static getAll(req, res) {
        db.all('SELECT * FROM Levels', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Level(row)));
        });
    }

    static getById(req, res) {
        const { levelId } = req.params;
        db.get('SELECT * FROM Levels WHERE levelId = ?', [levelId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Level not found' });
            res.json(new Level(row));
        });
    }

    static create(req, res) {
        const { name } = req.body;
        db.run(
            `INSERT INTO Levels (name) VALUES (?)`,
            [name],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ levelId: this.lastID, name });
            }
        );
    }

    static update(req, res) {
        const { levelId } = req.params;
        const { name } = req.body;
        db.run(
            `UPDATE Levels SET name=? WHERE levelId=?`,
            [name, levelId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { levelId } = req.params;
        db.run(`DELETE FROM Levels WHERE levelId=?`, [levelId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports =