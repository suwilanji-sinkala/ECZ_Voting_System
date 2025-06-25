const express = require('express');
const router = express.Router();
const ElectionVoterController = require('../controllers/ElectionVoterController');

router.get('/', ElectionVoterController.getAll);
router.get('/:id', ElectionVoterController.getById);
router.post('/', ElectionVoterController.create);
router.put('/:id', ElectionVoterController.update);
router.delete('/:id', ElectionVoterController.delete);

module.exports = router;