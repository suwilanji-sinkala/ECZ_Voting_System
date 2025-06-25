const express = require('express');
const router = express.Router();
const WardController = require('../controllers/WardController');

router.get('/', WardController.getAll);
router.get('/:wardCode', WardController.getById);
router.post('/', WardController.create);
router.put('/:wardCode', WardController.update);
router.delete('/:wardCode', WardController.delete);

module.exports