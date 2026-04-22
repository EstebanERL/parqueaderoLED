const db = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, categoria, capacidad_maxima FROM tipos_vehiculo ORDER BY id`
    );
    res.json(rows);
  } catch (e) { next(e); }
};
