import mysql from 'mysql2/promise';
async function reset() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'inibay_tvs'});
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('TRUNCATE TABLE pagos');
  await conn.query('TRUNCATE TABLE suscripciones');
  await conn.query('TRUNCATE TABLE clientes');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log("Truncado exitoso");
  process.exit(0);
}
reset();
