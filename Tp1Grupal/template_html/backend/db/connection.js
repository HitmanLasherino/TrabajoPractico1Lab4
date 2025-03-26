const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión a la BD
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'empresasdb'
});

// Conectar a MySQL
connection.connect(error => {
    if (error) {
        console.error('Error conectando a la BD:', error);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = connection;
