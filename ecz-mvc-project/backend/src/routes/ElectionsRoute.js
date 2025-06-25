const express = require('express');
const router = express.Router();
const ElectionController = require('../controllers/ElectionController');

router.get('/', ElectionController.getAll);
router.get('/:electionId', ElectionController.getById);
router.post('/', ElectionController.create);
router.put('/:electionId', ElectionController.update);
router.delete('/:electionId', ElectionController.delete);

module.exports = router;