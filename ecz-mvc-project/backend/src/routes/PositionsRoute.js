const express = require('express');
const router = express.Router();
const PositionController = require('../controllers/PositionController');

router.get('/', PositionController.getAll);
router.get('/:positionId', PositionController.getById);
router.post('/', PositionController.create);
router.put('/:positionId', PositionController.update);
router.delete('/:positionId', PositionController.delete);

module.exports = router;