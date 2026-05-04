const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

exports.signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
exports.verifyToken = (token) => jwt.verify(token, SECRET);
