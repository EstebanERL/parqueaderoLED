const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo, u.creado_en
         FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.id DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.crear = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol)
      return res.status(400).json({ error: 'Campos requeridos: nombre, email, password, rol' });

    const [[rolRow]] = await db.query(`SELECT id FROM roles WHERE nombre = :rol`, { rol });
    if (!rolRow) return res.status(400).json({ error: 'Rol inválido' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      `INSERT INTO usuarios (nombre,email,password_hash,rol_id) VALUES (:nombre,:email,:hash,:rol_id)`,
      { nombre, email, hash, rol_id: rolRow.id }
    );
    res.status(201).json({ id: r.insertId, nombre, email, rol });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email ya registrado' });
    next(e);
  }
};

exports.desactivar = async (req, res, next) => {
  try {
    await db.query(`UPDATE usuarios SET activo=0 WHERE id=:id`, { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { next(e); }
};
