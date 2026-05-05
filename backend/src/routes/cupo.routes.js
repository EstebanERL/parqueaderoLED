const router = require('express').Router();
const ctrl = require('../controllers/cupo.controller');
const { authRequired } = require('../middlewares/auth.middleware');
router.get('/', authRequired, ctrl.estado);
module.exports = router;
