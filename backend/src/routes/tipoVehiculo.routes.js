const router = require('express').Router();
const ctrl = require('../controllers/tipoVehiculo.controller');
const { authRequired } = require('../middlewares/auth.middleware');
router.get('/', authRequired, ctrl.listar);
module.exports = router;
