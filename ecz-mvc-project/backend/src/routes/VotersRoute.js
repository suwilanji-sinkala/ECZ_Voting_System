const express = require('express');
const router = express.Router();
const VoterController = require('../controllers/VoterController');

router.get('/', VoterController.getAll);
router.get('/:id', VoterController.getById);
router.post('/', VoterController.create);
router.put('/:id', VoterController.update);
router.delete('/:id', VoterController.delete);

module.exports = router;