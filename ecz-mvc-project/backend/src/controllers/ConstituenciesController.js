const sqlite3 = require('sqlite3').verbose();
const Constituency = require('../models/Constituency');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class ConstituencyController {
    static getAll(req, res) {
        db.all('SELECT * FROM Constituencies', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Constituency(row)));
        });
    }

    static getById(req, res) {
        const { constituencyCode } = req.params;
        db.get('SELECT * FROM Constituencies WHERE constituencyCode = ?', [constituencyCode], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Constituency not found' });
            res.json(new Constituency(row));
        });
    }

    static create(req, res) {
        const { constituencyCode, constituencyName, districtCode } = req.body;
        db.run(
            `INSERT INTO Constituencies (constituencyCode, constituencyName, districtCode) VALUES (?, ?, ?)`,
            [constituencyCode, constituencyName, districtCode],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ constituencyCode, constituencyName, districtCode });
            }
        );
    }

    static update(req, res) {
        const { constituencyCode } = req.params;
        const { constituencyName, districtCode } = req.body;
        db.run(
            `UPDATE Constituencies SET constituencyName=?, districtCode=? WHERE constituencyCode=?`,
            [constituencyName, districtCode, constituencyCode],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { constituencyCode } = req.params;
        db.run(`DELETE FROM Constituencies WHERE constituencyCode=?`, [constituencyCode], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports = ConstituencyController;