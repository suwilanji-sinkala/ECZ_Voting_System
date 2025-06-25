const sqlite3 = require('sqlite3').verbose();
const Election = require('../models/Election');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class ElectionController {
    static getAll(req, res) {
        db.all('SELECT * FROM Elections', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Election(row)));
        });
    }

    static getById(req, res) {
        const { electionId } = req.params;
        db.get('SELECT * FROM Elections WHERE electionId = ?', [electionId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Election not found' });
            res.json(new Election(row));
        });
    }

    static create(req, res) {
        const { year, electionType } = req.body;
        db.run(
            `INSERT INTO Elections (year, electionType) VALUES (?, ?)`,
            [year, electionType],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ electionId: this.lastID, year, electionType });
            }
        );
    }

    static update(req, res) {
        const { electionId } = req.params;
        const { year, electionType } = req.body;
        db.run(
            `UPDATE Elections SET year=?, electionType=? WHERE electionId=?`,
            [year, electionType, electionId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { electionId } = req.params;
                db.run(`DELETE FROM Elections WHERE electionId=?`, [electionId], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ deleted: this.changes });
                });
            }
        }
        
        module.exports = ElectionController;