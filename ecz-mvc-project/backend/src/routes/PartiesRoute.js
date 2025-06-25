const express = require('express');
const router = express.Router();
const PartyController = require('../controllers/PartyController');

router.get('/', PartyController.getAll);
router.get('/:partyId', PartyController.getById);
router.post('/', PartyController.create);
router.put('/:partyId', PartyController.update);
router.delete('/:partyId', PartyController.delete);

module.exports = router;