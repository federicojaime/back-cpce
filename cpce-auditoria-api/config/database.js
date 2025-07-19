const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cpce_auditoria',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Verificar la conexión
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexión a la base de datos establecida');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos:', err);
    });

module.exports = pool;