const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || ''
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    console.log(`✓ Database '${process.env.DB_NAME}' ready`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('Database setup error:', error.message);
    await connection.end();
    return false;
  }
}

module.exports = setupDatabase;


