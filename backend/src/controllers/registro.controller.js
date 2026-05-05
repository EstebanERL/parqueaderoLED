const db = require('../config/db');
const { calcularCobro, generarCodigoTicket } = require('../utils/tarificador');

const PLACA_RE = /^[A-Z0-9]{5,10}$/;

/**
 * POST /api/registros/entrada
 * Body: { placa, tipo_vehiculo_id }
 */
exports.entrada = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const placa = String(req.body.placa || '').toUpperCase().trim();
    const tipoId = Number(req.body.tipo_vehiculo_id);

    if (!PLACA_RE.test(placa))
      return res.status(400).json({ error: 'Placa inválida (5-10 caracteres alfanuméricos)' });
    if (!tipoId)
      return res.status(400).json({ error: 'tipo_vehiculo_id requerido' });

    await conn.beginTransaction();

    // Tipo de vehículo + categoría
    const [[tipo]] = await conn.query(
      `SELECT id, categoria FROM tipos_vehiculo WHERE id=:id`, { id: tipoId }
    );
    if (!tipo) { await conn.rollback(); return res.status(400).json({ error: 'Tipo inválido' }); }

    // ¿Ya está adentro?
    const [dup] = await conn.query(
      `SELECT id FROM registros WHERE placa=:p AND estado='activo' LIMIT 1`, { p: placa }
    );
    if (dup.length) { await conn.rollback(); return res.status(409).json({ error: 'Vehículo ya está dentro' }); }

    // Validar cupo por categoría
    const capacidad = tipo.categoria === 'auto' ? 30 : 15;
    const [[{ocupados}]] = await conn.query(
      `SELECT COUNT(*) AS ocupados FROM registros r
        JOIN tipos_vehiculo t ON t.id = r.tipo_vehiculo_id
       WHERE r.estado='activo' AND t.categoria=:cat`, { cat: tipo.categoria }
    );
    if (ocupados >= capacidad) {
      await conn.rollback();
      return res.status(409).json({ error: `Sin cupo para ${tipo.categoria}s` });
    }

    // Tomar un espacio libre (opcional)
    const [libres] = await conn.query(
      `SELECT id FROM espacios WHERE categoria=:cat AND ocupado=0 LIMIT 1`,
      { cat: tipo.categoria }
    );
    const espacioId = libres[0]?.id || null;
    if (espacioId) await conn.query(`UPDATE espacios SET ocupado=1 WHERE id=:id`, { id: espacioId });

    const [r] = await conn.query(
      `INSERT INTO registros (placa, tipo_vehiculo_id, espacio_id, usuario_entrada_id)
       VALUES (:placa, :tipo, :esp, :user)`,
      { placa, tipo: tipoId, esp: espacioId, user: req.user.id }
    );

    await conn.commit();
    res.status(201).json({
      id: r.insertId, placa, tipo_vehiculo_id: tipoId, espacio_id: espacioId,
      hora_entrada: new Date(), estado: 'activo'
    });
  } catch (e) { await conn.rollback(); next(e); }
    finally { conn.release(); }
};

/**
 * POST /api/registros/salida/:id
 * Body: { descuento? }
 * Calcula valor, cierra registro, libera espacio, emite ticket.
 */
exports.salida = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const id = Number(req.params.id);
    const descuento = Math.max(0, Number(req.body.descuento || 0));
    await conn.beginTransaction();

    const [[reg]] = await conn.query(
      `SELECT r.*, t.unidad, t.valor, t.valor_fraccion_minutos
         FROM registros r
         JOIN tarifas t ON t.tipo_vehiculo_id = r.tipo_vehiculo_id
        WHERE r.id=:id AND r.estado='activo' FOR UPDATE`, { id }
    );
    if (!reg) { await conn.rollback(); return res.status(404).json({ error: 'Registro no encontrado o ya cerrado' }); }

    const entrada = new Date(reg.hora_entrada);
    const salida = new Date();
    const { minutos, total } = calcularCobro(entrada, salida, {
      unidad: reg.unidad, valor: reg.valor, valor_fraccion_minutos: reg.valor_fraccion_minutos,
    });
    const totalFinal = Math.max(0, total - descuento);

    await conn.query(
      `UPDATE registros SET hora_salida=:sal, minutos_total=:min, valor_pagar=:val,
              descuento=:desc, estado='finalizado', usuario_salida_id=:user
        WHERE id=:id`,
      { sal: salida, min: minutos, val: totalFinal, desc: descuento, user: req.user.id, id }
    );

    if (reg.espacio_id)
      await conn.query(`UPDATE espacios SET ocupado=0 WHERE id=:id`, { id: reg.espacio_id });

    const codigo = generarCodigoTicket();
    await conn.query(
      `INSERT INTO tickets (registro_id, codigo, total) VALUES (:reg, :cod, :tot)`,
      { reg: id, cod: codigo, tot: totalFinal }
    );

    await conn.commit();

    res.json({
      ticket: {
        codigo,
        placa: reg.placa,
        hora_entrada: entrada,
        hora_salida: salida,
        minutos_total: minutos,
        valor_bruto: total,
        descuento,
        total: totalFinal,
      },
    });
  } catch (e) { await conn.rollback(); next(e); }
    finally { conn.release(); }
};

exports.activos = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.placa, r.hora_entrada, tv.nombre AS tipo, tv.categoria,
              e.codigo AS espacio
         FROM registros r
         JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
         LEFT JOIN espacios e ON e.id = r.espacio_id
        WHERE r.estado='activo'
        ORDER BY r.hora_entrada DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.historial = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, r.placa, r.hora_entrada, r.hora_salida, r.minutos_total,
              r.valor_pagar, r.descuento, r.estado, tv.nombre AS tipo,
              tk.codigo AS ticket_codigo
         FROM registros r
         JOIN tipos_vehiculo tv ON tv.id = r.tipo_vehiculo_id
         LEFT JOIN tickets tk ON tk.registro_id = r.id
        ORDER BY r.hora_entrada DESC LIMIT 200`
    );
    res.json(rows);
  } catch (e) { next(e); }
};

exports.buscarPorPlaca = async (req, res, next) => {
  try {
    const placa = String(req.params.placa).toUpperCase();
    const [[row]] = await db.query(
      `SELECT r.id, r.placa, r.hora_entrada, tv.nombre AS tipo
         FROM registros r JOIN tipos_vehiculo tv ON tv.id=r.tipo_vehiculo_id
        WHERE r.placa=:p AND r.estado='activo' LIMIT 1`, { p: placa }
    );
    if (!row) return res.status(404).json({ error: 'No hay vehículo activo con esa placa' });
    res.json(row);
  } catch (e) { next(e); }
};
