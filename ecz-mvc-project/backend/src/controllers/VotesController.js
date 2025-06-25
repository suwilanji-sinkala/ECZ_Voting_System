const sqlite3 = require('sqlite3').verbose();
const Vote = require('../models/Vote');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class VoteController {
    static getAll(req, res) {
        db.all('SELECT * FROM Votes', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Vote(row)));
        });
    }

    static getById(req, res) {
        const { voteId } = req.params;
        db.get('SELECT * FROM Votes WHERE voteId = ?', [voteId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Vote not found' });
            res.json(new Vote(row));
        });
    }

    static create(req, res) {
        const { candidateId, wardCode, electionId, voteHash } = req.body;
        db.run(
            `INSERT INTO Votes (candidateId, wardCode, electionId, voteHash) VALUES (?, ?, ?, ?)`,
            [candidateId, wardCode, electionId, voteHash],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ voteId: this.lastID, candidateId, wardCode, electionId, voteHash });
            }
        );
    }

    static update(req, res) {
        const { voteId } = req.params;
        const { candidateId, wardCode, electionId, voteHash } = req.body;
        db.run(
            `UPDATE Votes SET candidateId=?, wardCode=?, electionId=?, voteHash=? WHERE voteId=?`,
            [candidateId, wardCode, electionId, voteHash, voteId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { voteId } = req.params;
        db.run(`DELETE FROM Votes WHERE voteId=?`, [voteId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}