const sqlite3 = require('sqlite3').verbose();
const Ward = require('../models/Ward');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class WardController {
    static getAll(req, res) {
        db.all('SELECT * FROM Wards', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Ward(row)));
        });
    }

    static getById(req, res) {
        const { wardCode } = req.params;
        db.get('SELECT * FROM Wards WHERE wardCode = ?', [wardCode], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Ward not found' });
            res.json(new Ward(row));
        });
    }

    static create(req, res) {
        const { wardCode, wardName, constituencyCode } = req.body;
        db.run(
            `INSERT INTO Wards (wardCode, wardName, constituencyCode) VALUES (?, ?, ?)`,
            [wardCode, wardName, constituencyCode],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ wardCode, wardName, constituencyCode });
            }
        );
    }

    static update(req, res) {
        const { wardCode } = req.params;
        const { wardName, constituencyCode } = req.body;
        db.run(
            `UPDATE Wards SET wardName=?, constituencyCode=? WHERE wardCode=?`,
            [wardName, constituencyCode, wardCode],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { wardCode } = req.params;
        db.run(`DELETE FROM Wards WHERE wardCode=?`, [wardCode], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports