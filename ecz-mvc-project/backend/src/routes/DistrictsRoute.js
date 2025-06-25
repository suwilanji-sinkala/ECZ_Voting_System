const express = require('express');
const router = express.Router();
const DistrictController = require('../controllers/DistrictController');

router.get('/', DistrictController.getAll);
router.get('/:districtCode', DistrictController.getById);
router.post('/', DistrictController.create);
router.put('/:districtCode', DistrictController.update);
router.delete('/:districtCode', DistrictController.delete);

module.exports = router;