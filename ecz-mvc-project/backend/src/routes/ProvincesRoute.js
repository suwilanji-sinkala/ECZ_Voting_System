const express = require('express');
const router = express.Router();
const ProvinceController = require('../controllers/ProvinceController');

router.get('/', ProvinceController.getAll);
router.get('/:provinceCode', ProvinceController.getById);
router.post('/', ProvinceController.create);
router.put('/:provinceCode', ProvinceController.update);
router.delete('/:provinceCode', ProvinceController.delete);

module.exports = router;