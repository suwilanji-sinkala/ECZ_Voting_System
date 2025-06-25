const express = require('express');
const router = express.Router();
const CandidateController = require('../controllers/CandidateController');

router.get('/', CandidateController.getAll);
router.get('/:candidateId', CandidateController.getById);
router.post('/', CandidateController.create);
router.put('/:candidateId', CandidateController.update);
router.delete('/:candidateId', CandidateController.delete);

module.exports = router;