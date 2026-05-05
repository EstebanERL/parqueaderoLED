const db = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT t.id, t.tipo_vehiculo_id, tv.nombre AS tipo, tv.categoria,
              t.unidad, t.valor, t.valor_fraccion_minutos, t.actualizado_en
         FROM tarifas t JOIN tipos_vehiculo tv ON tv.id = t.tipo_vehiculo_id
         ORDER BY tv.id`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { unidad, valor, valor_fraccion_minutos } = req.body;
    const unidadesValidas = ['minuto','hora','dia','fraccion'];
    if (!unidadesValidas.includes(unidad))
      return res.status(400).json({ error: 'Unidad inválida' });
    if (valor == null || Number(valor) < 0)
      return res.status(400).json({ error: 'Valor inválido' });

    await db.query(
      `UPDATE tarifas SET unidad=:unidad, valor=:valor,
              valor_fraccion_minutos=:frac WHERE id=:id`,
      {
        id: req.params.id,
        unidad,
        valor: Number(valor),
        frac: valor_fraccion_minutos || 15,
      }
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
};
