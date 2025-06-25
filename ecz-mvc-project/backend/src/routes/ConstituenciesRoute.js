const express = require('express');
const router = express.Router();
const ConstituencyController = require('../controllers/ConstituencyController');

router.get('/', ConstituencyController.getAll);
router.get('/:constituencyCode', ConstituencyController.getById);
router.post('/', ConstituencyController.create);
router.put('/:constituencyCode', ConstituencyController.update);
router.delete('/:constituencyCode', ConstituencyController.delete);

module.exports = router;