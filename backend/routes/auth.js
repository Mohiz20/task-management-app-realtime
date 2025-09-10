const router = require('express').Router();
const { register, login } = require('../services/authService');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
