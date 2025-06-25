const sqlite3 = require('sqlite3').verbose();
const Voter = require('../models/Voter');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class VoterController {
    static getAll(req, res) {
        db.all('SELECT * FROM Voters', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Voter(row)));
        });
    }

    static getById(req, res) {
        const { id } = req.params;
        db.get('SELECT * FROM Voters WHERE id = ?', [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Voter not found' });
            res.json(new Voter(row));
        });
    }

    static create(req, res) {
        const { firstName, lastName, nrc, ward, constituency, email, passwordHash } = req.body;
        db.run(
            `INSERT INTO Voters (firstName, lastName, nrc, ward, constituency, email, passwordHash) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, nrc, ward, constituency, email, passwordHash],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, ...req.body });
            }
        );
    }

    static update(req, res) {
        const { id } = req.params;
        const { firstName, lastName, nrc, ward, constituency, email, passwordHash } = req.body;
        db.run(
            `UPDATE Voters SET firstName=?, lastName=?, nrc=?, ward=?, constituency=?, email=?, passwordHash=? WHERE id=?`,
            [firstName, lastName, nrc, ward, constituency, email, passwordHash, id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { id } = req.params;
        db.run(`DELETE FROM Voters WHERE id=?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports =