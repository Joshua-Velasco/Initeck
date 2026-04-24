import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to calculate total revenue and format dashboard data
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [clientsRows] = await pool.query('SELECT COUNT(*) as total FROM clientes');
    const [subsRows] = await pool.query('SELECT COUNT(*) as active FROM suscripciones WHERE estatus = 1');
    const [revenueRows] = await pool.query('SELECT SUM(costo) as revenue FROM suscripciones WHERE estatus = 1');
    // Using mock growth logic for demonstration unless real historical data exists
    
    res.json({
      totalClients: clientsRows[0].total,
      activeSubscriptions: subsRows[0].active,
      monthlyRevenue: revenueRows[0].revenue || 0,
      weeklyGrowth: '+5.2%' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Chart data
app.get('/api/dashboard/chart-data', async (req, res) => {
  try {
    // For now, returning mocked data for the chart, as we don't have historical months in the DB yet
    const data = [
      { name: 'Ene', Elite: 4000, Future: 2400 },
      { name: 'Feb', Elite: 3000, Future: 1398 },
      { name: 'Mar', Elite: 2000, Future: 9800 },
    ];
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Subscriptions (Filtered by Elite or Future)
app.get('/api/subscriptions', async (req, res) => {
  const { type } = req.query; // 'ELITE' or 'FUTURE'
  
  try {
    let query = `
      SELECT s.*, c.no_cliente, c.nombre, c.telefono 
      FROM suscripciones s
      JOIN clientes c ON s.cliente_id = c.id
    `;
    const params = [];

    if (type) {
      query += ` WHERE s.tipo_servicio = ?`;
      params.push(type);
    }

    query += ` ORDER BY s.id DESC`;

    const [rows] = await pool.query(query, params);
    
    // Format boolean values
    const formattedRows = rows.map(row => ({
      ...row,
      estatus: Boolean(row.estatus),
      demo: Boolean(row.demo),
      tv_1: Boolean(row.tv_1),
      tv_2: Boolean(row.tv_2)
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error fetching subscriptions' });
  }
});

// Create Subscription
app.post('/api/subscriptions', async (req, res) => {
  const { no_cliente, nombre, telefono, tipo_servicio, estatus, demo, equipo_1, tv_1, equipo_2, tv_2, detalles, fecha_activacion, meses_activos, fecha_renovacion, costo } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Check if client exists by no_cliente
    let cliente_id;
    const [existing] = await connection.query('SELECT id FROM clientes WHERE no_cliente = ?', [no_cliente]);
    
    if (existing.length > 0) {
      cliente_id = existing[0].id;
      // Update client info just in case
      await connection.query('UPDATE clientes SET nombre=?, telefono=? WHERE id=?', [nombre, telefono, cliente_id]);
    } else {
      // Create new client
      const [clientResult] = await connection.query(
        'INSERT INTO clientes (no_cliente, nombre, telefono) VALUES (?, ?, ?)',
        [no_cliente, nombre, telefono]
      );
      cliente_id = clientResult.insertId;
    }

    // Insert Subscription
    const [subResult] = await connection.query(`
      INSERT INTO suscripciones 
      (cliente_id, tipo_servicio, estatus, demo, equipo_1, tv_1, equipo_2, tv_2, detalles, fecha_activacion, meses_activos, fecha_renovacion, costo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [cliente_id, tipo_servicio || 'ELITE', estatus ? 1 : 0, demo ? 1 : 0, equipo_1, tv_1 ? 1 : 0, equipo_2, tv_2 ? 1 : 0, detalles, fecha_activacion || null, meses_activos, fecha_renovacion || null, costo]);

    await connection.commit();
    res.json({ success: true, id: subResult.insertId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Database error creating subscription', details: error.message });
  } finally {
    connection.release();
  }
});

// Update Subscription
app.put('/api/subscriptions/:id', async (req, res) => {
  const subId = req.params.id;
  const { estatus, demo, equipo_1, tv_1, equipo_2, tv_2, detalles, fecha_activacion, meses_activos, fecha_renovacion, costo, nombre, telefono } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get cliente_id
    const [subs] = await connection.query('SELECT cliente_id FROM suscripciones WHERE id = ?', [subId]);
    if (subs.length > 0 && nombre) {
      await connection.query('UPDATE clientes SET nombre=?, telefono=? WHERE id=?', [nombre, telefono, subs[0].cliente_id]);
    }

    // Update sub
    await connection.query(`
      UPDATE suscripciones
      SET estatus=?, demo=?, equipo_1=?, tv_1=?, equipo_2=?, tv_2=?, detalles=?, fecha_activacion=?, meses_activos=?, fecha_renovacion=?, costo=?
      WHERE id=?
    `, [estatus ? 1 : 0, demo ? 1 : 0, equipo_1, tv_1 ? 1 : 0, equipo_2, tv_2 ? 1 : 0, detalles, fecha_activacion || null, meses_activos, fecha_renovacion || null, costo, subId]);

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Database error updating subscription', details: error.message });
  } finally {
    connection.release();
  }
});

// Delete Subscription
app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    // Delete payments first if they exist (foreign key constraint)
    await pool.query('DELETE FROM pagos WHERE suscripcion_id = ?', [req.params.id]);
    await pool.query('DELETE FROM suscripciones WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error deleting subscription', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
