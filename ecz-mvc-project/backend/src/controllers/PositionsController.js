const sqlite3 = require('sqlite3').verbose();
const Position = require('../models/Position');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class PositionController {
    static getAll(req, res) {
        db.all('SELECT * FROM Positions', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Position(row)));
        });
    }

    static getById(req, res) {
        const { positionId } = req.params;
        db.get('SELECT * FROM Positions WHERE positionId = ?', [positionId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Position not found' });
            res.json(new Position(row));
        });
    }

    static create(req, res) {
        const { positionName } = req.body;
        db.run(
            `INSERT INTO Positions (positionName) VALUES (?)`,
            [positionName],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ positionId: this.lastID, positionName });
            }
        );
    }

    static update(req, res) {
        const { positionId } = req.params;
        const { positionName } = req.body;
        db.run(
            `UPDATE Positions SET positionName=? WHERE positionId=?`,
            [positionName, positionId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { positionId } = req.params;
        db.run(`DELETE FROM Positions WHERE positionId=?`, [positionId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports