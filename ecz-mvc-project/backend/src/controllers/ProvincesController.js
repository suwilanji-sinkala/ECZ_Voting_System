const sqlite3 = require('sqlite3').verbose();
const Province = require('../models/Province');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class ProvinceController {
    static getAll(req, res) {
        db.all('SELECT * FROM Provinces', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new Province(row)));
        });
    }

    static getById(req, res) {
        const { provinceCode } = req.params;
        db.get('SELECT * FROM Provinces WHERE provinceCode = ?', [provinceCode], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Province not found' });
            res.json(new Province(row));
        });
    }

    static create(req, res) {
        const { provinceCode, provinceName } = req.body;
        db.run(
            `INSERT INTO Provinces (provinceCode, provinceName) VALUES (?, ?)`,
            [provinceCode, provinceName],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ provinceCode, provinceName });
            }
        );
    }

    static update(req, res) {
        const { provinceCode } = req.params;
        const { provinceName } = req.body;
        db.run(
            `UPDATE Provinces SET provinceName=? WHERE provinceCode=?`,
            [provinceName, provinceCode],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { provinceCode } = req.params;
        db.run(`DELETE FROM Provinces WHERE provinceCode=?`, [provinceCode], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports