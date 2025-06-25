const sqlite3 = require('sqlite3').verbose();
const Candidate = require('../models/Candidate');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class CandidateController {
    static getAll(req, res) {
        db.all('SELECT * FROM Candidates', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Candidate(row)));
        });
    }

    static getById(req, res) {
        const { candidateId } = req.params;
        db.get('SELECT * FROM Candidates WHERE candidateId = ?', [candidateId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Candidate not found' });
            res.json(new Candidate(row));
        });
    }

    static create(req, res) {
        const { candidateName, partyId, wardCode, positionId } = req.body;
        db.run(
            `INSERT INTO Candidates (candidateName, partyId, wardCode, positionId) VALUES (?, ?, ?, ?)`,
            [candidateName, partyId, wardCode, positionId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ candidateId: this.lastID, ...req.body });
            }
        );
    }

    static update(req, res) {
        const { candidateId } = req.params;
        const { candidateName, partyId, wardCode, positionId } = req.body;
        db.run(
            `UPDATE Candidates SET candidateName=?, partyId=?, wardCode=?, positionId=? WHERE candidateId=?`,
            [candidateName, partyId, wardCode, positionId, candidateId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { candidateId } = req.params;
        db.run(`DELETE FROM Candidates WHERE candidateId=?`, [candidateId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports = CandidateController;