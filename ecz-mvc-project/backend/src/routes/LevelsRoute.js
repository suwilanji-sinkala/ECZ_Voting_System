const express = require('express');
const router = express.Router();
const LevelController = require('../controllers/LevelController');

router.get('/', LevelController.getAll);
router.get('/:levelId', LevelController.getById);
router.post('/', LevelController.create);
router.put('/:levelId', LevelController.update);
router.delete('/:levelId', LevelController.delete);

module.exports = router;