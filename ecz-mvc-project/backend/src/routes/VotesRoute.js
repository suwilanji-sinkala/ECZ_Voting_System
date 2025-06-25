const express = require('express');
const router = express.Router();
const VoteController = require('../controllers/VoteController');

router.get('/', VoteController.getAll);
router.get('/:voteId', VoteController.getById);
router.post('/', VoteController.create);
router.put('/:voteId', VoteController.update);
router.delete('/:voteId', VoteController.delete);

module.exports = router;