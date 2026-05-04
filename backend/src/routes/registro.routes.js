const router = require('express').Router();
const ctrl = require('../controllers/registro.controller');
const { authRequired } = require('../middlewares/auth.middleware');

router.use(authRequired);
router.post('/entrada', ctrl.entrada);
router.post('/salida/:id', ctrl.salida);
router.get('/activos', ctrl.activos);
router.get('/historial', ctrl.historial);
router.get('/placa/:placa', ctrl.buscarPorPlaca);

module.exports = router;
