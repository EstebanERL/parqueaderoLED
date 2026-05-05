const router = require('express').Router();
const ctrl = require('../controllers/tarifa.controller');
const { authRequired, requireRole } = require('../middlewares/auth.middleware');

router.get('/', authRequired, ctrl.listar);
router.put('/:id', authRequired, requireRole('administrador'), ctrl.actualizar);

module.exports = router;
