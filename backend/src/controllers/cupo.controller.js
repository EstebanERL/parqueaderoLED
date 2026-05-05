const db = require('../config/db');

exports.estado = async (req, res, next) => {
  try {
    const [rows] = await db.query(`SELECT * FROM v_cupos`);
    res.json(rows);
  } catch (e) { next(e); }
};
