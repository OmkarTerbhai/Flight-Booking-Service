const express = require('express');
const bookingRoutes = require('./booking')
const { InfoController } = require('../../controllers');

const router = express.Router();

router.get('/info', InfoController.info);

router.use('/booking', bookingRoutes);
module.exports = router;