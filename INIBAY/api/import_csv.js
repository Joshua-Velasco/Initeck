import fs from 'fs';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';

async function importData() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'inibay_tvs',
    waitForConnections: true,
    connectionLimit: 10
  });

  const cleanBool = (val) => String(val).trim().toUpperCase() === 'VERDADERO';
  const cleanStr = (val) => {
      const v = String(val).trim();
      return (v === '#NOMBRE?' || !v || v === 'undefined') ? '' : v;
  };
  const cleanDate = (val) => {
      const v = String(val).trim();
      if (!v || v === '#NOMBRE?' || v === 'undefined') return null;
      const parts = v.split('/');
      if (parts.length === 3) {
          // Some dates might be d/m/yyyy, SQL expects YYYY-MM-DD
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return null;
  };
  const cleanFloat = (val) => {
      const v = String(val).trim().replace('$', '').replace(',', '');
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
  };
  const cleanInt = (val) => {
      const v = String(val).trim();
      const n = parseInt(v);
      return isNaN(n) ? 1 : n;
  };

  const processFile = async (filepath, tipoServicio) => {
      return new Promise((resolve) => {
          console.log(`Procesando ${filepath} como ${tipoServicio}...`);
          let rowCount = 0;
          const results = [];
          
          fs.createReadStream(filepath)
            .pipe(csv({ skipLines: 9 })) // Skip first 9 lines, line 10 is header
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                for(const row of results) {
                    const no_cliente = cleanStr(row['No CLIENTE']);
                    const nombre = cleanStr(row['NOMBRE DEL CLIENTE']);
                    
                    // Skip if both client number and name are empty/invalid
                    if (!no_cliente && !nombre) continue;

                    const estatus = cleanBool(row['ESTATUS']) ? 1 : 0;
                    const demo = cleanBool(row['DEMO']) ? 1 : 0;
                    const telefono = cleanStr(row['TELEFONO']);
                    const equipo_1 = cleanStr(row['EQUIPO']);
                    const tv_1 = cleanBool(row['TV 1']) ? 1 : 0;
                    const equipo_2 = cleanStr(row['EQUIPO 2']);
                    const tv_2 = cleanBool(row['TV 2']) ? 1 : 0;
                    const detalles = cleanStr(row['DETALLES']);
                    const fecha_activacion = cleanDate(row['FECHA DE ACTIVACION']);
                    const meses_activos = cleanInt(row['MESES ACTIVOS']);
                    const fecha_renovacion = cleanDate(row['FECHA DE RENOVACION']);
                    const costo = cleanFloat(row['COSTO']);

                    try {
                        const connection = await pool.getConnection();
                        await connection.beginTransaction();

                        let cliente_id;
                        let cid = no_cliente || `NC-${Math.floor(Math.random() * 100000)}`;

                        const [existing] = await connection.query('SELECT id FROM clientes WHERE no_cliente = ?', [cid]);
                        if (existing.length > 0) {
                            cliente_id = existing[0].id;
                            await connection.query('UPDATE clientes SET nombre=?, telefono=? WHERE id=?', [nombre, telefono, cliente_id]);
                        } else {
                            const [clientResult] = await connection.query(
                                'INSERT INTO clientes (no_cliente, nombre, telefono) VALUES (?, ?, ?)',
                                [cid, nombre, telefono]
                            );
                            cliente_id = clientResult.insertId;
                        }

                        // Check if subscription already inserted recently to avoid perfect dupes
                        const [existingSub] = await connection.query(
                            'SELECT id FROM suscripciones WHERE cliente_id = ? AND tipo_servicio = ? AND equipo_1 = ?', 
                            [cliente_id, tipoServicio, equipo_1]
                        );

                        await connection.query(`
                            INSERT INTO suscripciones 
                            (cliente_id, tipo_servicio, estatus, demo, equipo_1, tv_1, equipo_2, tv_2, detalles, fecha_activacion, meses_activos, fecha_renovacion, costo)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [cliente_id, tipoServicio, estatus, demo, equipo_1, tv_1, equipo_2, tv_2, detalles, fecha_activacion, meses_activos, fecha_renovacion, costo]);

                        await connection.commit();
                        connection.release();
                        rowCount++;
                    } catch (e) {
                         console.error("Error intertando fila:", row, e);
                    }
                }
                console.log(`Terminado ${filepath}. Insertados ${rowCount} registros.`);
                resolve();
            });
      });
  };

  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE pagos');
  await pool.query('TRUNCATE TABLE suscripciones');
  await pool.query('TRUNCATE TABLE clientes');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log("Tablas limpiadas.");

  await processFile('/Users/joshuavelasco/Documents/Tecno/INIBAY/ELITE.csv', 'ELITE');
  await processFile('/Users/joshuavelasco/Documents/Tecno/INIBAY/FUTURE.csv', 'FUTURE');
  
  console.log("¡Importación completa!");
  process.exit(0);
}

importData();
