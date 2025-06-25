const sqlite3 = require('sqlite3').verbose();
const ElectionVoter = require('../models/ElectionVoter');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class ElectionVoterController {
    static getAll(req, res) {
        db.all('SELECT * FROM Election_Voters', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new ElectionVoter(row)));
        });
    }

    static getById(req, res) {
        const { id } = req.params;
        db.get('SELECT * FROM Election_Voters WHERE id = ?', [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'ElectionVoter not found' });
            res.json(new ElectionVoter(row));
        });
    }

    static create(req, res) {
        const { voter, electionId } = req.body;
        db.run(
            `INSERT INTO Election_Voters (voter, electionId) VALUES (?, ?)`,
            [voter, electionId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, voter, electionId });
            }
        );
    }

    static update(req, res) {
        const { id } = req.params;
        const { voter, electionId } = req.body;
        db.run(
            `UPDATE Election_Voters SET voter=?, electionId=? WHERE id=?`,
            [voter, electionId, id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { id } = req.params;
        db.run(`DELETE FROM Election_Voters WHERE id=?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports =