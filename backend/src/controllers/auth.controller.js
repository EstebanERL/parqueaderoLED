const bcrypt = require('bcrypt');
const db = require('../config/db');
const { signToken } = require('../config/jwt');

exports.login = async (req, res, next) => {
  try {
    console.log("DB_HOST:", process.env.DB_HOST);

    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email y password requeridos' });

    const [rows] = await db.query(
      `SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id = u.rol_id
       WHERE u.email = :email LIMIT 1`,
      { email }
    );
    
    const user = rows[0];
    if (!user || !user.activo) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signToken({ id: user.id, email: user.email, rol: user.rol, nombre: user.nombre });
    res.json({
      token,
      usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  res.json({ usuario: req.user });
};
