const sqlite3 = require('sqlite3').verbose();
const District = require('../models/District');
const db = new sqlite3.Database('./db/ecz_db_1.4.db');

class DistrictController {
    static getAll(req, res) {
        db.all('SELECT * FROM Districts', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => new District(row)));
        });
    }

    static getById(req, res) {
        const { districtCode } = req.params;
        db.get('SELECT * FROM Districts WHERE districtCode = ?', [districtCode], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'District not found' });
            res.json(new District(row));
        });
    }

    static create(req, res) {
        const { districtCode, districtName, provinceCode } = req.body;
        db.run(
            `INSERT INTO Districts (districtCode, districtName, provinceCode) VALUES (?, ?, ?)`,
            [districtCode, districtName, provinceCode],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ districtCode, districtName, provinceCode });
            }
        );
    }

    static update(req, res) {
        const { districtCode } = req.params;
        const { districtName, provinceCode } = req.body;
        db.run(
            `UPDATE Districts SET districtName=?, provinceCode=? WHERE districtCode=?`,
            [districtName, provinceCode, districtCode],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    }

    static delete(req, res) {
        const { districtCode } = req.params;
        db.run(`DELETE FROM Districts WHERE districtCode=?`, [districtCode], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    }
}

module.exports = DistrictController;