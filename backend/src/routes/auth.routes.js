const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authRequired } = require('../middlewares/auth.middleware');

router.post('/login', ctrl.login);
router.get('/me', authRequired, ctrl.me);

module.exports = router;
