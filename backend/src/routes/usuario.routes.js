const router = require('express').Router();
const ctrl = require('../controllers/usuario.controller');
const { authRequired, requireRole } = require('../middlewares/auth.middleware');

router.use(authRequired, requireRole('administrador'));
router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.delete('/:id', ctrl.desactivar);

module.exports = router;
