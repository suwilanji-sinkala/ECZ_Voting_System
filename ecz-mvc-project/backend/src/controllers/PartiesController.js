const sqlite3 = require('sqlite3').verbose();
const Party = require('../models/Party');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class PartyController {
    static getAll(req, res) {
        db.all('SELECT * FROM Parties', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Party(row)));
        });
    }

    static getById(req, res) {
        const { partyId } = req.params;
        db.get('SELECT * FROM Parties WHERE partyId = ?', [partyId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Party not found' });
            res.json(new Party(row));
        });
    }

    static create(req, res) {
        const { partyName, partyAcronym, slogan } = req.body;
        db.run(
            `INSERT INTO Parties (partyName, partyAcronym, slogan) VALUES (?, ?, ?)`,
            [partyName, partyAcronym, slogan],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ partyId: this.lastID, partyName, partyAcronym, slogan });
            }
        );
    }

    static update(req, res) {
        const { partyId } = req.params;
        const { partyName, partyAcronym, slogan } = req.body;
        db.run(
            `UPDATE Parties SET partyName=?, partyAcronym=?, slogan=? WHERE partyId=?`,
            [partyName, partyAcronym, slogan, partyId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { partyId } = req.params;
        db.run(`DELETE FROM Parties WHERE partyId=?`, [partyId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports = PartyController;